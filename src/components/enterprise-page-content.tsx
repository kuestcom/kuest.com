import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  DockMenuControl,
  HeroMarketStage,
  KuestMark,
  LanguageControl,
  ShowcaseIcon,
  SiteFooter,
  ThemeToggle,
} from "@/components/marketing-shared";
import { MarketingPageRuntime } from "@/components/marketing-page-runtime";
import { NicheShowcase } from "@/components/niche-showcase";
import { RotatingProofCards } from "@/components/rotating-proof-cards";
import { SitePreview } from "@/components/site-preview";
import { SourceModal } from "@/components/source-modal";
import {
  buildThemeBootstrapScript,
  DEFAULT_HERO_MARKET_TITLES,
  ENTERPRISE_NICHES,
  getDemoEmbedSrc,
  getDemoHref,
  getDemoLabel,
} from "@/lib/marketing-content";
import {
  getLandingMessages,
  getSiteOrigin,
  localeHref,
  siteLocales,
  type SiteLocale,
} from "@/i18n/site";

const CONTACT_HREF = "mailto:hello@kuest.com?subject=Enterprise%20Demo";
const THEME_LABELS = {
  toDark: "Switch to dark mode",
  toLight: "Switch to light mode",
};

const MARKET_TODAY_STATS = [
  {
    value: "$18.3B",
    label: "combined monthly volume, Kalshi + Polymarket",
    sourceHref: "https://www.theblock.co/post/392755",
    sourceLabel: "Source: The Block, Q1 2026",
  },
  {
    value: "200x",
    label: "Kalshi annual volume growth, 2024-2025",
    sourceHref: "https://www.pymnts.com/partnerships/2026/kalshi-begins-global-expansion-with-xp-deal-brazil/",
    sourceLabel: "Source: PYMNTS, 2026",
  },
  {
    value: "66%",
    label: "of Polymarket traffic from outside the US",
    sourceHref: "https://www.similarweb.com/website/polymarket.com/",
    sourceLabel: "Source: SimilarWeb, Feb 2026",
  },
  {
    value: "$20B",
    label: "target valuation in current fundraising rounds",
    sourceHref: "https://www.coindesk.com/business/2026/03/07/kalshi-polymarket-seeking-usd20-billion-valuations-in-fundraising-talks-wsj",
    sourceLabel: "Source: CoinDesk via WSJ",
  },
] as const;

const ENTERPRISE_FEATURES = [
  {
    icon: "activity",
    title: "CLOB engine + relayer + matching",
    copy: "Central limit order book, relayer infrastructure, and matching engine - the same architecture powering Polymarket, running on Polygon mainnet.",
  },
  {
    icon: "shield-check",
    title: "OpenZeppelin-audited contracts",
    copy: "Smart contracts derived from Polymarket's audited architecture, adapted for shared liquidity across multiple operator frontends. UMA-based resolution for verifiable settlement.",
  },
  {
    icon: "users",
    title: "Shared liquidity from day one",
    copy: "Mirror live Polymarket markets with existing order flow. Your platform launches with real depth - no cold start, no market maker recruitment required initially.",
  },
  {
    icon: "bot",
    title: "Bot SDKs for institutional traders",
    copy: "Python and Rust SDKs compatible with existing Polymarket bot strategies. Market makers already operating on Polymarket can port to your platform without rebuilding.",
  },
  {
    icon: "globe-2",
    title: "Full white-label frontend",
    copy: "Your domain, your brand, your language. Multi-language UI with built-in i18n. Custom event categories. Looks and feels like a native product of your institution - not a Kuest deployment.",
  },
  {
    icon: "server",
    title: "Fully managed infrastructure",
    copy: "Gas costs, settlement, scalability, monitoring - all handled on our side. No blockchain team needed internally. No cloud infrastructure to manage. You focus on distribution.",
  },
] as const;

const ENTERPRISE_PROOF_CARDS = [
  {
    label: "Monthly volume",
    value: "$18.3B",
    copyHtml:
      'Kalshi + Polymarket combined monthly volume, according to <a href="https://www.theblock.co/post/392755" class="source-link" data-source-outlet="The Block" data-source-title="Prediction Market Volume">The Block</a>.',
  },
  {
    label: "Outside the US",
    value: "66%",
    copyHtml:
      'Polymarket traffic coming from outside the United States, according to <a href="https://www.similarweb.com/website/polymarket.com/" class="source-link" data-source-outlet="SimilarWeb" data-source-title="Polymarket traffic share">SimilarWeb</a>.',
  },
  {
    label: "Valuation signal",
    value: "$20B",
    copyHtml:
      'Current fundraising target valuation for both Kalshi and Polymarket, via <a href="https://www.coindesk.com/business/2026/03/07/kalshi-polymarket-seeking-usd20-billion-valuations-in-fundraising-talks-wsj" class="source-link" data-source-outlet="CoinDesk" data-source-title="Prediction market valuations">CoinDesk</a>.',
  },
] as const;

