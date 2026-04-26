import type { Metadata } from 'next'
import type { ShowcaseIconName, ShowcaseNiche } from '@/lib/marketing-shared-data'
import { ChevronRightIcon } from 'lucide-react'
import { hasLocale } from 'next-intl'
import { getExtracted, setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import HeroMarketStage from '@/components/HeroMarketStage'
import KuestMark from '@/components/KuestMark'
import LanguageControl from '@/components/LanguageControl'
import MarketingDockNav from '@/components/MarketingDockNav'
import MarketingPageRuntime from '@/components/MarketingPageRuntime'
import NicheShowcase from '@/components/NicheShowcase'
import ShowcaseIcon from '@/components/ShowcaseIcon'
import SiteFooter from '@/components/SiteFooter'
import SitePreview from '@/components/SitePreview'
import SourceModal from '@/components/SourceModal'
import ThemeToggle from '@/components/ThemeToggle'
import TimelineSpine from '@/components/TimelineSpine'
import { SUPPORTED_LOCALES } from '@/i18n/locales'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { CONTACT_HREF } from '@/lib/constants'
import {
  buildEmbedPreviewBootstrapScript,
  getDemoEmbedSrc,
  getDemoHref,
  getDemoLabel,
} from '@/lib/marketing-content'
import { resolveSiteUrl } from '@/lib/site-url'

const THE_BLOCK_HREF = 'https://www.theblock.co/post/392755'
const PYMNTS_HREF = 'https://www.pymnts.com/partnerships/2026/kalshi-begins-global-expansion-with-xp-deal-brazil/'
const SIMILARWEB_HREF = 'https://www.similarweb.com/website/polymarket.com/'
const COINDESK_HREF = 'https://www.coindesk.com/business/2026/03/07/kalshi-polymarket-seeking-usd20-billion-valuations-in-fundraising-talks-wsj'

export async function generateMetadata({ params }: PageProps<'/[locale]/enterprise'>): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const t = await getExtracted()
  const siteOrigin = resolveSiteUrl(process.env)
  const canonical = new URL(getPathname({ href: '/', locale }), siteOrigin)
  const ogImage = new URL('/assets/images/your-predictoin-market-500mi-vol.png', siteOrigin)

  return {
    metadataBase: new URL(siteOrigin),
    title: t('Kuest Enterprise'),
    description: t('White-label prediction market infrastructure for financial institutions, media platforms, and enterprise operators.'),
    alternates: {
      canonical,
      languages: Object.fromEntries(SUPPORTED_LOCALES.map(entry => [entry, entry === 'en' ? '/enterprise' : `/${entry}/enterprise`])),
    },
    openGraph: {
      type: 'website',
      siteName: 'Kuest',
      title: t('Kuest Enterprise'),
      description: t('White-label prediction market infrastructure for financial institutions, media platforms, and enterprise operators.'),
      url: canonical,
      images: [{ url: ogImage, alt: t('Kuest Enterprise preview') }],
    },
    twitter: {
      card: 'summary',
      title: t('Kuest Enterprise'),
      description: t('White-label prediction market infrastructure for financial institutions, media platforms, and enterprise operators.'),
      images: [ogImage],
    },
  }
}

