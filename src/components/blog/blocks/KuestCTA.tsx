import { ChevronRightIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface CtaLink {
  href: string
  label: string
}

function isInternalPageHref(href: string): boolean {
  return href.startsWith('/')
    && !href.startsWith('/api/')
    && !href.startsWith('/_next/')
    && !/\.[a-z0-9]+(?:[?#]|$)/i.test(href)
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href)
}

function CtaButton({
  cta,
  className,
}: {
  cta: CtaLink
  className: string
}) {
  const content = (
    <>
      <span className="cta-label">{cta.label}</span>
      <ChevronRightIcon />
    </>
  )

  if (isInternalPageHref(cta.href)) {
    return (
      <Link href={cta.href as never} className={className}>
        {content}
      </Link>
    )
  }

  if (isExternalHref(cta.href)) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    )
  }

  return (
    <a href={cta.href} className={className}>
      {content}
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
  primary: CtaLink
  secondary?: CtaLink
}) {
  return (
    <aside className="blog-cta">
      <h3 className="blog-cta-headline">{headline}</h3>
      {body ? <p className="blog-cta-body">{body}</p> : null}
      <div className="cta-btns">
        <CtaButton cta={primary} className="btn-cta btn-cta-primary" />
        {secondary
          ? (
              <CtaButton cta={secondary} className="btn-cta btn-cta-secondary" />
            )
          : null}
      </div>
    </aside>
  )
}
