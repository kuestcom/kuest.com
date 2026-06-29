import type { BlogFrontmatter } from './frontmatter'
import type { SupportedLocale } from '@/i18n/locales'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { SUPPORTED_LOCALES } from '@/i18n/locales'
import { parseFrontmatter } from './frontmatter'
import { computeReadingTime } from './reading-time'

export interface BlogPost {
  slug: string
  contentSlug: string
  locale: SupportedLocale
  frontmatter: BlogFrontmatter
  source: string
  readingTime: number
  lastModified: Date | undefined
  availableLocales: SupportedLocale[]
  localizedSlugs: Partial<Record<SupportedLocale, string>>
}

export type BlogPostSummary = Omit<BlogPost, 'source'>

const BLOG_RELATIVE_DIR = join('content', 'blog')
const BLOG_DIR = join(process.cwd(), 'content', 'blog')
const POST_FILE_PATTERN = /^(.+)\.mdx$/
const COMMIT_DATE_PREFIX = '__COMMIT__'

export const BLOG_POSTS_PER_PAGE = 12
const SHOULD_CACHE_POSTS = process.env.NODE_ENV === 'production'
let lastCommitDateCache: Map<string, Date> | undefined

interface PostFileEntry {
  contentSlug: string
  locale: SupportedLocale
  relativeFilePath: string
  filePath: string
}

interface LoadedPost {
  slugCandidate: string
  contentSlug: string
  locale: SupportedLocale
  frontmatter: BlogFrontmatter
  source: string
  readingTime: number
  lastModified: Date | undefined
}

function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

function listPostFiles(): PostFileEntry[] {
  if (!existsSync(BLOG_DIR)) {
    return []
  }
  const entries: PostFileEntry[] = []
  for (const localeDirent of readdirSync(BLOG_DIR, { withFileTypes: true })) {
    if (!localeDirent.isDirectory()) {
      continue
    }
    const locale = localeDirent.name
    if (!isSupportedLocale(locale)) {
      continue
    }
    const localePath = join(BLOG_DIR, locale)
    for (const fileDirent of readdirSync(localePath, { withFileTypes: true })) {
      if (!fileDirent.isFile()) {
        continue
      }
      const match = fileDirent.name.match(POST_FILE_PATTERN)
      if (!match) {
        continue
      }
      const contentSlug = match[1]
      entries.push({
        contentSlug,
        locale,
        relativeFilePath: join(BLOG_RELATIVE_DIR, locale, fileDirent.name),
        filePath: join(localePath, fileDirent.name),
      })
    }
  }
  return entries
}

function readLastCommitDates(): Map<string, Date> {
  if (SHOULD_CACHE_POSTS && lastCommitDateCache) {
    return lastCommitDateCache
  }

  const dates = new Map<string, Date>()

  try {
    const out = execFileSync(
      'git',
      ['log', `--format=${COMMIT_DATE_PREFIX}%cI`, '--name-only', '--', BLOG_RELATIVE_DIR],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    )
    let commitDate: Date | undefined
    for (const line of out.split(/\r?\n/)) {
      if (line.startsWith(COMMIT_DATE_PREFIX)) {
        const date = new Date(line.slice(COMMIT_DATE_PREFIX.length))
        commitDate = Number.isNaN(date.getTime()) ? undefined : date
        continue
      }

      if (!line || !commitDate) {
        continue
      }

      if (!dates.has(line)) {
        dates.set(line, commitDate)
      }
    }
  }
  catch {
    // git unavailable
  }

  if (SHOULD_CACHE_POSTS) {
    lastCommitDateCache = dates
  }
  return dates
}

