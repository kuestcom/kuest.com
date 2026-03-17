"use client";

import { MonitorSmartphone } from "lucide-react";
import { useEffect, useState } from "react";

export function SitePreview({
  href,
  label,
  iframeSrc,
  switchToDesktopLabel,
  switchToMobileLabel,
  liveLabel = "Live Demo",
}: {
  href: string;
  label: string;
  iframeSrc: string;
  switchToDesktopLabel: string;
  switchToMobileLabel: string;
  liveLabel?: string;
}) {
  const [forcedMobile, setForcedMobile] = useState(false);
  const [manualMobile, setManualMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const sync = () => setForcedMobile(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
    };
  }, []);

  const isMobile = forcedMobile || manualMobile;
  const toggleLabel = isMobile ? switchToDesktopLabel : switchToMobileLabel;

  return (
    <div
      className={`site-preview scroll-mt-24${isMobile ? " is-mobile" : ""}${forcedMobile ? " is-forced-mobile" : ""}`}
      id="sitePreview"
    >
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
              setManualMobile((current) => !current);
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
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
