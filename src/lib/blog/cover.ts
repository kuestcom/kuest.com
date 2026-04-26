import type { BlogPost, BlogPostSummary } from './content'

const PLACEHOLDER_COVER = '/assets/blog/placeholder.svg'

export function getPostCoverSrc(post: BlogPost | BlogPostSummary): string {
  const cover = post.frontmatter.cover
  if (!cover) {
    return PLACEHOLDER_COVER
  }
  if (/^https?:\/\//.test(cover) || cover.startsWith('/')) {
    return cover
  }
  if (cover.startsWith('./')) {
    return `/blog-assets/${post.contentSlug}/${cover.slice(2)}`
  }
  return `/blog-assets/${post.contentSlug}/${cover}`
}
