import type { BlogFrontmatter } from './frontmatter'
import type { SupportedLocale } from '@/i18n/locales'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { isSupportedLocale } from '@/i18n/locales'
import { parseFrontmatter } from './frontmatter'
import { computeReadingTime } from './reading-time'

export interface BlogPost {
  slug: string
  locale: SupportedLocale
  frontmatter: BlogFrontmatter
  source: string
  readingTime: number
  lastModified: Date | undefined
  availableLocales: SupportedLocale[]
}

export type BlogPostSummary = Omit<BlogPost, 'source'>

const BLOG_DIR = join(process.cwd(), 'content', 'blog')
const POST_FILE_PATTERN = /^(.+)\.mdx$/

export const BLOG_POSTS_PER_PAGE = 12

interface PostFileEntry {
  slug: string
  locale: SupportedLocale
  filePath: string
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
      const slug = match[1]
      entries.push({ slug, locale, filePath: join(localePath, fileDirent.name) })
    }
  }
  return entries
}

function readLastCommitDate(filePath: string): Date | undefined {
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', filePath],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim()
    if (out) {
      return new Date(out)
    }
  }
  catch {
    // git unavailable or untracked file
  }
  try {
    return statSync(filePath).mtime
  }
  catch {
    return undefined
  }
}

function loadPostFromEntry(entry: PostFileEntry, allEntries: PostFileEntry[]): BlogPost {
  const raw = readFileSync(entry.filePath, 'utf8')
  const { data, content } = matter(raw)
  const frontmatter = parseFrontmatter(entry.slug, entry.locale, data)
  const availableLocales = allEntries
    .filter(e => e.slug === entry.slug)
    .map(e => e.locale)
    .toSorted()
  return {
    slug: entry.slug,
    locale: entry.locale,
    frontmatter,
    source: content,
    readingTime: computeReadingTime(content),
    lastModified: readLastCommitDate(entry.filePath),
    availableLocales,
  }
}

const BUILD_TIME = Date.now()

function isPublished(post: { frontmatter: BlogFrontmatter }): boolean {
  if (post.frontmatter.draft) {
    return false
  }
  return process.env.NODE_ENV !== 'production' || post.frontmatter.publishedAt.getTime() <= BUILD_TIME
}

export function getPost(slug: string, locale: SupportedLocale): BlogPost | null {
  const all = listPostFiles()
  const entry = all.find(e => e.slug === slug && e.locale === locale)
  if (!entry) {
    return null
  }
  const post = loadPostFromEntry(entry, all)
  if (!isPublished(post)) {
    return null
  }
  return post
}

export function listPosts(locale: SupportedLocale): BlogPostSummary[] {
  const all = listPostFiles()
  return all
    .filter(e => e.locale === locale)
    .map((entry) => {
      const { source: _source, ...summary } = loadPostFromEntry(entry, all)
      return summary
    })
    .filter(isPublished)
    .toSorted((a, b) => b.frontmatter.publishedAt.getTime() - a.frontmatter.publishedAt.getTime())
}

export function listPostStaticParams(): { locale: SupportedLocale, slug: string }[] {
  const all = listPostFiles()
  return all
    .map((entry) => {
      const post = loadPostFromEntry(entry, all)
      return { post, locale: entry.locale, slug: entry.slug }
    })
    .filter(({ post }) => isPublished(post))
    .map(({ locale, slug }) => ({ locale, slug }))
}

export interface BlogPostSitemapEntry {
  slug: string
  locales: SupportedLocale[]
  lastModified: Date | undefined
}

export function listPostSitemapEntries(): BlogPostSitemapEntry[] {
  const all = listPostFiles()
  const groupedBySlug = new Map<string, PostFileEntry[]>()
  for (const entry of all) {
    const list = groupedBySlug.get(entry.slug) ?? []
    list.push(entry)
    groupedBySlug.set(entry.slug, list)
  }

  const out: BlogPostSitemapEntry[] = []
  for (const [slug, entries] of groupedBySlug) {
    const localesPublished: SupportedLocale[] = []
    let mostRecent: Date | undefined
    for (const entry of entries) {
      const post = loadPostFromEntry(entry, all)
      if (!isPublished(post)) {
        continue
      }
      localesPublished.push(entry.locale)
      const date = post.lastModified
      if (date && (!mostRecent || date > mostRecent)) {
        mostRecent = date
      }
    }
    if (localesPublished.length > 0) {
      out.push({ slug, locales: localesPublished.toSorted(), lastModified: mostRecent })
    }
  }
  return out.toSorted((a, b) => a.slug.localeCompare(b.slug))
}
