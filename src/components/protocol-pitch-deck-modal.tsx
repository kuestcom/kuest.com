"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import type { ProtocolMessages } from "@/i18n/site";

type DeckModalMessages = ProtocolMessages["deckModal"];

export function ProtocolPitchDeckModal({
  messages,
}: {
  messages: DeckModalMessages;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    kind: "idle" | "success" | "error";
    message: string;
  }>({
    kind: "idle",
    message: "",
  });
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const openTrigger = target.closest("[data-protocol-deck-open]");

      if (openTrigger) {
        event.preventDefault();
        setIsOpen(true);
      }
    }

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ kind: "idle", message: "" });

    try {
      const response = await fetch("/api/protocol-deck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName,
          email,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || messages.error);
      }

      setStatus({
        kind: "success",
        message: messages.success,
      });
      setCompanyName("");
      setEmail("");
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error && error.message ? error.message : messages.error,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="protocol-deck-modal" hidden={!isOpen} aria-hidden={!isOpen}>
      <button
        type="button"
        className="protocol-deck-modal-backdrop"
        aria-label={messages.close}
        onClick={closeModal}
      />
      <div
        className="protocol-deck-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <button
          type="button"
          className="protocol-deck-modal-close"
          aria-label={messages.close}
          onClick={closeModal}
        >
          ×
        </button>
        <div className="protocol-deck-modal-kicker">{messages.kicker}</div>
        <h3 id={titleId} className="protocol-deck-modal-title">
          {messages.title}
        </h3>
        <p id={descriptionId} className="protocol-deck-modal-description">
          {messages.description}
        </p>

        <form className="protocol-deck-form" onSubmit={handleSubmit}>
          <label className="protocol-deck-field">
            <span>{messages.companyLabel}</span>
            <input
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder={messages.companyPlaceholder}
              autoComplete="organization"
              required
            />
          </label>

          <label className="protocol-deck-field">
            <span>{messages.emailLabel}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={messages.emailPlaceholder}
              autoComplete="email"
              required
            />
          </label>

          <div
            className={`protocol-deck-status${status.kind === "success" ? " is-success" : ""}${status.kind === "error" ? " is-error" : ""}`}
            aria-live="polite"
            hidden={status.kind === "idle"}
          >
            {status.message}
          </div>

          <div className="protocol-deck-actions">
            <button
              type="button"
              className="btn-cta btn-cta-secondary protocol-deck-action"
              onClick={closeModal}
            >
              <span className="cta-label">{messages.cancel}</span>
            </button>
            <button
              type="submit"
              className="btn-cta btn-cta-primary protocol-deck-action"
              disabled={isSubmitting}
            >
              <span className="cta-label">{isSubmitting ? messages.submitting : messages.submit}</span>
              <ArrowRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
