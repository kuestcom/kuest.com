import { ChevronRightIcon } from 'lucide-react'

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
        <a href={primary.href} className="btn-cta btn-cta-primary">
          <span className="cta-label">{primary.label}</span>
          <ChevronRightIcon />
        </a>
        {secondary
          ? (
              <a href={secondary.href} className="btn-cta btn-cta-secondary">
                <span className="cta-label">{secondary.label}</span>
                <ChevronRightIcon />
              </a>
            )
          : null}
      </div>
    </aside>
  )
}