const ENTERPRISE_FAQ = [
  {
    q: "What exactly is a prediction market - and how is it different from a betting platform?",
    aHtml:
      "A prediction market is a live order book where participants buy and sell positions on the outcome of real-world events - using the same binary contract mechanics as financial derivatives. Unlike sports betting, where the house sets odds and takes the other side, a prediction market is peer-to-peer: prices are set by supply and demand in real time. The platform operator earns a fee on each trade, not on who wins.",
  },
  {
    q: "Who are Kalshi and Polymarket, and why are they relevant here?",
    aHtml:
      "Kalshi is a US-regulated exchange focused on event contracts. Polymarket is a decentralized prediction market running on Polygon. Together they demonstrated that prediction markets are not a niche - they are a new financial primitive. Both are closed platforms; Kuest provides the same infrastructure in an open, white-label model.",
  },
  {
    q: "What's happening in the market right now that makes this timely?",
    aHtml:
      "Kalshi and Polymarket are in active fundraising rounds at $20B valuations each. B3 is entering the category in Brazil. Kalshi signed its first international institutional deal with XP International. The institutional infrastructure question is being decided right now, and most local markets still have no operator.",
  },
  {
    q: "What types of institutions are already moving into this space?",
    aHtml:
      "Brokerages, exchanges, financial media groups, sports analytics companies, and institutional trading desks are all testing event contracts. The demand exists in every major market, but very few local operators have built the infrastructure.",
  },
  {
    q: "Can we create markets exclusive to our platform and client base?",
    aHtml:
      "Yes. You can create proprietary markets on macro, politics, rates, commodities, crypto, or any category aligned with your institution. Mirrored markets from Polymarket are available from day one for immediate liquidity depth.",
  },
  {
    q: "What are the fee economics for the operator?",
    aHtml:
      "You set your own trading fee rate - typically 0.5% to 3% per trade. Every transaction on your platform routes that fee directly to your institution. Kuest retains a small protocol fee on top.",
  },
  {
    q: "What does our team actually need to do to deploy?",
    aHtml:
      "Your team provides brand assets, defines the initial event scope, and reviews the fee structure. Kuest handles contract deployment, infrastructure configuration, liquidity bootstrapping, and frontend deployment.",
  },
  {
    q: "What is the technical and compliance foundation?",
    aHtml:
      'Smart contracts are derived from Polymarket\'s CLOB architecture and use UMA-based resolution rails. The codebase is open source under the <a href="https://github.com/kuestcom/prediction-market/blob/main/LICENSE" target="_blank" rel="noopener">Kuest MIT+Commons license</a>. Custom compliance configurations and enterprise infrastructure agreements are available - <a href="mailto:hello@kuest.com">contact us</a> to discuss your regulatory environment.',
  },
] as const;

export async function buildEnterpriseMetadata(locale: SiteLocale): Promise<Metadata> {
  const siteOrigin = getSiteOrigin();
  const canonical = new URL(localeHref(locale, "/enterprise"), siteOrigin);
  const ogImage = new URL("/assets/images/your-predictoin-market-500mi-vol.png", siteOrigin);

  return {
    metadataBase: new URL(siteOrigin),
    title: "Kuest Enterprise",
    description:
      "White-label prediction market infrastructure for financial institutions, media platforms, and enterprise operators.",
    alternates: {
      canonical,
      languages: Object.fromEntries(
        siteLocales.map((entry) => [entry, localeHref(entry, "/enterprise")]),
      ),
    },
    openGraph: {
      type: "website",
      siteName: "Kuest",
      title: "Kuest Enterprise",
      description:
        "White-label prediction market infrastructure for financial institutions, media platforms, and enterprise operators.",
      url: canonical,
      images: [{ url: ogImage, alt: "Kuest Enterprise preview" }],
    },
    twitter: {
      card: "summary",
      title: "Kuest Enterprise",
      description:
        "White-label prediction market infrastructure for financial institutions, media platforms, and enterprise operators.",
      images: [ogImage],
    },
  };
}

