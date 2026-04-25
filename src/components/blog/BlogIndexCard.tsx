import type { BlogPostSummary } from '@/lib/blog/content'
import { ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

export default function BlogIndexCard({
  post,
  coverSrc,
  dateLabel,
  readingTimeLabel,
  variant = 'default',
  readMoreLabel,
}: {
  post: BlogPostSummary
  coverSrc: string
  dateLabel: string
  readingTimeLabel: string
  variant?: 'default' | 'featured'
  readMoreLabel?: string
}) {
  const tag = post.frontmatter.tags[0]
  const className = variant === 'featured' ? 'blog-card blog-card-featured' : 'blog-card'
  const coverSizes
    = variant === 'featured'
      ? '(max-width: 768px) 100vw, 60vw'
      : '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw'

  return (
    <Link href={`/blog/${post.slug}`} className={className}>
      <figure className="blog-card-cover">
        <Image
          src={coverSrc}
          alt=""
          fill
          sizes={coverSizes}
          priority={variant === 'featured'}
        />
      </figure>
      <div className="blog-card-body">
        <div className="blog-card-meta">
          {tag ? <span className="blog-tag">{tag}</span> : null}
          <time dateTime={post.frontmatter.publishedAt.toISOString()}>{dateLabel}</time>
          <span className="blog-card-meta-divider" aria-hidden="true">·</span>
          <span>{readingTimeLabel}</span>
        </div>
        {variant === 'featured'
          ? <h2 className="blog-card-title">{post.frontmatter.title}</h2>
          : <h3 className="blog-card-title">{post.frontmatter.title}</h3>}
        <p className="blog-card-excerpt">{post.frontmatter.description}</p>
        {variant === 'featured' && readMoreLabel
          ? (
              <span className="blog-card-cta">
                {readMoreLabel}
                <ArrowRightIcon size={14} strokeWidth={2.25} />
              </span>
            )
          : null}
      </div>
    </Link>
  )
}
