"use client";

import { useEffect, useMemo, useState } from "react";

type SourceModalState = {
  href: string;
  outlet: string;
  title: string;
  domain: string;
};

export function SourceModal({
  outlet,
  title,
  loading,
  note,
  externalLabel,
  backLabel,
  dynamicNote,
}: {
  outlet: string;
  title: string;
  loading: string;
  note: string;
  externalLabel: string;
  backLabel: string;
  dynamicNote: string;
}) {
  const [source, setSource] = useState<SourceModalState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resolvedNote = useMemo(() => {
    if (!source) {
      return note;
    }

    return dynamicNote.replace("{{domain}}", source.domain);
  }, [dynamicNote, note, source]);

  useEffect(() => {
    const getSafeSourceUrl = (href: string) => {
      if (!href.trim()) {
        return null;
      }

      try {
        const url = new URL(href, window.location.origin);
        return url.protocol === "https:" || url.protocol === "http:" ? url : null;
      } catch {
        return null;
      }
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest<HTMLAnchorElement>(".source-link");

      if (!link) {
        return;
      }

      const isPlainLeftClick =
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey;

      if (!isPlainLeftClick) {
        return;
      }

      const safeUrl = getSafeSourceUrl(link.getAttribute("href") ?? "");

      if (!safeUrl) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      setIsLoading(true);
      setSource({
        href: safeUrl.href,
        outlet: link.dataset.sourceOutlet || outlet,
        title: link.dataset.sourceTitle || link.textContent?.trim() || title,
        domain: safeUrl.hostname.replace(/^www\./, ""),
      });
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [outlet, title]);

  useEffect(() => {
    if (!source) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSource(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [source]);

  return (
    <div className="source-modal" id="sourceModal" hidden={!source} aria-hidden={!source}>
      <button
        type="button"
        className="source-modal-backdrop"
        data-source-close
        aria-label={backLabel}
        onClick={() => setSource(null)}
      />
      <div className="source-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="sourceModalTitle">
        <button
          type="button"
          className="source-modal-close"
          aria-label={backLabel}
          data-source-close
          onClick={() => setSource(null)}
        >
          ×
        </button>
        <div className="source-modal-kicker" id="sourceModalOutlet">
          {source?.outlet || outlet}
        </div>
        <h3 className="source-modal-title" id="sourceModalTitle">
          {source?.title || title}
        </h3>
        <div className="source-modal-url" id="sourceModalUrl">
          {source?.domain || "source-url.com"}
        </div>
        <div className={`source-modal-frame-wrap${isLoading ? " is-loading" : ""}`} id="sourceModalFrameWrap">
          <div className="source-modal-frame-loading" id="sourceModalLoading">
            {loading}
          </div>
          <iframe
            key={source?.href ?? "about:blank"}
            id="sourceModalFrame"
            className="source-modal-frame"
            title="Source preview"
            src={source?.href ?? "about:blank"}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setIsLoading(false)}
          />
        </div>
        <p className="source-modal-note" id="sourceModalNote">
          {resolvedNote}
        </p>
        <div className="source-modal-actions">
          <a
            href={source?.href ?? "#"}
            id="sourceModalExternal"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta btn-cta-secondary"
          >
            {externalLabel}
          </a>
          <button type="button" className="btn-cta btn-cta-secondary" data-source-close onClick={() => setSource(null)}>
            {backLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
