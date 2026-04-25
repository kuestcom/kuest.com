import type { ReactNode } from 'react'
import { AlertTriangleIcon, InfoIcon, LightbulbIcon, XCircleIcon } from 'lucide-react'

type CalloutType = 'info' | 'tip' | 'warning' | 'error'

const ICONS: Record<CalloutType, typeof InfoIcon> = {
  info: InfoIcon,
  tip: LightbulbIcon,
  warning: AlertTriangleIcon,
  error: XCircleIcon,
}

function isCalloutType(value: unknown): value is CalloutType {
  return typeof value === 'string' && Object.hasOwn(ICONS, value)
}

export default function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: CalloutType
  title?: string
  children: ReactNode
}) {
  const resolvedType = isCalloutType(type) ? type : 'info'
  const Icon = ICONS[resolvedType]

  return (
    <aside className="blog-callout" data-type={resolvedType}>
      <span className="blog-callout-icon" aria-hidden="true">
        <Icon size={15} strokeWidth={2.25} />
      </span>
      <div className="blog-callout-body">
        {title ? <div className="blog-callout-title">{title}</div> : null}
        <div className="blog-callout-content">{children}</div>
      </div>
    </aside>
  )
}
