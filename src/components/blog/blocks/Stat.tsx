import { toSafeExternalHref } from '@/lib/url-safety'

export default function Stat({
  value,
  label,
  sourceHref,
  sourceLabel,
}: {
  value: string
  label: string
  sourceHref?: string
  sourceLabel?: string
}) {
  const safeSourceHref = sourceHref ? toSafeExternalHref(sourceHref) : null

  return (
    <div className="blog-stat">
      <div className="blog-stat-value">{value}</div>
      <div className="blog-stat-label">{label}</div>
      {safeSourceHref && sourceLabel
        ? (
            <a
              href={safeSourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="blog-stat-source"
            >
              <span aria-hidden="true">↗</span>
              {sourceLabel}
            </a>
          )
        : null}
    </div>
  )
}
