'use client'

import { MonitorSmartphone } from 'lucide-react'
import { useState, useSyncExternalStore } from 'react'

const MOBILE_PREVIEW_QUERY = '(max-width: 768px)'

function subscribeToMobilePreview(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_PREVIEW_QUERY)
  mediaQuery.addEventListener('change', onStoreChange)

  return () => {
    mediaQuery.removeEventListener('change', onStoreChange)
  }
}

function getMobilePreviewSnapshot() {
  return window.matchMedia(MOBILE_PREVIEW_QUERY).matches
}

function getServerMobilePreviewSnapshot() {
  return false
}

export default function SitePreview({
  href,
  label,
  iframeSrc,
  switchToDesktopLabel,
  switchToMobileLabel,
  liveLabel,
  className,
}: {
  href: string
  label: string
  iframeSrc: string
  switchToDesktopLabel: string
  switchToMobileLabel: string
  liveLabel: string
  className?: string
}) {
  const forcedMobile = useSyncExternalStore(
    subscribeToMobilePreview,
    getMobilePreviewSnapshot,
    getServerMobilePreviewSnapshot,
  )
  const [manualMobile, setManualMobile] = useState(false)

  const isMobile = forcedMobile || manualMobile
  const toggleLabel = isMobile ? switchToDesktopLabel : switchToMobileLabel
  const previewClassName = [
    'site-preview',
    'scroll-mt-24',
    isMobile ? 'is-mobile' : '',
    forcedMobile ? 'is-forced-mobile' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={previewClassName} id="sitePreview">
      <div className="site-preview-head">
        <div className="site-preview-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <a href={href} target="_blank" rel="noopener noreferrer" className="site-preview-url">
          {label}
        </a>
        <span className="site-preview-live">
          <span className="site-preview-live-dot" />
          {liveLabel}
        </span>
        <button
          type="button"
          className="site-preview-mode-btn"
          id="sitePreviewModeBtn"
          aria-label={toggleLabel}
          aria-pressed={isMobile}
          title={toggleLabel}
          hidden={forcedMobile}
          aria-hidden={forcedMobile}
          onClick={() => {
            if (!forcedMobile) {
              setManualMobile(current => !current)
            }
          }}
        >
          <MonitorSmartphone />
        </button>
      </div>
      <div className="site-preview-body">
        <iframe
          id="sitePreviewFrame"
          className="site-preview-frame"
          title="Kuest live site preview"
          loading="lazy"
          src={iframeSrc}
          sandbox="allow-scripts allow-forms allow-popups"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  )
}
