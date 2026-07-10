'use client'

import { useExtracted } from 'next-intl'
import { useEffect, useState } from 'react'

export default function RotatingProofCards() {
  const t = useExtracted()
  const cards = [
    {
      label: t('2025 volume'),
      value: '$63.5B',
      sub: t.rich(
        'Prediction market volume hit $63.5B in 2025, according to <link>CertiK</link>.',
        {
          link: chunks => (
            <a
              href="https://indd.adobe.com/view/publication/c5e0e901-0d7d-471b-80be-ec82d0d88048/xjq4/publication-web-resources/pdf/2025_Skynet_Prediction_Markets_Report_.pdf"
              className="source-link"
              data-source-outlet="CertiK Research"
              data-source-title="2025 Skynet Prediction Markets Report"
            >
              {chunks}
            </a>
          ),
        },
      ),
    },
    {
      label: t('Polymarket talks'),
      value: '$15B',
      sub: t.rich(
        'Bloomberg put Polymarket talks near $15B, via <link>CoinDesk</link>.',
        {
          link: chunks => (
            <a
              href="https://www.coindesk.com/business/2025/10/23/polymarket-seeks-investment-at-valuation-of-usd12b-usd15b-bloomberg"
              className="source-link"
              data-source-outlet="CoinDesk"
              data-source-title="Polymarket Seeks Investment at Valuation of $12B-$15B: Bloomberg"
            >
              {chunks}
            </a>
          ),
        },
      ),
    },
    {
      label: t('Kalshi valuation'),
      value: '$11B',
      sub: t.rich(
        'Kalshi raised $1B at an $11B valuation, according to <link>TechCrunch</link>.',
        {
          link: chunks => (
            <a
              href="https://techcrunch.com/2025/11/20/source-kalshis-valuation-jumps-to-11b-after-raising-massive-1b-round/"
              className="source-link"
              data-source-outlet="TechCrunch"
              data-source-title="Kalshi's Valuation Jumps to $11B After Raising Massive $1B Round"
            >
              {chunks}
            </a>
          ),
        },
      ),
    },
    {
      label: t('Weekly volume'),
      value: '$2B',
      sub: t.rich(
        'Weekly volume moved past $2B at the cycle peak, according to <link>Decrypt</link>.',
        {
          link: chunks => (
            <a
              href="https://decrypt.co/345033/prediction-markets-all-time-high-trading-volume"
              className="source-link"
              data-source-outlet="Decrypt"
              data-source-title="Prediction Market Trading Volume Hits All-Time High"
            >
              {chunks}
            </a>
          ),
        },
      ),
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)
  const clampedActiveIndex = cards.length === 0 ? -1 : Math.min(activeIndex, cards.length - 1)

  useEffect(() => {
    if (cards.length < 2) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % cards.length)
    }, 4200)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [cards.length])

  return (
    <div className="solution-proof-rotator" id="solutionProofRotator">
      {cards.map((card, index) => (
        <article
          key={`${card.label}-${card.value}`}
          className={`solution-proof-card ${index === clampedActiveIndex ? 'is-active' : ''}`}
        >
          <div className="solution-proof-card-label">{card.label}</div>
          <div className="solution-proof-card-value">{card.value}</div>
          <div className="solution-proof-card-copy">{card.sub}</div>
        </article>
      ))}
    </div>
  )
}
