import Image from '@/compat/Image'
import { HERO_MARKET_SCENES } from '@/lib/marketing-shared-data'
import { useEffect, useState } from 'react'

export default function HeroMarketStage({
  titles,
  yesLabel,
  noLabel,
}: {
  titles: readonly string[]
  yesLabel: string
  noLabel: string
}) {
  const [showDeferredScenes, setShowDeferredScenes] = useState(false)

  useEffect(() => {
    let idleCallbackId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const revealDeferredScenes = () => {
      if ('requestIdleCallback' in window) {
        idleCallbackId = window.requestIdleCallback(() => setShowDeferredScenes(true), {
          timeout: 2500,
        })
      } else {
        timeoutId = setTimeout(() => setShowDeferredScenes(true), 1500)
      }
    }

    if (document.readyState === 'complete') {
      revealDeferredScenes()
    } else {
      window.addEventListener('load', revealDeferredScenes, { once: true })
    }

    return () => {
      window.removeEventListener('load', revealDeferredScenes)
      if (idleCallbackId !== undefined) window.cancelIdleCallback(idleCallbackId)
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="hero-market-stage" aria-hidden="true">
      {HERO_MARKET_SCENES.map((scene, sceneIndex) => (
        <div key={scene.sceneClassName} className={scene.sceneClassName}>
          {scene.cards.map((card, cardIndex) => {
            const titleIndex =
              HERO_MARKET_SCENES.slice(0, sceneIndex).reduce(
                (total, entry) => total + entry.cards.length,
                0,
              ) + cardIndex
            const title = titles[titleIndex] ?? ''
            const expandSide = 'expandSide' in card ? card.expandSide : undefined
            const shouldRenderImage = sceneIndex === 0 || showDeferredScenes

            return (
              <figure
                key={card.cardClassName}
                className={card.cardClassName}
                data-expand-side={expandSide}
                style={{ ['--hero-market-rotate' as string]: card.rotate }}
              >
                <div className="protocol-hero-card-shell">
                  <div className="hero-market-card-media">
                    {shouldRenderImage ? (
                      <Image
                        src={card.imageSrc}
                        alt=""
                        width={320}
                        height={320}
                        fetchPriority="low"
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  {expandSide ? (
                    <div className="protocol-hero-card-panel" aria-hidden="true">
                      <div className="protocol-hero-card-title">{title}</div>
                      <div className="protocol-hero-card-actions">
                        <span className="hero-market-tooltip-btn hero-market-tooltip-btn-yes">
                          {yesLabel}
                        </span>
                        <span className="hero-market-tooltip-btn hero-market-tooltip-btn-no">
                          {noLabel}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </figure>
            )
          })}
        </div>
      ))}
    </div>
  )
}
