'use client'

import type { FormEvent } from 'react'
import { ChevronRightIcon } from 'lucide-react'
import { useExtracted } from 'next-intl'
import { useEffect, useId, useState } from 'react'

export default function ProtocolPitchDeckModal() {
  const t = useExtracted()
  const [isOpen, setIsOpen] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    kind: 'idle' | 'success' | 'error'
    message: string
  }>({
    kind: 'idle',
    message: '',
  })
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target

      if (!(target instanceof Element)) {
        return
      }

      const openTrigger = target.closest('[data-protocol-deck-open]')

      if (openTrigger) {
        event.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('click', handleDocumentClick)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  function closeModal() {
    if (isSubmitting) {
      return
    }

    setIsOpen(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setStatus({ kind: 'idle', message: '' })

    try {
      const response = await fetch('/api/protocol-deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          email,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean, error?: string }
        | null

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || t('We couldn\'t send your request. Please try again.'))
      }

      setStatus({
        kind: 'success',
        message: t('Request sent. We\'ll reach out by email.'),
      })
      setCompanyName('')
      setEmail('')
    }
    catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error && error.message ? error.message : t('We couldn\'t send your request. Please try again.'),
      })
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="protocol-deck-modal" hidden={!isOpen} aria-hidden={!isOpen}>
      <button
        type="button"
        className="protocol-deck-modal-backdrop"
        aria-label={t('Close modal')}
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
          aria-label={t('Close modal')}
          onClick={closeModal}
        >
          ×
        </button>
        <div className="protocol-deck-modal-kicker">{t('REQUEST DECK')}</div>
        <h3 id={titleId} className="protocol-deck-modal-title">
          {t('Request the Kuest Protocol pitch deck')}
        </h3>
        <p id={descriptionId} className="protocol-deck-modal-description">
          {t('Leave your company name and email and we\'ll route the request to the team.')}
        </p>

        <form className="protocol-deck-form" onSubmit={handleSubmit}>
          <label className="protocol-deck-field">
            <span>{t('Company name')}</span>
            <input
              type="text"
              value={companyName}
              onChange={event => setCompanyName(event.target.value)}
              placeholder={t('Your company')}
              autoComplete="organization"
              required
            />
          </label>

          <label className="protocol-deck-field">
            <span>{t('Work email')}</span>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder={t('you@company.com')}
              autoComplete="email"
              required
            />
          </label>

          <div
            className={`protocol-deck-status ${status.kind === 'success' ? 'is-success' : ''}${status.kind === 'error'
              ? `is-error`
              : ''}`}
            aria-live="polite"
            hidden={status.kind === 'idle'}
          >
            {status.message}
          </div>

          <div className="protocol-deck-actions">
            <button
              type="button"
              className="btn-cta btn-cta-secondary protocol-deck-action"
              onClick={closeModal}
            >
              <span className="cta-label">{t('Cancel')}</span>
            </button>
            <button
              type="submit"
              className="btn-cta btn-cta-primary protocol-deck-action"
              disabled={isSubmitting}
            >
              <span className="cta-label">{isSubmitting ? t('Sending...') : t('Send request')}</span>
              <ChevronRightIcon />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
