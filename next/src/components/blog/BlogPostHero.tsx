import type { BlogPost, BlogPostSummary } from '@/lib/blog/content'
import { ArrowLeftIcon } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]
  if (!first) {
    return 'K'
  }
  if (parts.length === 1) {
    return first.slice(0, 2).toUpperCase()
  }
  const last = parts.at(-1) ?? first
  return (first[0] + last[0]).toUpperCase()
}

export default function BlogPostHero({
  post,
  coverSrc,
  dateLabel,
  readingTimeLabel,
  backLabel,
}: {
  post: BlogPost | BlogPostSummary
  coverSrc: string
  dateLabel: string
  readingTimeLabel: string
  backLabel: string
}) {
  const tag = post.frontmatter.tags[0]
  const author = post.frontmatter.author
  const initials = getInitials(author.name)

  return (
    <header className="blog-post-hero">
      <div className="blog-post-hero-bar">
        <Link href="/blog" className="blog-post-back">
          <ArrowLeftIcon size={14} strokeWidth={2.25} />
          {backLabel}
        </Link>
        {tag ? <span className="blog-tag">{tag}</span> : null}
      </div>

      <h1 className="blog-post-title">{post.frontmatter.title}</h1>

      <p className="blog-post-sub">{post.frontmatter.description}</p>

      <div className="blog-post-meta">
        <span className="blog-post-author">
          {author.avatar
            ? (
                <Image
                  src={author.avatar}
                  alt=""
                  width={28}
                  height={28}
                  className="blog-post-author-avatar"
                />
              )
            : (
                <span aria-hidden="true" className="blog-post-author-initials">
                  {initials}
                </span>
              )}
          <span className="blog-post-author-name">{author.name}</span>
        </span>
        <span className="blog-post-meta-divider" aria-hidden="true">·</span>
        <time dateTime={post.frontmatter.publishedAt.toISOString()}>{dateLabel}</time>
        <span className="blog-post-meta-divider" aria-hidden="true">·</span>
        <span>{readingTimeLabel}</span>
      </div>

      <figure className="blog-post-cover">
        <Image
          src={coverSrc}
          alt={post.frontmatter.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 720px"
        />
      </figure>
    </header>
  )
}