export async function EnterprisePageContent({ locale }: { locale: SiteLocale }) {
  const bundle = await getLandingMessages(locale);

  return (
    <>
      <script
        id="enterprise-theme-bootstrap"
        dangerouslySetInnerHTML={{ __html: buildThemeBootstrapScript() }}
      />

      <nav id="heroNav" className="hero-nav">
        <div className="nav-r">
          <LanguageControl
            locale={locale}
            path="/enterprise"
            controlId="siteLanguageControl"
            buttonId="siteLanguageButton"
            menuId="siteLanguageMenu"
            flagId="siteLanguageCurrentFlag"
            labelId="siteLanguageCurrentLabel"
            ariaLabel={bundle.languageSelector.ariaLabel}
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
            homeHref={localeHref(locale, "/")}
            enterpriseHref={localeHref(locale, "/enterprise")}
            protocolHref={localeHref(locale, "/protocol")}
            active="enterprise"
          />
          <LanguageControl
            locale={locale}
            path="/enterprise"
            controlId="dockSiteLanguageControl"
            buttonId="dockSiteLanguageButton"
            menuId="dockSiteLanguageMenu"
            flagId="dockSiteLanguageCurrentFlag"
            labelId="dockSiteLanguageCurrentLabel"
            ariaLabel={bundle.languageSelector.ariaLabel}
          />
          <ThemeToggle
            id="dockThemeToggle"
            className="dock-theme-toggle"
            labelToDark={THEME_LABELS.toDark}
            labelToLight={THEME_LABELS.toLight}
          />
          <a href={CONTACT_HREF} className="nb nb-solid nav-cta">
            <span className="cta-label">Contact us</span>
            <ArrowRight />
          </a>
        </div>
      </nav>

      <main id="page-top" className="page">
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
                        path="/enterprise"
                        controlId="heroBrandLanguageControl"
                        buttonId="heroBrandLanguageButton"
                        menuId="heroBrandLanguageMenu"
                        flagId="heroBrandLanguageCurrentFlag"
                        labelId="heroBrandLanguageCurrentLabel"
                        ariaLabel={bundle.languageSelector.ariaLabel}
                      />
                      <ThemeToggle
                        id="heroBrandThemeToggle"
                        className="dock-theme-toggle hero-brand-theme-toggle"
                        labelToDark={THEME_LABELS.toDark}
                        labelToLight={THEME_LABELS.toLight}
                      />
                    </div>
                  </div>
                  <div className="hero-kicker !mb-5 !gap-3 !opacity-100 !animate-none">
                    White-Label Prediction Market Infrastructure
                  </div>
                  <h1 className="hero-title enterprise-hero-title font-sans text-[clamp(46px,6.2vw,88px)] font-bold leading-[0.94] tracking-[-0.05em] text-white">
                    <span className="hero-title-line">A new financial instrument</span>
                    <span className="hero-title-line">
                      is forming.&nbsp;<span className="hero-title-accent">Be the platform.</span>
                    </span>
                  </h1>
                </div>
                <div className="hero-copy-side">
                  <p className="hero-copy-sub text-[clamp(17px,1.75vw,20px)] leading-[1.55] text-muted">
                    Prediction markets already process billions in monthly volume - and 66% of that
                    demand comes from outside the US, without a single local operator. Kuest lets
                    financial institutions, brokerages, and media companies launch their own
                    branded prediction market: audited infrastructure, shared liquidity, your fee
                    on every trade.
                  </p>
                  <div className="hero-copy-actions flex flex-wrap gap-3">
                    <a href={CONTACT_HREF} className="btn-cta btn-cta-primary">
                      <span className="cta-label">Contact us</span>
                      <ArrowRight />
                    </a>
                    <a href="#p3-demo" className="btn-cta btn-cta-secondary">
                      <span className="cta-label">View demo</span>
                      <ArrowRight />
                    </a>
                  </div>
                  <div className="hero-copy-proof font-mono text-[11px] uppercase tracking-[.16em] text-faint">
                    $18B combined monthly volume - OpenZeppelin audited - White-label ready
                  </div>
                </div>
              </div>
              <HeroMarketStage titles={DEFAULT_HERO_MARKET_TITLES} yesLabel="Yes" noLabel="No" />
            </div>
          </div>
        </section>

        <section className="panel-wrap attention-scroll-panel" id="p1-scroll">
          <div className="panel-sticky">
            <div className="panel-inner attention-scroll-shell">
              <div className="attention-scroll-copy" aria-label="The opportunity in prediction markets">
                <div className="attention-scroll-block">
                  <p className="attention-scroll-line">Your clients are already trading on Polymarket.</p>
                  <p className="attention-scroll-line">Elections. Interest rates. Bitcoin prices. Economic outcomes.</p>
                  <p className="attention-scroll-line">
                    They&apos;re doing it on a US-based platform. Outside your ecosystem. Paying
                    fees to someone else.
                  </p>
                  <p className="attention-scroll-line attention-scroll-line-pivot">
                    You have no visibility into it. No revenue from it. And it&apos;s growing fast.
                  </p>
                </div>
                <div className="attention-scroll-block attention-scroll-block-map">
                  <p className="attention-scroll-line">
                    Polymarket and Kalshi now process over $18 billion in monthly trading volume.
                  </p>
                  <div className="attention-scroll-brand-row" aria-hidden="true">
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
                  <p className="attention-scroll-line">66% of their users are outside the US - in your markets.</p>
                  <p className="attention-scroll-line">
                    Without a single local institution capturing that demand.
                  </p>
                </div>
                <div className="attention-scroll-block">
                  <p className="attention-scroll-line attention-scroll-line-lead">
                    XP International - Brazil&apos;s largest brokerage - just partnered with Kalshi
                    to fix exactly this.
                  </p>
                  <p className="attention-scroll-line">
                    They saw the volume flowing out of their ecosystem and decided to own the infrastructure.
                  </p>
                  <p className="attention-scroll-line attention-scroll-line-pivot">
                    You don&apos;t need to wait for Kalshi to call you.
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
                <div className="slbl justify-center">THE MARKET TODAY</div>
              </div>
              <div className="r market-numbers market-numbers-4">
                {MARKET_TODAY_STATS.map((stat) => (
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

        <section className="panel-wrap panel-static" id="p2">
          <div className="panel-sticky">
            <div className="panel-inner prediction-explainer">
              <div className="prediction-explainer-copy r">
                <div className="hero-kicker prediction-explainer-kicker">
                  A NEW FINANCIAL INSTRUMENT - ALREADY LIVE AT SCALE
                </div>
                <h2 className="prediction-explainer-title">Prediction Market</h2>
                <p className="prediction-explainer-sub">
                  Think of it as a binary derivative on future events. People trade positions on
                  outcomes using real money, in a live order book. Because financial stakes force
                  discipline, the prices generated consistently outperform polls, analyst forecasts,
                  and expert panels. The trading volume it generates goes to whoever owns the platform.
                </p>
              </div>
              <NicheShowcase niches={ENTERPRISE_NICHES} yesLabel="Yes" noLabel="No" />
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static" id="p3">
          <div className="panel-sticky">
            <div className="panel-inner max-w-[1180px] grid-cols-1 gap-10">
              <div className="solution-split r">
                <div className="solution-head">
                  <h2 className="sh">From signed agreement to live platform - in days, not quarters.</h2>
                </div>
                <div className="solution-body">
                  <div className="solution-copy-lead">
                    <p className="bt">
                      Audited smart contracts, shared liquidity from day one, full white-label -
                      your team signs off on the brand, we handle everything else.
                    </p>
                  </div>
                  <div className="solution-proof-pane">
                    <RotatingProofCards cards={ENTERPRISE_PROOF_CARDS} />
                  </div>
                </div>
                <div className="solution-timeline" aria-label="How Kuest works">
                  <div className="solution-timeline-rail" aria-hidden="true">
                    <span className="solution-timeline-head" />
                  </div>
                  {[
                    {
                      title: "Define your market scope and fee model",
                      copy: "Choose the event categories your clients care about - macroeconomics, interest rates, politics, commodities, crypto, sports. Create proprietary markets exclusive to your platform. Set your fee rate. We configure everything around your brand and regulatory perimeter.",
                    },
                    {
                      title: "We deploy the full technical stack - zero engineering required",
                      copy: "Smart contracts, CLOB engine, settlement rails, wallet infrastructure, liquidity - all running before your team finishes onboarding. Contracts are derived from Polymarket's architecture, audited by OpenZeppelin. No internal blockchain team needed. No infrastructure sprint.",
                    },
                    {
                      title: "Your platform earns a fee on every trade, automatically",
                      copy: "Every transaction your clients execute generates a direct fee to your institution - no intermediary, no revenue share, no settlement lag. The same infrastructure model used by platforms that collectively process over $18 billion in monthly volume.",
                    },
                  ].map((point, index) => (
                    <article
                      key={point.title}
                      className={`solution-timeline-step ${
                        index % 2 === 0
                          ? "solution-timeline-step-top solution-timeline-step-right"
                          : "solution-timeline-step-bottom solution-timeline-step-left"
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
                        <span className="cta-label">Contact us</span>
                        <ArrowRight />
                      </a>
                      <div className="solution-cta-note" id="solutionCtaNote">
                        WHITE-LABEL - AUDITED CONTRACTS - LIQUIDITY INCLUDED
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
            <div className="panel-inner max-w-[1180px] grid-cols-1 gap-10">
              <div className="r text-center">
                <div className="slbl justify-center">WHAT&apos;S ALREADY OPERATIONAL</div>
                <h2 className="sh">The full trading stack. No engineering sprint required.</h2>
                <p className="bt section-copy-center">
                  Everything your institution would need to build from scratch - already live,
                  already audited, ready to deploy under your brand.
                </p>
              </div>
              <div className="r mini-cards-grid mini-cards-grid-feature">
                {ENTERPRISE_FEATURES.map((feature) => (
                  <div key={feature.title} className="mini-card mini-card-feature">
                    <div>
                      <div className="mini-card-head">
                        <span className="mini-card-icon">
                          <ShowcaseIcon name={feature.icon} />
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
            <div className="panel-inner preview-section site-demo-section grid-cols-1 gap-10">
              <div className="site-demo-copy">
                <div className="site-demo-copy-inner">
                  <h2 className="sh">This is the product your clients will interact with.</h2>
                  <p className="bt">
                    A fully functional demo running live markets mirrored from Polymarket. Your
                    deployment would carry your domain, your brand, your chosen event categories -
                    and your fee on every transaction your clients execute.
                  </p>
                </div>
              </div>
              <div className="r rd hero-preview-wide hero-preview-break">
                <SitePreview
                  href={getDemoHref(locale)}
                  label={getDemoLabel(locale)}
                  iframeSrc={getDemoEmbedSrc(locale)}
                  liveLabel={bundle.preview.liveLabel}
                  switchToDesktopLabel={bundle.preview.switchToDesktop}
                  switchToMobileLabel={bundle.preview.switchToMobile}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static" id="p8">
          <div className="panel-sticky">
            <div className="panel-inner max-w-[1180px] grid-cols-1 items-start">
              <div className="r faq-layout">
                <div className="faq-head">
                  <h2 className="sh">FAQ</h2>
                </div>
                <div className="faq-list">
                  {ENTERPRISE_FAQ.map((item) => (
                    <details key={item.q} className="faq-item">
                      <summary className="faq-q">{item.q}</summary>
                      <div className="faq-divider" aria-hidden="true" />
                      <div className="faq-panel">
                        <div className="faq-panel-inner">
                          <div className="faq-a" dangerouslySetInnerHTML={{ __html: item.aHtml }} />
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
            <div className="cta-content r py-12">
              <h2 className="cta-h">
                Your clients are already trading on Polymarket. The question is whether that
                happens on your platform.
              </h2>
              <p className="cta-sub">
                The infrastructure is ready. First mover advantage in prediction markets closes fast.
              </p>
              <div className="cta-btns">
                <a href={CONTACT_HREF} className="btn-cta btn-cta-primary">
                  <span className="cta-label">Contact us</span>
                  <ArrowRight />
                </a>
                <a
                  href={getDemoHref(locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta btn-cta-secondary"
                >
                  <span className="cta-label">View live demo</span>
                  <ArrowRight />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SourceModal
        outlet={bundle.sourceModal.outlet}
        title={bundle.sourceModal.title}
        loading={bundle.sourceModal.loading}
        note={bundle.sourceModal.note}
        externalLabel={bundle.sourceModal.external}
        backLabel={bundle.sourceModal.back}
        dynamicNote={bundle.sourceModal.dynamicNote}
      />

      <SiteFooter
        note="Built on Polymarket-derived contracts, audited by OpenZeppelin"
        docsLabel={bundle.footer.docs}
        contactLabel={bundle.footer.contact}
        xLabel="X"
        discordLabel="Discord"
      />

      <MarketingPageRuntime nextSectionId="p1-scroll" finalSectionId="p9" />
    </>
  );
}
