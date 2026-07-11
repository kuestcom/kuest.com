import type { BlogFrontmatter } from "./frontmatter";
import type { SupportedLocale } from "@/i18n/locales";
import { parse as parseYaml } from "yaml";
import { SUPPORTED_LOCALES } from "@/i18n/locales";
import { parseFrontmatter } from "./frontmatter";
import { computeReadingTime } from "./reading-time";

export interface BlogPost {
  slug: string;
  contentSlug: string;
  locale: SupportedLocale;
  frontmatter: BlogFrontmatter;
  source: string;
  readingTime: number;
  lastModified: Date | undefined;
  availableLocales: SupportedLocale[];
  localizedSlugs: Partial<Record<SupportedLocale, string>>;
}

export type BlogPostSummary = Omit<BlogPost, "source">;
export const BLOG_POSTS_PER_PAGE = 12;

const rawPostModules = import.meta.glob("/content/blog/**/*.mdx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
const POST_PATH = /\/content\/blog\/([^/]+)\/([^/]+)\.mdx$/;

function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[’']/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

function decodeSlugSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeSlugForLookup(value: string): string {
  return decodeSlugSegment(value).trim().toLowerCase().normalize("NFKC");
}

function normalizeAsciiSlugForLookup(value: string): string {
  return normalizeSlugForLookup(value)
    .normalize("NFKD")
    .replace(/\p{Mark}+/gu, "");
}

function buildLocalizedSlug(frontmatter: BlogFrontmatter, fallback: string): string {
  const base = frontmatter.slug?.trim() || frontmatter.title;
  return slugify(base) || slugify(fallback) || fallback;
}

interface LoadedPost {
  slugCandidate: string;
  contentSlug: string;
  locale: SupportedLocale;
  frontmatter: BlogFrontmatter;
  source: string;
  readingTime: number;
  lastModified: Date | undefined;
}

function loadPosts(): BlogPost[] {
  const loaded: LoadedPost[] = [];
  for (const [path, raw] of Object.entries(rawPostModules)) {
    const match = path.match(POST_PATH);
    if (!match || !isSupportedLocale(match[1])) {
      continue;
    }
    const locale = match[1];
    const contentSlug = match[2];
    const boundary = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!boundary) {
      throw new Error(`Missing frontmatter in ${path}`);
    }
    const source = raw.slice(boundary[0].length);
    const frontmatter = parseFrontmatter(contentSlug, locale, parseYaml(boundary[1]));
    loaded.push({
      slugCandidate: buildLocalizedSlug(frontmatter, contentSlug),
      contentSlug,
      locale,
      frontmatter,
      source,
      readingTime: computeReadingTime(source),
      lastModified: frontmatter.updatedAt ?? frontmatter.publishedAt,
    });
  }

  const collisionCounts = new Map<string, number>();
  for (const post of loaded) {
    const key = `${post.locale}:${post.slugCandidate}`;
    collisionCounts.set(key, (collisionCounts.get(key) ?? 0) + 1);
  }
  const withSlugs = loaded.map((post) => ({
    ...post,
    slug:
      (collisionCounts.get(`${post.locale}:${post.slugCandidate}`) ?? 0) > 1
        ? `${post.slugCandidate}-${post.contentSlug}`
        : post.slugCandidate,
  }));
  const groups = new Map<string, typeof withSlugs>();
  for (const post of withSlugs) {
    const group = groups.get(post.contentSlug) ?? [];
    group.push(post);
    groups.set(post.contentSlug, group);
  }

  return withSlugs.map((post) => {
    const siblings = groups.get(post.contentSlug) ?? [];
    return {
      ...post,
      availableLocales: siblings.map((item) => item.locale).toSorted(),
      localizedSlugs: Object.fromEntries(
        siblings.map((item) => [item.locale, item.slug]),
      ) as Partial<Record<SupportedLocale, string>>,
    };
  });
}

const allPosts = loadPosts();

function isPublished(post: { frontmatter: BlogFrontmatter }): boolean {
  return (
    !post.frontmatter.draft &&
    (import.meta.env.DEV || post.frontmatter.publishedAt.getTime() <= Date.now())
  );
}

export function getPost(slug: string, locale: SupportedLocale): BlogPost | null {
  const localePosts = allPosts.filter((entry) => entry.locale === locale);
  const decoded = decodeSlugSegment(slug);
  const normalized = normalizeSlugForLookup(slug);
  const ascii = normalizeAsciiSlugForLookup(slug);
  const post =
    localePosts.find((entry) => entry.slug === slug || entry.slug === decoded) ??
    localePosts.find((entry) => entry.contentSlug === slug || entry.contentSlug === decoded) ??
    localePosts.find(
      (entry) =>
        normalizeSlugForLookup(entry.slug) === normalized ||
        normalizeSlugForLookup(entry.contentSlug) === normalized,
    ) ??
    localePosts.find(
      (entry) =>
        normalizeAsciiSlugForLookup(entry.slug) === ascii ||
        normalizeAsciiSlugForLookup(entry.contentSlug) === ascii,
    );

  return post && isPublished(post) ? post : null;
}

export function listPosts(locale: SupportedLocale): BlogPostSummary[] {
  return allPosts
    .filter((post) => post.locale === locale && isPublished(post))
    .map(({ source: _source, ...summary }) => summary)
    .toSorted((a, b) => b.frontmatter.publishedAt.getTime() - a.frontmatter.publishedAt.getTime());
}

export function listPostStaticParams() {
  return allPosts.filter(isPublished).map((post) => ({ locale: post.locale, slug: post.slug }));
}

export interface BlogPostSitemapEntry {
  contentSlug: string;
  locales: SupportedLocale[];
  localizedSlugs: Partial<Record<SupportedLocale, string>>;
  lastModified: Date | undefined;
}

export function listPostSitemapEntries(): BlogPostSitemapEntry[] {
  const grouped = new Map<string, BlogPost[]>();
  for (const post of allPosts.filter(isPublished)) {
    const group = grouped.get(post.contentSlug) ?? [];
    group.push(post);
    grouped.set(post.contentSlug, group);
  }
  return [...grouped]
    .map(([contentSlug, posts]) => ({
      contentSlug,
      locales: posts.map((post) => post.locale).toSorted(),
      localizedSlugs: Object.fromEntries(posts.map((post) => [post.locale, post.slug])),
      lastModified: posts
        .map((post) => post.lastModified)
        .filter((date): date is Date => Boolean(date))
        .toSorted((a, b) => b.getTime() - a.getTime())[0],
    }))
    .toSorted((a, b) => a.contentSlug.localeCompare(b.contentSlug));
}