function readLastCommitDate(relativeFilePath: string, filePath: string): Date | undefined {
  const commitDate = readLastCommitDates().get(relativeFilePath)
  if (commitDate) {
    return commitDate
  }

  try {
    return statSync(filePath).mtime
  }
  catch {
    return undefined
  }
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[’']/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

  return slug
    .slice(0, 120)
    .replace(/-+$/g, '')
}

function decodeSlugSegment(value: string): string {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

function normalizeSlugForLookup(value: string): string {
  return decodeSlugSegment(value)
    .trim()
    .toLowerCase()
    .normalize('NFKC')
}

function normalizeAsciiSlugForLookup(value: string): string {
  return normalizeSlugForLookup(value)
    .normalize('NFKD')
    .replace(/\p{Mark}+/gu, '')
}

function buildLocalizedSlug(frontmatter: BlogFrontmatter, fallback: string): string {
  const base = frontmatter.slug?.trim() || frontmatter.title
  return slugify(base) || slugify(fallback) || fallback
}

function loadPostFromEntry(entry: PostFileEntry): LoadedPost {
  const raw = readFileSync(entry.filePath, 'utf8')
  const { data, content } = matter(raw)
  const frontmatter = parseFrontmatter(entry.contentSlug, entry.locale, data)

  return {
    slugCandidate: buildLocalizedSlug(frontmatter, entry.contentSlug),
    contentSlug: entry.contentSlug,
    locale: entry.locale,
    frontmatter,
    source: content,
    readingTime: computeReadingTime(content),
    lastModified: readLastCommitDate(entry.relativeFilePath, entry.filePath),
  }
}

function resolveLocaleSlugCollisions(posts: LoadedPost[]): Array<LoadedPost & { slug: string }> {
  const keyCount = new Map<string, number>()
  for (const post of posts) {
    const key = `${post.locale}:${post.slugCandidate}`
    keyCount.set(key, (keyCount.get(key) ?? 0) + 1)
  }

  return posts.map((post) => {
    const key = `${post.locale}:${post.slugCandidate}`
    const hasCollision = (keyCount.get(key) ?? 0) > 1
    return {
      ...post,
      slug: hasCollision ? `${post.slugCandidate}-${post.contentSlug}` : post.slugCandidate,
    }
  })
}

let allPostsCache: BlogPost[] | undefined

function readAllPosts(): BlogPost[] {
  const rawPosts = resolveLocaleSlugCollisions(listPostFiles().map(loadPostFromEntry))
  const groupedByContentSlug = new Map<string, Array<LoadedPost & { slug: string }>>()

  for (const post of rawPosts) {
    const list = groupedByContentSlug.get(post.contentSlug) ?? []
    list.push(post)
    groupedByContentSlug.set(post.contentSlug, list)
  }

  return rawPosts.map((post) => {
    const siblings = groupedByContentSlug.get(post.contentSlug) ?? []
    const availableLocales = siblings
      .map(sibling => sibling.locale)
      .toSorted()

    const localizedSlugs = Object.fromEntries(
      siblings.map(sibling => [sibling.locale, sibling.slug]),
    ) as Partial<Record<SupportedLocale, string>>

    return {
      slug: post.slug,
      contentSlug: post.contentSlug,
      locale: post.locale,
      frontmatter: post.frontmatter,
      source: post.source,
      readingTime: post.readingTime,
      lastModified: post.lastModified,
      availableLocales,
      localizedSlugs,
    }
  })
}

function loadAllPosts(): BlogPost[] {
  if (!SHOULD_CACHE_POSTS) {
    return readAllPosts()
  }

  allPostsCache ??= readAllPosts()
  return allPostsCache
}

function isPublished(post: { frontmatter: BlogFrontmatter }): boolean {
  if (post.frontmatter.draft) {
    return false
  }
  return process.env.NODE_ENV !== 'production' || post.frontmatter.publishedAt.getTime() <= Date.now()
}

export function getPost(slug: string, locale: SupportedLocale): BlogPost | null {
  const localePosts = loadAllPosts().filter(entry => entry.locale === locale)
  const decodedSlug = decodeSlugSegment(slug)
  const normalizedSlug = normalizeSlugForLookup(slug)
  const normalizedAsciiSlug = normalizeAsciiSlugForLookup(slug)

  const post = localePosts.find(entry => entry.slug === slug || entry.slug === decodedSlug)
    ?? localePosts.find(entry => entry.contentSlug === slug || entry.contentSlug === decodedSlug)
    ?? localePosts.find(
      entry => normalizeSlugForLookup(entry.slug) === normalizedSlug
        || normalizeSlugForLookup(entry.contentSlug) === normalizedSlug,
    )
    ?? localePosts.find(
      entry => normalizeAsciiSlugForLookup(entry.slug) === normalizedAsciiSlug
        || normalizeAsciiSlugForLookup(entry.contentSlug) === normalizedAsciiSlug,
    )
    ?? localePosts.find(
      entry => normalizeSlugForLookup(buildLocalizedSlug(entry.frontmatter, entry.contentSlug)) === normalizedSlug,
    )
    ?? localePosts.find(
      entry => normalizeAsciiSlugForLookup(buildLocalizedSlug(entry.frontmatter, entry.contentSlug)) === normalizedAsciiSlug,
    )

  if (!post || !isPublished(post)) {
    return null
  }
  return post
}

export function listPosts(locale: SupportedLocale): BlogPostSummary[] {
  return loadAllPosts()
    .filter(post => post.locale === locale)
    .filter(isPublished)
    .map((post) => {
      const { source: _source, ...summary } = post
      return summary
    })
    .toSorted((a, b) => b.frontmatter.publishedAt.getTime() - a.frontmatter.publishedAt.getTime())
}

export function listPostStaticParams(): { locale: SupportedLocale, slug: string }[] {
  return loadAllPosts()
    .filter(isPublished)
    .map(post => ({ locale: post.locale, slug: post.slug }))
}

export interface BlogPostSitemapEntry {
  contentSlug: string
  locales: SupportedLocale[]
  localizedSlugs: Partial<Record<SupportedLocale, string>>
  lastModified: Date | undefined
}

export function listPostSitemapEntries(): BlogPostSitemapEntry[] {
  const grouped = new Map<string, BlogPost[]>()

  for (const post of loadAllPosts().filter(isPublished)) {
    const list = grouped.get(post.contentSlug) ?? []
    list.push(post)
    grouped.set(post.contentSlug, list)
  }

  const out: BlogPostSitemapEntry[] = []

  for (const [contentSlug, posts] of grouped) {
    const locales = posts.map(post => post.locale).toSorted()
    const localizedSlugs = Object.fromEntries(
      posts.map(post => [post.locale, post.slug]),
    ) as Partial<Record<SupportedLocale, string>>

    const lastModified = posts
      .map(post => post.lastModified)
      .filter((date): date is Date => Boolean(date))
      .toSorted((a, b) => b.getTime() - a.getTime())[0]

    out.push({ contentSlug, locales, localizedSlugs, lastModified })
  }

  return out.toSorted((a, b) => a.contentSlug.localeCompare(b.contentSlug))
}
