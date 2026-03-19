import type { Metadata, Viewport } from 'next'
import { Banknote, Bot, Building2, Check, ChevronRightIcon, Clock3, Globe2, Newspaper } from 'lucide-react'
import { hasLocale } from 'next-intl'
import { getExtracted } from 'next-intl/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import DockMenuControl from '@/components/DockMenuControl'
import HeroMarketStage from '@/components/HeroMarketStage'
import KuestMark from '@/components/KuestMark'
import LanguageControl from '@/components/LanguageControl'
import MarketingPageRuntime from '@/components/MarketingPageRuntime'
import ProtocolPitchDeckModal from '@/components/ProtocolPitchDeckModal'
import SiteFooter from '@/components/SiteFooter'
import ThemeToggle from '@/components/ThemeToggle'
import TimelineSpine from '@/components/TimelineSpine'
import { SUPPORTED_LOCALES } from '@/i18n/locales'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { CONTACT_HREF } from '@/lib/constants'
import { getDemoHref, serializeJsonForHtmlScript } from '@/lib/marketing-content'

export async function generateMetadata({ params }: PageProps<'/[locale]/protocol'>): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const t = await getExtracted()
  const siteOrigin = process.env.SITE_URL!
  const canonical = new URL(getPathname({ href: '/', locale }), siteOrigin)
  const ogImage = new URL('/assets/images/your-predictoin-market-500mi-vol.png', siteOrigin)
  const title = t('Kuest Protocol - Prediction Market Infrastructure')
  const description = t('Kuest is a white-label prediction market protocol that lets institutions, media companies, and creators launch branded markets with shared liquidity and protocol-level infrastructure.')

  return {
    metadataBase: new URL(siteOrigin),
    title,
    description,
    keywords: [
      'prediction market infrastructure',
      'white label prediction market protocol',
      'prediction market API',
      'shared liquidity protocol',
      'institutional prediction markets',
      'prediction market seed round',
    ],
    authors: [{ name: 'Kuest' }],
    alternates: {
      canonical,
      languages: Object.fromEntries(SUPPORTED_LOCALES.map(entry => [entry, entry === 'en' ? '/protocol' : `/${entry}/protocol`])),
    },
    openGraph: {
      type: 'website',
      siteName: 'Kuest',
      title,
      description,
      url: canonical,
      images: [
        {
          url: ogImage,
          alt: t('Kuest protocol overview'),
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [ogImage],
    },
  }
}

export async function generateViewport(): Promise<Viewport> {
  return {
    themeColor: '#CDFF00',
  }
}

export default async function ProtocolPage({ params }: PageProps<'/[locale]/protocol'>) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const t = await getExtracted()
  const demoHref = getDemoHref(locale)
  const partnerIcons = [Banknote, Bot, Building2] as const
  const whyNowLead = t('On March 9, 2026, Kalshi announced its first-ever strategic partnership with a financial institution outside the United States: XP International, one of Brazil\'s largest brokerages, with over 4.7 million active clients and R$1.8 trillion under management.')
  const whyNowRest = [
    t('Under the arrangement, XP manages local distribution and client relationships, while Kalshi provides the trading technology and market design - a model for exporting prediction market infrastructure through local financial platforms.'),
    t('Brazil still lacks specific regulation for prediction markets, but platforms like Kalshi and Polymarket already host contracts related to the country. B3 also plans to enter this market, and the Ministry of Finance is closely monitoring the sector. Kalshi\'s co-founder called Brazil \"the way the US was years ago with prediction markets.\"'),
    t('Kalshi needed XP because they are a platform, not infrastructure. They can only expand one country at a time, one institutional deal at a time. Kuest is the layer that makes every XP-equivalent in every market a potential prediction market operator - without waiting for Kalshi\'s partnership queue.'),
  ]
  const architectureLead = t('Kuest\'s smart contracts are derived from Polymarket\'s CLOB architecture - the same design that has processed billions in verified trading volume. The core contracts carry OpenZeppelin\'s audit validation as their foundation. We adapted them to support shared liquidity across multiple operator frontends, which is the architectural primitive that makes the protocol model possible.')
  const architectureRest = [
    t('The choice of Polygon was equally deliberate. Most existing prediction market liquidity already sits on Polygon. Traders already hold USDC balances there. Market-making bots already operate in this environment. Building on a different chain would mean asking every liquidity provider to start over. We focused our innovation on distribution and infrastructure - not on reinventing a trading engine that already works at scale.'),
    t('The result is a protocol that is immediately compatible with existing trading strategies, bot infrastructure, and market maker tooling - dramatically lowering the barrier to liquidity bootstrapping for new operator deployments.'),
  ]

  function renderDemoLinkText(value: string) {
    const [before, after] = value.split('demo.kuest.com')

    if (after === undefined) {
      return value
    }

    return (
      <>
        {before}
        <a href={demoHref} target="_blank" rel="noopener noreferrer">
          demo.kuest.com
        </a>
        {after}
      </>
    )
  }

  const opportunityStats = [
    {
      value: '$18.3B',
      label: t('Combined monthly trading volume, Kalshi + Polymarket, Feb 2026'),
      sourceLabel: t('Source: The Block'),
      sourceHref: 'https://www.theblock.co/post/392755',
    },
    {
      value: '96.7M',
      label: t('Visits to Polymarket in 3 months. The US accounts for only 20% of traffic.'),
      sourceLabel: t('Source: SimilarWeb, Feb 2026'),
      sourceHref: 'https://www.similarweb.com/website/polymarket.com/',
    },
    {
      value: '200x',
      label: t('Kalshi trading volume growth in the past 12 months'),
      sourceLabel: t('Source: PYMNTS / Kalshi press release'),
      sourceHref: 'https://www.pymnts.com/partnerships/2026/kalshi-begins-global-expansion-with-xp-deal-brazil/',
    },
    {
      value: '$20B',
      label: t('Target valuation for both Kalshi and Polymarket in current fundraising rounds'),
      sourceLabel: t('Source: CoinDesk via WSJ, Mar 2026'),
      sourceHref: 'https://www.coindesk.com/business/2026/03/07/kalshi-polymarket-seeking-usd20-billion-valuations-in-fundraising-talks-wsj',
    },
  ]

  const protocolCards = [
    {
      title: t('Platform vs. Protocol'),
      body: t('Polymarket is a single venue. Kalshi is a single venue. Kuest is the layer underneath - any operator can deploy their own frontend, their own brand, their own markets, and share liquidity with every other Kuest-powered site from day one.'),
      tags: [
        t('Own brand'),
        t('Shared liquidity'),
      ],
    },
    {
      title: t('The Shopify Analogy'),
      body: t('Shopify did not compete with Amazon. They enabled millions of stores that could not exist otherwise. Kuest does not compete with Polymarket. We enable the next 1,000 prediction market operators - media companies, brokerages, community platforms, creators - to exist.'),
      tags: [
        t('Operators'),
        t('Distribution'),
        t('Network scale'),
      ],
    },
    {
      title: t('What\'s Already Built'),
      body: t('CLOB engine, relayer, smart contracts, Polymarket-compatible APIs, Vercel + Supabase deployment stack, shared liquidity layer, SDK, bots infrastructure, market maker integrations, and a multi-language frontend. Live demo at demo.kuest.com.'),
      tags: [
        t('SDK'),
        t('Bots'),
        t('API'),
        t('Mainnet'),
      ],
    },
  ]

  const businessModelCards = [
    {
      title: t('Operator Fees'),
      body: t('Operators set their own trading fee, typically 0.5%-3%. A small protocol fee is retained by Kuest on each trade across the network. As the number of operators scales, this becomes a volume-aggregated revenue stream independent of any single operator\'s performance.'),
      tags: [
        t('0.5%—3% operator fee'),
        t('Protocol take rate'),
      ],
    },
    {
      title: t('Infrastructure'),
      body: t('Launch is free. Production infrastructure is usage-based - operators pay when they scale. Server costs, gas management, settlement infrastructure, and scalability are handled by Kuest. Operators focus on distribution. We run the stack.'),
      tags: [
        t('Free launch'),
        t('Usage-based'),
      ],
    },
    {
      title: t('Liquidity Services'),
      body: t('Market makers who provide liquidity across the Kuest network earn spreads. Kuest facilitates this matching and captures value at the infrastructure layer. As the operator network grows, liquidity efficiency increases - a compounding network effect.'),
      tags: [
        t('Spread capture'),
        t('Network effects'),
      ],
    },
  ]

  const partnersCards = [
    {
      title: t('Investors'),
      body: t('Seed-stage capital to accelerate operator acquisition, market maker incentive programs, and protocol hardening. The prediction market sector is moving from experimental to institutional quickly. We are at the inflection point where infrastructure layer plays are valued, not after the fact.'),
    },
    {
      title: t('Market Makers'),
      body: t('The cold-start problem for new prediction markets is liquidity. We solve it through shared liquidity across the operator network - but we need initial market maker partnerships to seed depth on new deployments. If you run bots or provide liquidity on Polymarket or Kalshi, you already have what you need to operate on Kuest. Estimated APY is strategy- and volume-dependent, but on cloned Polymarket-style markets the spread-and-turnover profile can exceed passive stablecoin yield for desks that recycle inventory efficiently.'),
    },
    {
      title: t('Institutional Operators'),
      body: t('The XP + Kalshi deal demonstrates the model: a financial institution wants prediction market access but needs a local, branded, controlled environment. Kuest provides that without requiring a bilateral deal with Kalshi. Banks, brokerages, investment platforms, and media groups with financial audiences can use Kuest as their infrastructure layer. Brazil is specifically primed for this: B3 is preparing for the category, XP has the Kalshi partnership, and the Ministry of Finance is watching the sector closely. The window for early operator positioning is open.'),
    },
  ]

  const applicationLayerItems = [
    {
      label: t('Consumer brand'),
      value: t('core asset is the venue itself'),
    },
    {
      label: t('Unit economics'),
      value: t('tied to their own order flow'),
    },
    {
      label: t('Expansion'),
      value: t('one partnership at a time'),
    },
  ]

  const protocolLayerItems = [
    {
      label: t('Operator network'),
      value: t('every brand becomes a distribution node'),
    },
    {
      label: t('Economics'),
      value: t('protocol fees across aggregated volume'),
    },
    {
      label: t('Scale'),
      value: t('many deployments simultaneously'),
    },
  ]

  const statusItems = [
    {
      label: t('Smart contracts deployed'),
      detail: t('Polygon mainnet, OpenZeppelin-validated architecture'),
      complete: true,
    },
    {
      label: t('CLOB engine + relayer operational'),
      detail: t('Core trading stack is already running'),
      complete: true,
    },
    {
      label: t('Polymarket-compatible API'),
      detail: t('Cross-platform liquidity from day one'),
      complete: true,
    },
    {
      label: t('White-label frontend'),
      detail: t('Deploy in under 15 minutes with no code'),
      complete: true,
    },
    {
      label: t('SDK + bot infrastructure'),
      detail: t('Available for operator and market maker integrations'),
      complete: true,
    },
    {
      label: t('Live demo'),
      detail: t.rich('<link>demo.kuest.com</link>', {
        link: chunks => <a href="https://demo.kuest.com">{chunks}</a>,
      }),
      complete: true,
    },
    {
      label: t('Open source'),
      detail: t.rich('<link>github.com/kuestcom/prediction-market</link>', {
        link: chunks => (
          <a href="https://github.com/kuestcom/prediction-market">
            {chunks}
          </a>
        ),
      }),
      complete: true,
    },
    {
      label: t('Market maker program'),
      detail: t('Active recruitment'),
      complete: false,
    },
    {
      label: t('Seed round'),
      detail: t('Open'),
      complete: false,
    },
  ]

  return (
    <>
      <Script
        id="protocol-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonForHtmlScript({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'Kuest Protocol',
            'applicationCategory': 'BusinessApplication',
            'operatingSystem': 'Web',
            'url': new URL(getPathname({ href: '/', locale }), process.env.SITE_URL!),
            'description': t('White-label prediction market protocol for operators who want branded markets, shared liquidity, and protocol infrastructure.'),
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD',
            },
            'featureList': [
              'White-label operator deployments',
              'Shared liquidity across operator frontends',
              'Polymarket-derived smart contract architecture',
              'Polymarket-compatible APIs and bot tooling',
              'Usage-based infrastructure for production operators',
            ],
          }),
        }}
      />

      <TimelineSpine count={9} />

      <nav id="heroNav" className="hero-nav">
        <div className="nav-r">
          <LanguageControl
            locale={locale}
            path="/protocol"
            controlId="siteLanguageControl"
            buttonId="siteLanguageButton"
            menuId="siteLanguageMenu"
            flagId="siteLanguageCurrentFlag"
            labelId="siteLanguageCurrentLabel"
            ariaLabel={t('Change site language')}
          />
        </div>
      </nav>

      <nav id="dockNav" className="dock-nav" aria-hidden="true">
        <a href="#page-top" className="nav-logo">
          <KuestMark />
          Kuest
        </a>
        <div className="nav-r">
          <DockMenuControl
            homeHref="/"
            enterpriseHref="/enterprise"
            protocolHref="/protocol"
            active="protocol"
            openLabel={t('Open site navigation')}
            menuAriaLabel={t('Site navigation')}
            homeLabel={t('Home')}
            enterpriseLabel={t('Enterprise')}
            protocolLabel={t('The Protocol')}
          />
          <LanguageControl
            locale={locale}
            path="/protocol"
            controlId="dockSiteLanguageControl"
            buttonId="dockSiteLanguageButton"
            menuId="dockSiteLanguageMenu"
            flagId="dockSiteLanguageCurrentFlag"
            labelId="dockSiteLanguageCurrentLabel"
            ariaLabel={t('Change site language')}
          />
          <ThemeToggle
            id="dockThemeToggle"
            className="dock-theme-toggle"
            labelToDark={t('Switch to dark mode')}
            labelToLight={t('Switch to light mode')}
          />
          <a href={CONTACT_HREF} className="nb nb-solid nav-cta">
            <span className="cta-label">{t('Contact us')}</span>
            <ChevronRightIcon />
          </a>
        </div>
      </nav>

      <main id="page-top" className="page protocol-page">
        <section className="panel-wrap panel-static hero-stack-panel protocol-hero-panel" id="p0">
          <div className="panel-sticky">
            <div className="panel-inner hero-stack">
              <div className="r hero-copy protocol-hero-copy">
                <div className="hero-copy-main">
                  <div className="hero-brand-row">
                    <div className="hero-brand" aria-hidden="true">
                      <KuestMark />
                      <span>Kuest</span>
                    </div>
                    <div className="hero-brand-controls">
                      <LanguageControl
                        locale={locale}
                        path="/protocol"
                        controlId="heroBrandLanguageControl"
                        buttonId="heroBrandLanguageButton"
                        menuId="heroBrandLanguageMenu"
                        flagId="heroBrandLanguageCurrentFlag"
                        labelId="heroBrandLanguageCurrentLabel"
                        ariaLabel={t('Change site language')}
                      />
                      <ThemeToggle
                        id="heroBrandThemeToggle"
                        className="dock-theme-toggle hero-brand-theme-toggle"
                        labelToDark={t('Switch to dark mode')}
                        labelToLight={t('Switch to light mode')}
                      />
                    </div>
                  </div>
                  <div className="hero-kicker protocol-hero-kicker">{t('KUEST PROTOCOL · SEED ROUND OPEN')}</div>
                  <h1 className="
                    hero-title font-sans text-[clamp(46px,6.2vw,88px)] leading-[0.94] font-bold tracking-[-0.05em]
                    text-white
                  "
                  >
                    <span className="hero-title-line">{t('Polymarket proved the model.')}</span>
                    <span className="hero-title-line">
                      {t('We\'re turning it into')}
                      {' '}
                      <span className="hero-title-accent">{t('infrastructure.')}</span>
                    </span>
                  </h1>
                </div>
                <div className="hero-copy-side protocol-hero-side">
                  <p className="hero-copy-sub protocol-hero-sub">{t('Kuest is a white-label prediction market protocol — the layer that lets any financial institution, media company, or creator launch their own branded market, share liquidity, and earn trading fees. Built on the same smart contract architecture that processed billions in volume. Ready today.')}</p>
                  <div className="hero-copy-actions protocol-action-row">
                    <button type="button" className="btn-cta btn-cta-primary" data-protocol-deck-open>
                      <span className="cta-label">{t('View pitch deck')}</span>
                      <ChevronRightIcon />
                    </button>
                    <a href={CONTACT_HREF} className="btn-cta btn-cta-secondary">
                      <span className="cta-label">{t('Contact us')}</span>
                      <ChevronRightIcon />
                    </a>
                  </div>
                  <div className="hero-copy-proof text-faint font-mono text-[11px] tracking-[.16em] uppercase">
                    {t('MVP OPERATIONAL · SEED ROUND OPEN · OPEN SOURCE')}
                  </div>
                </div>
              </div>
              <HeroMarketStage
                titles={[
                  t('Will Bitcoin trade above $150K before Q3?'),
                  t('Will the Fed cut rates before July?'),
                  t('Will Uniswap v4 launch on mainnet before Q2?'),
                  t('Will Ethereum outperform Bitcoin this quarter?'),
                  t('Will Elon Musk\'s net worth exceed $500B this year?'),
                  t('Will Trump announce a U.S. Bitcoin reserve this year?'),
                  t('Will the community reach 50K members before Q4?'),
                  t('Will Brazil elect a market-friendly president in 2026?'),
                  t('Will Donald Trump win the next U.S. election?'),
                  t('Will a Russia-Ukraine ceasefire be announced before year-end?'),
                  t('Will Labour win the next UK general election?'),
                  t('Will the next Marvel film open above $200M?'),
                ]}
                yesLabel={t('Yes')}
                noLabel={t('No')}
              />
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section" id="p1">
          <div className="panel-sticky">
            <div className="panel-inner market-focus protocol-section-center">
              <div className="r">
                <div className="slbl justify-center">{t('THE OPPORTUNITY')}</div>
                <h2 className="sh">{t('A $20 billion industry forming in real time - and 95% of the world hasn\'t accessed it yet.')}</h2>
              </div>
              <div className="r rd market-proof-grid">
                <div className="market-numbers market-numbers-4">
                  {opportunityStats.map(stat => (
                    <article key={stat.value} className="mn">
                      <div className="mn-label">{stat.label}</div>
                      <div className="mn-num">{stat.value}</div>
                      <div className="mn-sub">
                        <a
                          href={stat.sourceHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-link"
                        >
                          {stat.sourceLabel}
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div className="r rd2 protocol-rich-text section-copy-center section-copy-center-wide">
                <p>{t('Two platforms currently dominate this sector. Kalshi, the regulated US exchange, recently crossed a $1-1.5B annualized revenue run rate. Polymarket, running on Polygon, draws over 32 million monthly visits globally. Together, they\'ve demonstrated that prediction markets are not a niche - they are a new financial primitive. The problem: both are closed platforms. You trade on them. You do not build with them.')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section mt-24!" id="p2">
          <div className="panel-sticky">
            <div className="panel-inner protocol-copy-shell">
              <div className="r protocol-copy-head">
                <div className="slbl">{t('WHY NOW')}</div>
                <h2 className="sh">{t('The XP + Kalshi deal just confirmed what we already built for.')}</h2>
              </div>
              <div className="r rd protocol-rich-text protocol-rich-text-wide">
                {whyNowLead ? <p>{whyNowLead}</p> : null}
                {whyNowLead
                  ? (
                      <div className="protocol-inline-logo protocol-inline-logo-row">
                        <Image
                          className="protocol-inline-logo-kalshi-mark"
                          src="/assets/images/kalshi-logo.svg"
                          alt="Kalshi"
                          width={88}
                          height={25}
                        />
                        <Image
                          className="protocol-inline-logo-xp-mark"
                          src="/assets/images/xp-investimentos.svg"
                          alt="XP Investimentos"
                          width={92}
                          height={20}
                        />
                      </div>
                    )
                  : null}
                {whyNowRest.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="r rd2 protocol-quote-wrap">
                <ProtocolQuoteCard
                  quote={t('It makes sense for us to go through these international partners. They already have the customers and the brand.')}
                  attribution={t('Luana Lopes Lara, co-founder & COO, Kalshi')}
                  sourceLabel={t('Source: Finance Magnates, March 2026')}
                  sourceHref="https://www.financemagnates.com/fintech/kalshi-taps-brazils-xp-to-take-prediction-markets-global/"
                  media={{
                    kind: 'image',
                    src: '/assets/images/luana-kalshi.webp',
                  }}
                />
              </div>
              <div className="r rd3 protocol-rich-text">
                <p>{t('That\'s exactly what Kuest enables - at protocol scale, not deal by deal.')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section" id="p3">
          <div className="panel-sticky">
            <div className="panel-inner protocol-section-center">
              <div className="r quote-stage-head protocol-heading-wide">
                <div className="slbl justify-center">{t('THE PROTOCOL')}</div>
                <h2 className="sh">{t('We are not a prediction market. We are the infrastructure that launches them.')}</h2>
              </div>
              <div className="r rd steps-grid">
                {protocolCards.map((card, index) => (
                  <article key={card.title} className="step-card">
                    <div className="step-num">{String(index + 1).padStart(2, '0')}</div>
                    <div className="step-body">
                      <h3 className="step-title">{card.title}</h3>
                      <p className="step-sub">{renderDemoLinkText(card.body)}</p>
                      <div className="step-tech">
                        {card.tags.map(tag => (
                          <span key={tag} className="tech-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section" id="p4">
          <div className="panel-sticky">
            <div className="panel-inner protocol-copy-shell">
              <div className="r protocol-copy-head">
                <div className="slbl">{t('WHY THIS ARCHITECTURE')}</div>
                <h2 className="sh">{t('A strategic decision, not a shortcut.')}</h2>
              </div>
              <div className="r rd protocol-rich-text protocol-rich-text-wide">
                {architectureLead ? <p>{architectureLead}</p> : null}
                {architectureLead
                  ? (
                      <div className="protocol-inline-logo protocol-inline-logo-polymarket">
                        <Image src="/assets/images/polymarket-logo.svg" alt="Polymarket" width={128} height={23} />
                      </div>
                    )
                  : null}
                {architectureRest.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="r rd2 protocol-inline-quote">
                <ProtocolQuoteCard
                  quote={t('Polymarket proved the model. We\'re turning that infrastructure into a protocol so anyone can launch markets that share liquidity.')}
                  attribution={t('Kuest protocol thesis')}
                  media={{ kind: 'kuest-mark' }}
                  centered
                  hideAttribution
                />
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section" id="p5">
          <div className="panel-sticky">
            <div className="panel-inner protocol-section-center">
              <div className="r quote-stage-head">
                <div className="slbl justify-center">{t('HOW THE PROTOCOL MAKES MONEY')}</div>
                <h2 className="sh">{t('Three revenue layers. One infrastructure stack.')}</h2>
              </div>
              <div className="r rd steps-grid">
                {businessModelCards.map((card, index) => (
                  <article key={card.title} className="step-card">
                    <div className="step-num">{String(index + 1).padStart(2, '0')}</div>
                    <div className="step-body">
                      <h3 className="step-title">{card.title}</h3>
                      <p className="step-sub">{card.body}</p>
                      <div className="step-tech">
                        {card.tags.map(tag => (
                          <span key={tag} className="tech-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="r rd2 protocol-context-line">{t('Currently, infrastructure costs are manageable and predictable. They will scale with volume - but so does protocol revenue, proportionally. The cost structure is not a ceiling; it is a variable that tracks growth.')}</div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section" id="p6">
          <div className="panel-sticky">
            <div className="panel-inner audience-stage protocol-audience-stage">
              <div className="r audience-stage-head">
                <div className="slbl">{t('WHO WE\'RE LOOKING FOR')}</div>
                <h2 className="sh">{t('Three types of partners. All necessary. All complementary.')}</h2>
              </div>
              <div className="r rd audience-rows">
                {partnersCards.map((card, index) => {
                  const Icon = partnerIcons[index]

                  return (
                    <article key={card.title} className="audience-row">
                      <div className="audience-row-icon">{Icon ? <Icon /> : null}</div>
                      <div className="audience-row-body">
                        <h3>{card.title}</h3>
                        <p>{card.body}</p>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section" id="p7">
          <div className="panel-sticky">
            <div className="panel-inner protocol-section-center">
              <div className="r quote-stage-head">
                <div className="slbl justify-center">{t('THE STRATEGIC QUESTION ANSWERED')}</div>
                <h2 className="sh">{t('Why won\'t Polymarket just do this?')}</h2>
              </div>
              <div className="r rd protocol-rich-text section-copy-center section-copy-center-wide">
                <p>{t('They are focused on being the best prediction market platform in the world. That is a different company from one focused on being the best prediction market infrastructure layer in the world. Polymarket has a $9B branded consumer product to protect. They do not build the SDK that powers their competitors.')}</p>
              </div>
              <div className="r rd2 path-grid">
                <article className="path-card investor">
                  <div className="path-tag i">
                    <Newspaper size={14} />
                    {t('Application layer')}
                  </div>
                  <h3 className="path-h">{t('Platform companies optimize for destination traffic.')}</h3>
                  <p className="path-p">{t('Polymarket and Kalshi win by concentrating users, protecting brand, and deepening liquidity on their own venues.')}</p>
                  <div className="path-list">
                    {applicationLayerItems.map(item => (
                      <div key={item.label} className="pl">
                        <strong>
                          {item.label}
                          :
                        </strong>
                        {' '}
                        {item.value}
                      </div>
                    ))}
                  </div>
                </article>
                <article className="path-card creator">
                  <div className="path-tag c">
                    <Globe2 size={14} />
                    {t('Protocol layer')}
                  </div>
                  <h3 className="path-h">{t('Infrastructure companies optimize for operator scale.')}</h3>
                  <p className="path-p">{t('Kuest wins by letting thousands of operators launch markets that share liquidity while Kuest runs the underlying stack.')}</p>
                  <div className="path-list">
                    {protocolLayerItems.map(item => (
                      <div key={item.label} className="pl">
                        <strong>
                          {item.label}
                          :
                        </strong>
                        {' '}
                        {item.value}
                      </div>
                    ))}
                  </div>
                </article>
              </div>
              <div className="r rd3 protocol-rich-text section-copy-center section-copy-center-wide">
                <p>{t('This is not a new dynamic. Uniswap enabled thousands of token markets without competing with every project listed on it. AWS enabled millions of businesses without trying to be all of them. The XP + Kalshi deal validates demand, but it also reveals the bottleneck: Kalshi can do one institutional partnership at a time. Kuest can do thousands simultaneously, because we are the protocol - not the counterparty.')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section" id="p8">
          <div className="panel-sticky">
            <div className="panel-inner protocol-section-center">
              <div className="r quote-stage-head protocol-heading-wide">
                <div className="slbl justify-center">{t('WHERE WE ARE TODAY')}</div>
                <h2 className="sh">{t('MVP live. Protocol operational. Looking for the right partners to scale.')}</h2>
              </div>
              <div className="r rd audience-rows protocol-status-rows">
                {statusItems.map(item => (
                  <article key={item.label} className="audience-row">
                    <div
                      className={`audience-row-icon ${item.complete ? 'is-complete' : 'is-pending'}`}
                      aria-hidden="true"
                    >
                      {item.complete ? <Check /> : <Clock3 />}
                    </div>
                    <div className="audience-row-body">
                      <h3>{item.label}</h3>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static panel-compact" id="p9">
          <div className="panel-sticky">
            <div className="cta-content r v py-12">
              <h2 className="cta-h">{t('The infrastructure layer for prediction markets is being built right now.')}</h2>
              <p className="cta-sub">{t('We\'d rather have the right partners at the right moment than move fast without alignment. If you\'re an investor, market maker, or institutional operator - let\'s talk.')}</p>
              <div className="protocol-final-primary">
                <button type="button" className="btn-cta btn-cta-primary" data-protocol-deck-open>
                  <span className="cta-label">{t('Request pitch deck')}</span>
                  <ChevronRightIcon />
                </button>
              </div>
              <div className="cta-btns protocol-final-actions mt-6!">
                <a href={CONTACT_HREF} className="btn-cta btn-cta-secondary">
                  <span className="cta-label">{t('Contact the team')}</span>
                  <ChevronRightIcon />
                </a>
                <a
                  href={demoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta btn-cta-secondary"
                >
                  <span className="cta-label">{t('View live demo')}</span>
                  <ChevronRightIcon />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        note={t('Built on Polymarket-derived contracts, audited by OpenZeppelin')}
        docsLabel={t('Docs')}
        contactLabel={t('Contact')}
        xLabel="X"
        discordLabel="Discord"
      />

      <ProtocolPitchDeckModal />

      <MarketingPageRuntime nextSectionId="p1" finalSectionId="p9" />
    </>
  )
}

function ProtocolQuoteCard({
  quote,
  attribution,
  sourceLabel,
  sourceHref,
  media,
  centered = false,
  hideAttribution = false,
}: {
  quote: string
  attribution: string
  sourceLabel?: string
  sourceHref?: string
  media: { kind: 'image', src: string } | { kind: 'kuest-mark' }
  centered?: boolean
  hideAttribution?: boolean
}) {
  const titleClassName = `prediction-showcase-title protocol-quote-card-title${
    quote.length > 110 ? ' is-long' : ''
  }`

  return (
    <article className={`prediction-showcase-card protocol-quote-card${centered ? 'is-centered' : ''}`}>
      <div
        className={`prediction-showcase-thumb protocol-quote-card-thumb${
          media.kind === 'kuest-mark' ? 'is-kuest-mark' : ''
        }`}
        aria-hidden="true"
      >
        {media.kind === 'image'
          ? (
              <Image src={media.src} alt="" width={92} height={92} />
            )
          : (
              <span className="protocol-quote-card-thumb-mark">
                <KuestMark />
              </span>
            )}
      </div>
      <h3 className={titleClassName}>{quote}</h3>
      {!hideAttribution || (sourceLabel && sourceHref)
        ? (
            <div className="protocol-quote-card-meta">
              {!hideAttribution ? <div className="protocol-quote-card-attribution">{attribution}</div> : null}
              {sourceLabel && sourceHref
                ? (
                    <a
                      href={sourceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="protocol-quote-card-source"
                    >
                      {sourceLabel}
                    </a>
                  )
                : null}
            </div>
          )
        : null}
    </article>
  )
}
