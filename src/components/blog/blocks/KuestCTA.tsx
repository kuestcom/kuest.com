import { ChevronRightIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { toSafeHref } from '@/lib/url-safety'

interface CtaLink {
  href: string
  label: string
}

function renderCtaLink(link: CtaLink, className: string, isPrimary: boolean) {
  const safeHref = toSafeHref(link.href)
  if (!safeHref) {
    if (!isPrimary) {
      return null
    }
    return (
      <span className={`${className} is-disabled`} aria-disabled="true">
        <span className="cta-label">{link.label}</span>
        <ChevronRightIcon />
      </span>
    )
  }

  if (safeHref.startsWith('/')) {
    return (
      <Link href={safeHref as never} className={className}>
        <span className="cta-label">{link.label}</span>
        <ChevronRightIcon />
      </Link>
    )
  }

  if (/^https?:\/\//i.test(safeHref)) {
    return (
      <a href={safeHref} className={className} target="_blank" rel="noopener noreferrer">
        <span className="cta-label">{link.label}</span>
        <ChevronRightIcon />
      </a>
    )
  }

  return (
    <a href={safeHref} className={className}>
      <span className="cta-label">{link.label}</span>
      <ChevronRightIcon />
    </a>
  )
}

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
  return (
    <aside className="blog-cta">
      <h3 className="blog-cta-headline">{headline}</h3>
      {body ? <p className="blog-cta-body">{body}</p> : null}
      <div className="cta-btns">
        {renderCtaLink(primary, 'btn-cta btn-cta-primary', true)}
        {secondary
          ? renderCtaLink(secondary, 'btn-cta btn-cta-secondary', false)
          : null}
      </div>
    </aside>
  )
}
