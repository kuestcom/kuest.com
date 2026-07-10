import type { BlogPostSummary } from '@/lib/blog/content'
import { ArrowRightIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default function BlogPostFooter({
  related,
  backLabel,
  relatedLabel,
  relatedDateLabels,
}: {
  related: BlogPostSummary[]
  backLabel: string
  relatedLabel: string
  relatedDateLabels: Record<string, string>
}) {
  if (related.length === 0) {
    return null
  }

  return (
    <div className="blog-footer">
      <div className="blog-related-head">
        <span className="slbl">{relatedLabel}</span>
        <Link href="/blog" className="blog-related-back">
          {backLabel}
          <ArrowRightIcon size={14} strokeWidth={2.25} />
        </Link>
      </div>
      <ul className="blog-related-grid">
        {related.map(post => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="blog-related-card">
              <span className="blog-related-card-date">{relatedDateLabels[post.slug]}</span>
              <span className="blog-related-card-title">{post.frontmatter.title}</span>
              <span className="blog-related-card-arrow" aria-hidden="true">
                <ArrowRightIcon size={14} strokeWidth={2.25} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