export default async function EnterprisePage({ params }: PageProps<'/[locale]/enterprise'>) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const t = await getExtracted()

  const stats = [
    {
      value: '$18.3B',
      label: t('combined monthly volume, Kalshi + Polymarket'),
      sourceHref: THE_BLOCK_HREF,
      sourceLabel: t('Source: The Block, Q1 2026'),
    },
    {
      value: '200x',
      label: t('Kalshi annual volume growth, 2024-2025'),
      sourceHref: PYMNTS_HREF,
      sourceLabel: t('Source: PYMNTS, 2026'),
    },
    {
      value: '66%',
      label: t('of Polymarket traffic from outside the US'),
      sourceHref: SIMILARWEB_HREF,
      sourceLabel: t('Source: SimilarWeb, Feb 2026'),
    },
    {
      value: '$20B',
      label: t('target valuation in current fundraising rounds'),
      sourceHref: COINDESK_HREF,
      sourceLabel: t('Source: CoinDesk via WSJ'),
    },
  ]

  const niches = [
    {
      tag: t('Crypto & Assets'),
      tagline: t('Deploy a branded market around crypto and digital assets.'),
      accent: '#f7931a',
      accentRgb: '247,147,26',
      icon: 'bitcoin' as const,
      cards: [
        {
          type: 'single',
          img: '/assets/images/bitcoin-150k.png',
          title: t('Will Bitcoin close above $150K before Q4?'),
          vol: '$42k Vol.',
          cat: t('Crypto'),
          pct: 61,
        },
        {
          type: 'single',
          img: '/assets/images/ethereum-flippening.png',
          title: t('Will Ethereum flip Bitcoin\'s market cap in 2026?'),
          vol: '$29k Vol.',
          cat: t('Crypto'),
          pct: 18,
        },
        {
          type: 'multi',
          img: '/assets/images/uniswap-v4-mainnet.png',
          title: t('Which asset class leads net inflows next quarter?'),
          vol: '$31k Vol.',
          cat: t('Assets'),
          rows: [
            { label: 'BTC', pct: 42 },
            { label: 'ETH', pct: 51 },
            { label: t('Other'), pct: 7 },
          ],
        },
      ],
    },
    {
      tag: t('Elections & Policy'),
      tagline: t('Own political and public policy flows in your market.'),
      accent: '#8b5cf6',
      accentRgb: '139,92,246',
      icon: 'landmark' as const,
      cards: [
        {
          type: 'single',
          img: '/assets/images/brazil-election-2026.png',
          title: t('Will the incumbent coalition keep a governing majority?'),
          vol: '$38k Vol.',
          cat: t('Politics'),
          pct: 47,
        },
        {
          type: 'single',
          img: '/assets/images/donald-trump-president.png',
          title: t('Will the next U.S. administration create a strategic BTC reserve?'),
          vol: '$24k Vol.',
          cat: t('Policy'),
          pct: 35,
        },
        {
          type: 'multi',
          img: '/assets/images/uk-general-election.png',
          title: t('Who wins the next UK general election?'),
          vol: '$19k Vol.',
          cat: 'UK',
          rows: [
            { label: t('Labour'), pct: 58 },
            { label: t('Conservative'), pct: 28 },
            { label: t('Other'), pct: 14 },
          ],
        },
      ],
    },
    {
      tag: t('Macro & Rates'),
      tagline: t('Price macro outcomes directly on your own platform.'),
      accent: '#4f8ef7',
      accentRgb: '79,142,247',
      icon: 'trending-up' as const,
      cards: [
        {
          type: 'multi',
          img: '/assets/images/fed-rate-move.png',
          title: t('Next Fed decision'),
          vol: '$31k Vol.',
          cat: t('Rates'),
          rows: [
            { label: t('Cut'), pct: 42 },
            { label: t('Hold'), pct: 51 },
            { label: t('Hike'), pct: 7 },
          ],
        },
        {
          type: 'single',
          img: '/assets/images/russia-x-ukraine.png',
          title: t('Will a ceasefire lower global energy prices before year-end?'),
          vol: '$22k Vol.',
          cat: t('Macro'),
          pct: 34,
        },
        {
          type: 'single',
          img: '/assets/images/elon-500b-net-worth.png',
          title: t('Will real rates fall below 1% before Q1?'),
          vol: '$15k Vol.',
          cat: t('Macro'),
          pct: 38,
        },
      ],
    },
    {
      tag: t('Commodities'),
      tagline: t('Turn volatility in commodities into client engagement and fees.'),
      accent: '#f0b429',
      accentRgb: '240,180,41',
      icon: 'bar-chart-2' as const,
      cards: [
        {
          type: 'single',
          img: '/assets/images/bitcoin-150k.png',
          title: t('Will gold hit a new all-time high this quarter?'),
          vol: '$17k Vol.',
          cat: 'Gold',
          pct: 56,
        },
        {
          type: 'single',
          img: '/assets/images/fed-rate-move.png',
          title: t('Will Brent close above $100 before year-end?'),
          vol: '$12k Vol.',
          cat: t('Oil'),
          pct: 29,
        },
        {
          type: 'multi',
          img: '/assets/images/governance-vote-chain.png',
          title: t('Which commodity outperforms next month?'),
          vol: '$14k Vol.',
          cat: t('Macro'),
          rows: [
            { label: t('Gold'), pct: 44 },
            { label: t('Oil'), pct: 33 },
            { label: t('Copper'), pct: 23 },
          ],
        },
      ],
    },
    {
      tag: t('Sports'),
      tagline: t('Launch sports markets under your own regulated surface.'),
      accent: '#34d07f',
      accentRgb: '52,208,127',
      icon: 'trophy' as const,
      cards: [
        {
          type: 'multi',
          img: '/assets/images/champions-league-top-scorer.png',
          title: t('Top scorer - Champions League final'),
          vol: '$18k Vol.',
          cat: t('Sports'),
          rows: [
            { label: 'Mbappe', pct: 34 },
            { label: 'Vinicius', pct: 28 },
            { label: 'Bellingham', pct: 19 },
          ],
        },
        {
          type: 'single',
          img: '/assets/images/warriors-playoffs.png',
          title: t('Will the Warriors make the playoffs?'),
          vol: '$11k Vol.',
          cat: 'NBA',
          pct: 55,
        },
        {
          type: 'single',
          img: '/assets/images/daniel-negranu-wsop.png',
          title: t('Will Daniel Negreanu reach the WSOP final table?'),
          vol: '$8k Vol.',
          cat: 'Poker',
          pct: 38,
        },
      ],
    },
    {
      tag: t('Custom Markets'),
      tagline: t('Create exclusive event contracts tailored to your own audience.'),
      accent: '#f43f5e',
      accentRgb: '244,63,94',
      icon: 'sliders' as const,
      cards: [
        {
          type: 'single',
          img: '/assets/images/discord-50k-members.png',
          title: t('Will our private client community hit 50K members this quarter?'),
          vol: '$9k Vol.',
          cat: t('Community'),
          pct: 44,
        },
        {
          type: 'single',
          img: '/assets/images/marvel-opening-weekend.png',
          title: t('Will the flagship local IPO price above its range?'),
          vol: '$10k Vol.',
          cat: t('Custom'),
          pct: 41,
        },
        {
          type: 'multi',
          img: '/assets/images/elon-usa-election.png',
          title: t('Which bespoke macro scenario plays out first?'),
          vol: '$13k Vol.',
          cat: t('Scenario'),
          rows: [
            { label: t('Soft landing'), pct: 39 },
            { label: t('Reflation'), pct: 35 },
            { label: t('Shock'), pct: 26 },
          ],
        },
      ],
    },
  ]

  const solutionPoints = [
    {
      title: t('Define your market scope and fee model'),
      copy: t('Choose the event categories your clients care about - macroeconomics, interest rates, politics, commodities, crypto, sports. Create proprietary markets exclusive to your platform. Set your fee rate. We configure everything around your brand and regulatory perimeter.'),
    },
    {
      title: t('We deploy the full technical stack - zero engineering required'),
      copy: t('Smart contracts, CLOB engine, settlement rails, wallet infrastructure, liquidity - all running before your team finishes onboarding. Contracts are derived from Polymarket\'s architecture, audited by OpenZeppelin. No internal blockchain team needed. No infrastructure sprint.'),
    },
    {
      title: t('Your platform earns a fee on every trade, automatically'),
      copy: t('Every transaction your clients execute generates a direct fee to your institution - no intermediary, no revenue share, no settlement lag. The same infrastructure model used by platforms that collectively process over $18 billion in monthly volume.'),
    },
  ]

  const featureCards = [
    {
      icon: 'activity',
      title: t('CLOB engine + relayer + matching'),
      copy: t('Central limit order book, relayer infrastructure, and matching engine — the same architecture powering Polymarket, running on Polygon mainnet.'),
    },
    {
      icon: 'shield-check',
      title: t('OpenZeppelin-audited contracts'),
      copy: t('Smart contracts derived from Polymarket\'s audited architecture, adapted for shared liquidity across multiple operator frontends. UMA-based resolution for verifiable settlement.'),
    },
    {
      icon: 'users',
      title: t('Shared liquidity from day one'),
      copy: t('Mirror live Polymarket markets with existing order flow. Your platform launches with real depth — no cold start, no market maker recruitment required initially.'),
    },
    {
      icon: 'bot',
      title: t('Bot SDKs for institutional traders'),
      copy: t('Python and Rust SDKs compatible with existing Polymarket bot strategies. Market makers already operating on Polymarket can port to your platform without rebuilding.'),
    },
    {
      icon: 'globe-2',
      title: t('Full white-label frontend'),
      copy: t('Your domain, your brand, your language. Multi-language UI with built-in i18n. Custom event categories. Looks and feels like a native product of your institution — not a Kuest deployment.'),
    },
    {
      icon: 'server',
      title: t('Fully managed infrastructure'),
      copy: t('Gas costs, settlement, scalability, monitoring - all handled on our side. No blockchain team needed internally. No cloud infrastructure to manage. You focus on distribution.'),
    },
  ]

  const faqItems = [
    {
      q: t(
        'What exactly is a prediction market - and how is it different from a betting platform?',
      ),
      a: t(
        'A prediction market is a live order book where participants buy and sell positions on the outcome of real-world events — using the same binary contract mechanics as financial derivatives. Unlike sports betting, where the house sets odds and takes the other side, a prediction market is peer-to-peer: prices are set by supply and demand in real time. The platform operator earns a fee on each trade, not on who wins. This distinction matters legally, commercially, and reputationally: operators are not the counterparty, and the model is structurally closer to an exchange than a bookmaker.',
      ),
    },
    {
      q: t(
        'Who are Kalshi and Polymarket, and why are they relevant here?',
      ),
      a: t(
        'Kalshi is a US-regulated exchange (CFTC-licensed) focused on event contracts — "Will the Fed cut rates?", "Will there be a recession?" — valued at over $2 billion and growing 200x in annual trading volume. Polymarket is a decentralized prediction market running on Polygon, drawing over 32 million monthly visits globally, used by traders, journalists, and policymakers as a real-time probability layer. Together they generated $18.3 billion in combined trading volume in a single quarter (Q1 2026). Both are closed platforms: you can trade on them, but you cannot build branded products on top of them or capture their fee revenue. Kuest provides the same infrastructure in an open, white-label model.',
      ),
    },
    {
      q: t(
        'What\'s happening in the market right now that makes this timely?',
      ),
      a: t(
        'Several signals are converging: Kalshi and Polymarket are in active fundraising rounds at $20 billion valuations each. B3, Brazil\'s main stock exchange, launched its first prediction market products in early 2026 under CVM supervision. Kalshi signed its first international institutional deal — with XP International, one of Brazil\'s largest brokerages with 4.7 million clients and R$1.8 trillion under management — specifically to expand outside the US. CME Group and Bloomberg now publish prediction market data as institutional reference. The regulatory direction in the US, Brazil, and EU is moving toward formal recognition of event contracts. The institutional infrastructure question is being decided right now, and most local markets still have no operator.',
      ),
    },
    {
      q: t(
        'What types of institutions are already moving into this space?',
      ),
      a: t(
        'Beyond Kalshi and Polymarket themselves: B3 launched binary option contracts on the dollar, Ibovespa, and Bitcoin. Bloomberg integrates Kalshi market data into terminal products. Brokerages in Germany, India, and Israel — Polymarket\'s top non-US markets — have no local branded platform yet. Financial media companies with large audiences (Reuters, FT, regional equivalents) are evaluating prediction market embeds as interactive revenue products. Sports analytics and media companies are early movers in fan-facing prediction products. The pattern is consistent: the demand exists in every major market, but no local operator has built the infrastructure.',
      ),
    },
    {
      q: t(
        'Can we create markets exclusive to our platform and client base?',
      ),
      a: t(
        'Yes. You can create proprietary markets on any question — rate decisions, earnings outcomes, macro indicators, political events, or themes exclusive to your institution\'s positioning. Mirrored markets from Polymarket are available from day one for immediate liquidity depth. Custom markets draw from your client base, with optional cross-market liquidity sharing across the Kuest operator network.',
      ),
    },
    {
      q: t('What are the fee economics for the operator?'),
      a: t(
        'You set your own trading fee rate — typically 0.5% to 3% per trade. Every transaction on your platform routes that fee directly to your institution. Kuest retains a small protocol fee on top. No revenue share, no minimums, no lock-in period. You control the rate and can configure it by market category or event type. Enterprise agreements with custom SLAs are available.',
      ),
    },
    {
      q: t('What does our team actually need to do to deploy?'),
      a: t(
        'Your team provides brand assets (logo, colors, domain), defines the initial event scope, and reviews the fee structure. Kuest handles contract deployment, infrastructure configuration, liquidity bootstrapping, and frontend deployment. No internal blockchain engineers required. No cloud infrastructure to manage. Ongoing operations — gas costs, settlement, scalability, monitoring — are fully managed on our side.',
      ),
    },
    {
      q: t('What is the technical and compliance foundation?'),
      a: t.rich(
        'Smart contracts are derived from Polymarket\'s CLOB architecture — the stack that has processed billions in verified volume — audited by OpenZeppelin, the institutional standard for on-chain infrastructure. Settlement uses UMA-based resolution rails for transparent, verifiable outcomes. The codebase is open source under the <license>Kuest MIT+Commons license</license> for full auditability. Custom compliance configurations and enterprise infrastructure agreements are available — <contact>contact us</contact> to discuss your regulatory environment.',
        {
          license: chunks => (
            <a
              href="https://github.com/kuestcom/prediction-market/blob/main/LICENSE"
              target="_blank"
              rel="noopener"
            >
              {chunks}
            </a>
          ),
          contact: chunks => (
            <a href="mailto:hello@kuest.com">{chunks}</a>
          ),
        },
      ),
    },
  ]

  return (
    <>
      <Script
        id="enterprise-embed-preview"
        dangerouslySetInnerHTML={{ __html: buildEmbedPreviewBootstrapScript() }}
      />

      <TimelineSpine count={8} />

      <nav id="heroNav" className="hero-nav">
        <div className="nav-r">
          <LanguageControl
            locale={locale}
            path="/enterprise"
            controlId="dockSiteLanguageControl"
            buttonId="dockSiteLanguageButton"
            menuId="dockSiteLanguageMenu"
            flagId="dockSiteLanguageCurrentFlag"
            labelId="dockSiteLanguageCurrentLabel"
            ariaLabel={t('Change site language')}
          />
        </div>
      </nav>

      <MarketingDockNav
        locale={locale}
        active="enterprise"
        languagePath="/enterprise"
        demoHref="#p3-demo"
        demoLabel="Demo"
        ctaHref={CONTACT_HREF}
        ctaLabel={t('Contact us')}
      />

      <main id="page-top" className="page enterprise-page">
        <section className="panel-wrap panel-static hero-stack-panel" id="p0">
          <div className="panel-sticky">
            <div className="panel-inner hero-stack">
              <div className="r hero-copy">
                <div className="hero-copy-main">
                  <div className="hero-brand-row">
                    <div className="hero-brand" aria-hidden="true">
                      <KuestMark />
                      <span>Kuest</span>
                    </div>
                    <div className="hero-brand-controls">
                      <LanguageControl
                        locale={locale}
                        path="/"
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
                  <div className="hero-kicker mb-5! animate-none! gap-3! opacity-100!">
                    {t('White-Label Prediction Market Infrastructure')}
                  </div>
                  <h1 className="
                    hero-title enterprise-hero-title font-sans text-[clamp(46px,6.2vw,88px)] leading-[0.94] font-bold
                    tracking-[-0.05em] text-white
                  "
                  >
                    <span className="hero-title-line">{t('A new financial instrument')}</span>
                    <span className="hero-title-line">
                      {t('is forming')}
                      .&nbsp;
                      <span className="hero-title-accent">
                        {t('Be the platform')}
                        .
                      </span>
                    </span>
                  </h1>
                </div>
                <div className="hero-copy-side">
                  <p className="hero-copy-sub text-[clamp(17px,1.75vw,20px)] leading-[1.55] text-muted">
                    {t('Prediction markets already process billions in monthly volume — and 66% of that demand comes from outside the US, without a single local operator. Kuest lets financial institutions, brokerages, and media companies launch their own branded prediction market: audited infrastructure, shared liquidity, your fee on every trade.')}
                  </p>
                  <div className="hero-copy-actions flex flex-wrap gap-3">
                    <a href={CONTACT_HREF} className="btn-cta btn-cta-primary">
                      <span className="cta-label">{t('Contact us')}</span>
                      <ChevronRightIcon />
                    </a>
                    <a href="#p3-demo" className="btn-cta btn-cta-secondary">
                      <span className="cta-label">{t('View demo')}</span>
                      <ChevronRightIcon />
                    </a>
                  </div>
                  <div className="hero-copy-proof text-faint font-mono text-[11px] tracking-[.16em] uppercase">
                    {t('$18B combined monthly volume - OpenZeppelin audited - White-label ready')}
                  </div>
                </div>
              </div>
              <HeroMarketStage
                titles={[
                  '',
                  t('Will the Fed cut rates before July?'),
                  '',
                  '',
                  '',
                  t('Will Trump announce a U.S. Bitcoin reserve this year?'),
                  '',
                  '',
                  '',
                  t('Will a Russia-Ukraine ceasefire be announced before year-end?'),
                  '',
                  '',
                ]}
                yesLabel={t('Yes')}
                noLabel={t('No')}
              />
            </div>
          </div>
        </section>

        <section className="panel-wrap attention-scroll-panel" id="p1-scroll">
          <div className="panel-sticky">
            <div className="panel-inner attention-scroll-shell">
              <div className="attention-scroll-copy" aria-label={t('The opportunity in prediction markets')}>
                <div className="attention-scroll-block">
                  <p className="attention-scroll-line" data-attention-step="line">
                    {t('Your clients are already trading on Polymarket.')}
                  </p>
                  <p className="attention-scroll-line" data-attention-step="line">
                    {t('Elections. Interest rates. Bitcoin prices. Economic outcomes.')}
                  </p>
                  <p className="attention-scroll-line" data-attention-step="line">
                    {t('They\'re doing it on a US-based platform. Outside your ecosystem. Paying fees to someone else.')}
                  </p>
                  <p className="attention-scroll-line attention-scroll-line-pivot" data-attention-step="line">
                    {t('You have no visibility into it. No revenue from it. And it\'s growing fast.')}
                  </p>
                </div>
                <div className="attention-scroll-block attention-scroll-block-map">
                  <p className="attention-scroll-line" data-attention-step="line">
                    {t('Polymarket and Kalshi now process over $18 billion in monthly trading volume.')}
                  </p>
                  <div className="attention-scroll-brand-row" data-attention-step="brands" aria-hidden="true">
                    <div className="attention-scroll-brand">
                      <Image
                        src="/assets/images/polymarket-logo.svg"
                        alt="Polymarket"
                        width={132}
                        height={28}
                        className="attention-scroll-brand-logo"
                      />
                    </div>
                    <div className="attention-scroll-brand">
                      <Image
                        src="/assets/images/kalshi-logo.svg"
                        alt="Kalshi"
                        width={124}
                        height={28}
                        className="attention-scroll-brand-logo"
                      />
                    </div>
                  </div>
                  <p className="attention-scroll-line" data-attention-step="line">
                    {t('66% of their users are outside the US - in your markets.')}
                  </p>
                  <p className="attention-scroll-line" data-attention-step="line">
                    {t('Without a single local institution capturing that demand.')}
                  </p>
                </div>
                <div className="attention-scroll-block">
                  <p
                    className="attention-scroll-line attention-scroll-line-lead"
                    data-attention-step="line"
                  >
                    {t('XP International - Brazil\'s largest brokerage - just partnered with Kalshi to fix exactly this.')}
                  </p>
                  <p className="attention-scroll-line" data-attention-step="line">
                    {t('They saw the volume flowing out of their ecosystem and decided to own the infrastructure.')}
                  </p>
                  <p className="attention-scroll-line attention-scroll-line-pivot" data-attention-step="line">
                    {t('You don\'t need to wait for Kalshi to call you.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static" id="p-market-today">
          <div className="panel-sticky">
            <div className="panel-inner max-w-[1180px] grid-cols-1">
              <div className="r text-center">
                <div className="slbl justify-center">{t('THE MARKET TODAY')}</div>
              </div>
              <div className="r market-numbers market-numbers-4">
                {stats.map(stat => (
                  <article key={stat.value} className="mn">
                    <div className="mn-num">{stat.value}</div>
                    <div className="mn-label">{stat.label}</div>
                    <div className="mn-sub">
                      <a href={stat.sourceHref} target="_blank" rel="noopener noreferrer" className="source-link">
                        {stat.sourceLabel}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static mt-24!" id="p2">
          <div className="panel-sticky">
            <div className="panel-inner prediction-explainer">
              <div className="prediction-explainer-copy r">
                <div className="hero-kicker prediction-explainer-kicker">{t('A NEW FINANCIAL INSTRUMENT - ALREADY LIVE AT SCALE')}</div>
                <h2 className="prediction-explainer-title">{t('Prediction Market')}</h2>
                <p className="prediction-explainer-sub">{t('Think of it as a binary derivative on future events. People trade positions on outcomes — who wins an election, whether a rate is cut, if a company hits an earnings target — using real money, in a live order book. Because financial stakes force discipline, the prices generated consistently outperform polls, analyst forecasts, and expert panels. The data is used by hedge funds, central banks, and policy teams to anticipate outcomes before they happen. The trading volume it generates goes to whoever owns the platform.')}</p>
              </div>
              <NicheShowcase
                niches={niches as ShowcaseNiche[]}
                yesLabel={t('Yes')}
                noLabel={t('No')}
              />
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static" id="p3">
          <div className="panel-sticky">
            <div className="panel-inner max-w-295 grid-cols-1 gap-10">
              <div className="solution-flow-stage enterprise-solution-flow-stage r">
                <div className="solution-flow-head enterprise-solution-flow-head">
                  <h2 className="sh">{t('From signed agreement to live platform — in days, not quarters.')}</h2>
                  <div className="solution-copy-lead enterprise-solution-flow-copy">
                    <p className="bt">{t('Audited smart contracts, shared liquidity from day one, full white-label — your team signs off on the brand, we handle everything else.')}</p>
                  </div>
                </div>
                <div className="solution-timeline lg:mt-32!" aria-label={t('How Kuest works')}>
                  <div className="solution-timeline-rail" aria-hidden="true">
                    <span className="solution-timeline-head" />
                  </div>
                  {solutionPoints.map((point, index) => (
                    <article
                      key={point.title}
                      className={`solution-timeline-step ${
                        index % 2 === 0
                          ? 'solution-timeline-step-top solution-timeline-step-right'
                          : 'solution-timeline-step-bottom solution-timeline-step-left'
                      }`}
                    >
                      {index % 2 === 0 ? <div className="solution-timeline-side" aria-hidden="true" /> : null}
                      <div className="solution-timeline-node" aria-hidden="true">
                        <span>{index + 1}</span>
                      </div>
                      <div className="solution-timeline-copy">
                        <h3 className="solution-timeline-title">{point.title}</h3>
                        <p className="solution-timeline-text">{point.copy}</p>
                      </div>
                      {index % 2 === 1 ? <div className="solution-timeline-side" aria-hidden="true" /> : null}
                    </article>
                  ))}
                  <div className="solution-timeline-cta">
                    <div className="solution-cta-block solution-cta-block-inline">
                      <a href={CONTACT_HREF} className="btn-cta btn-cta-primary" id="solutionCtaBtn">
                        <span className="cta-label">{t('Contact us')}</span>
                        <ChevronRightIcon />
                      </a>
                      <div className="solution-cta-note" id="solutionCtaNote">
                        {t('WHITE-LABEL - AUDITED CONTRACTS - LIQUIDITY INCLUDED')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static" id="p-features">
          <div className="panel-sticky">
            <div className="panel-inner max-w-295 grid-cols-1 gap-10">
              <div className="r text-center">
                <div className="slbl justify-center">{t('WHAT\'S ALREADY OPERATIONAL')}</div>
                <h2 className="sh">{t('The full trading stack. No engineering sprint required.')}</h2>
                <p className="bt section-copy-center">{t('Everything your institution would need to build from scratch - already live, already audited, ready to deploy under your brand.')}</p>
              </div>
              <div className="r mini-cards-grid mini-cards-grid-feature">
                {featureCards.map(feature => (
                  <div key={feature.title} className="mini-card mini-card-feature">
                    <div>
                      <div className="mini-card-head">
                        <span className="mini-card-icon">
                          <ShowcaseIcon name={feature.icon as ShowcaseIconName} />
                        </span>
                        <div className="mini-card-title">{feature.title}</div>
                      </div>
                      <div className="mini-card-copy">{feature.copy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static" id="p3-demo">
          <div className="panel-sticky">
            <div className="panel-inner preview-section site-demo-section max-w-[95vw]! grid-cols-1 gap-10">
              <div className="site-demo-copy">
                <div className="site-demo-copy-inner">
                  <h2 className="sh text-balance!">{t('This is the product your clients will interact with.')}</h2>
                  <p className="bt">{t('A fully functional demo running live markets mirrored from Polymarket. Your deployment would carry your domain, your brand, your chosen event categories - and your fee on every transaction your clients execute.')}</p>
                </div>
              </div>
              <div className="r rd hero-preview-wide hero-preview-break">
                <SitePreview
                  className="mx-auto!"
                  href={getDemoHref(locale)}
                  label={getDemoLabel(locale)}
                  iframeSrc={getDemoEmbedSrc(locale)}
                  liveLabel={t('Live Demo')}
                  switchToDesktopLabel={t('Switch to desktop preview')}
                  switchToMobileLabel={t('Switch to mobile preview')}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static" id="p8">
          <div className="panel-sticky">
            <div className="panel-inner max-w-295 grid-cols-1 items-start">
              <div className="r faq-layout">
                <div className="faq-head">
                  <h2 className="sh">{t('FAQ')}</h2>
                </div>
                <div className="faq-list">
                  {faqItems.map(item => (
                    <details key={item.q} className="faq-item">
                      <summary className="faq-q">{item.q}</summary>
                      <div className="faq-divider" aria-hidden="true" />
                      <div className="faq-panel">
                        <div className="faq-panel-inner">
                          <div className="faq-a">{item.a}</div>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static panel-compact" id="p9">
          <div className="panel-sticky">
            <div className="cta-content r v py-12">
              <h2 className="cta-h">{t('Your clients are already trading on Polymarket. The question is whether that happens on your platform.')}</h2>
              <p className="cta-sub">{t('The infrastructure is ready. First mover advantage in prediction markets closes fast.')}</p>
              <div className="cta-btns">
                <a href={CONTACT_HREF} className="btn-cta btn-cta-primary">
                  <span className="cta-label">{t('Contact us')}</span>
                  <ChevronRightIcon />
                </a>
                <a
                  href={getDemoHref(locale)}
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

      <SourceModal
        outlet={t('Source')}
        title={t('Source title')}
        loading={t('Loading source...')}
        note={t('If this publisher blocks embeds, use the external link below.')}
        externalLabel={t('Open source in new tab')}
        backLabel={t('Back to page')}
        dynamicNote="Embedded preview for {{domain}}. If the publisher blocks embeds, use the external link below."
      />

      <MarketingPageRuntime nextSectionId="p1-scroll" finalSectionId="p9" />
    </>
  )
}
