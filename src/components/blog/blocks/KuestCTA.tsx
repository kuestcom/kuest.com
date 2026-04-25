import { ChevronRightIcon } from 'lucide-react'
import { toSafeHref } from '@/lib/url-safety'

export default function KuestCTA({
  headline,
  body,
  primary,
  secondary,
}: {
  headline: string
  body?: string
  primary: { href: string, label: string }
  secondary?: { href: string, label: string }
}) {
  const primaryHref = toSafeHref(primary.href)
  const secondaryHref = secondary ? toSafeHref(secondary.href) : null

  return (
    <aside className="blog-cta">
      <h3 className="blog-cta-headline">{headline}</h3>
      {body ? <p className="blog-cta-body">{body}</p> : null}
      <div className="cta-btns">
        <a href={primaryHref ?? '#'} className="btn-cta btn-cta-primary">
          <span className="cta-label">{primary.label}</span>
          <ChevronRightIcon />
        </a>
        {secondary && secondaryHref
          ? (
              <a href={secondaryHref} className="btn-cta btn-cta-secondary">
                <span className="cta-label">{secondary.label}</span>
                <ChevronRightIcon />
              </a>
            )
          : null}
      </div>
    </aside>
  )
}
