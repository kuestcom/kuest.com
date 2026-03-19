import Image from 'next/image'
import { HERO_MARKET_SCENES } from '@/lib/marketing-shared-data'

export default function HeroMarketStage({
  titles,
  yesLabel,
  noLabel,
}: {
  titles: readonly string[]
  yesLabel: string
  noLabel: string
}) {
  return (
    <div className="hero-market-stage" aria-hidden="true">
      {HERO_MARKET_SCENES.map((scene, sceneIndex) => (
        <div key={scene.sceneClassName} className={scene.sceneClassName}>
          {scene.cards.map((card, cardIndex) => {
            const titleIndex
              = HERO_MARKET_SCENES
                .slice(0, sceneIndex)
                .reduce((total, entry) => total + entry.cards.length, 0) + cardIndex
            const title = titles[titleIndex] ?? ''
            const expandSide = 'expandSide' in card ? card.expandSide : undefined

            return (
              <figure
                key={card.cardClassName}
                className={card.cardClassName}
                data-expand-side={expandSide}
                style={{ ['--hero-market-rotate' as string]: card.rotate }}
              >
                <div className="protocol-hero-card-shell">
                  <div className="hero-market-card-media">
                    <Image
                      src={card.imageSrc}
                      alt=""
                      width={320}
                      height={320}
                      className="size-full object-cover"
                    />
                  </div>
                  {expandSide
                    ? (
                        <figcaption className="protocol-hero-card-panel" aria-hidden="true">
                          <div className="protocol-hero-card-title">{title}</div>
                          <div className="protocol-hero-card-actions">
                            <span
                              className="hero-market-tooltip-btn hero-market-tooltip-btn-yes"
                            >
                              {yesLabel}
                            </span>
                            <span
                              className="hero-market-tooltip-btn hero-market-tooltip-btn-no"
                            >
                              {noLabel}
                            </span>
                          </div>
                        </figcaption>
                      )
                    : null}
                </div>
              </figure>
            )
          })}
        </div>
      ))}
    </div>
  )
}
