import type { Metadata, Viewport } from "next";
import Image from "next/image";
import { ArrowRight, Bot, Globe2, Share2, ShieldCheck, Trophy, Zap } from "lucide-react";
import {
  DockMenuControl,
  HeroMarketStage,
  KuestMark,
  LanguageControl,
  SiteFooter,
  ThemeToggle,
} from "@/components/marketing-shared";
import { MarketingPageRuntime } from "@/components/marketing-page-runtime";
import { NicheShowcase } from "@/components/niche-showcase";
import { RotatingProofCards } from "@/components/rotating-proof-cards";
import { SitePreview } from "@/components/site-preview";
import { SourceModal } from "@/components/source-modal";
import {
  buildLandingNiches,
  buildLandingProofCards,
  buildThemeBootstrapScript,
  DEFAULT_HERO_MARKET_TITLES,
  getDemoEmbedSrc,
  getDemoHref,
  getDemoLabel,
  getLandingHeroAccent,
  sanitizeTranslatedHtml,
  serializeJsonForHtmlScript,
  stripTerminalPeriod,
  stripTrailingArrow,
} from "@/lib/marketing-content";
import {
  defaultSiteLocale,
  getLandingMessages,
  getSiteOrigin,
  localeHref,
  siteLocales,
  type SiteLocale,
} from "@/i18n/site";

const FEATURE_ICONS = [Globe2, Zap, Trophy, Share2, Bot, ShieldCheck] as const;
const THEME_LABELS = {
  toDark: "Switch to dark mode",
  toLight: "Switch to light mode",
};

function renderLandingHeroLine2(locale: SiteLocale, value: string) {
  const text = stripTerminalPeriod(value);
  const accentText = getLandingHeroAccent(locale);
  const matchIndex = text.lastIndexOf(accentText);

  if (matchIndex === -1) {
    return text;
  }

  let beforeText = text.slice(0, matchIndex);

  if (/\s$/.test(beforeText)) {
    beforeText = `${beforeText.slice(0, -1)}\u00a0`;
  }

  return (
    <>
      {beforeText}
      <span className="hero-title-accent">{text.slice(matchIndex, matchIndex + accentText.length)}</span>
      {text.slice(matchIndex + accentText.length)}
    </>
  );
}

export async function buildLandingMetadata(locale: SiteLocale): Promise<Metadata> {
  const bundle = await getLandingMessages(locale);
  const siteOrigin = getSiteOrigin();
  const canonical = new URL(localeHref(locale), siteOrigin);
  const ogImage = new URL("/assets/images/your-predictoin-market-500mi-vol.png", siteOrigin);

  return {
    title: bundle.meta.title,
    description: bundle.meta.description,
    keywords: [
      "create your prediction market",
      "white label prediction market",
      "prediction market whitelabel",
      "launch your own prediction market",
      "no-code prediction market",
      "branded prediction market",
      "shared liquidity",
    ],
    authors: [{ name: "Kuest" }],
    alternates: {
      canonical,
      languages: Object.fromEntries(siteLocales.map((entry) => [entry, localeHref(entry)])),
    },
    openGraph: {
      type: "website",
      siteName: "Kuest",
      title: bundle.meta.ogTitle,
      description: bundle.meta.ogDescription,
      url: canonical,
      images: [{ url: ogImage, alt: "Kuest prediction market preview" }],
    },
    twitter: {
      card: "summary",
      title: bundle.meta.twitterTitle,
      description: bundle.meta.twitterDescription,
      images: [ogImage],
    },
  };
}

export function buildLandingViewport(): Viewport {
  return {
    themeColor: "#CDFF00",
  };
}

export async function LandingPageContent({ locale }: { locale: SiteLocale }) {
  const bundle = await getLandingMessages(locale);
  const fallbackBundle =
    locale === defaultSiteLocale ? bundle : await getLandingMessages(defaultSiteLocale);
  const launchHref = localeHref(locale, "/launch");
  const previewHref = getDemoHref(locale);
  const previewSrc = getDemoEmbedSrc(locale);
  const previewLabel = getDemoLabel(locale);
  const proofCards = buildLandingProofCards(bundle, locale);
  const niches = buildLandingNiches(bundle, fallbackBundle);

  const solutionTitleLines = bundle.solution.title
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const solutionSubtitleLines = bundle.solution.subtitle
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <>
      <script
        id="landing-theme-bootstrap"
        dangerouslySetInnerHTML={{ __html: buildThemeBootstrapScript() }}
      />
      <script
        id="landing-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonForHtmlScript({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Kuest",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: new URL(localeHref(locale), getSiteOrigin()).toString(),
            description: bundle.meta.description,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "White-label prediction market platform",
              "Custom domain and branding",
              "Shared liquidity from day one",
              "Configurable trading fees",
              "No-code launch",
            ],
          }),
        }}
      />

      <nav id="heroNav" className="hero-nav">
        <div className="nav-r">
          <LanguageControl
            locale={locale}
            path="/"
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
            active="home"
          />
          <LanguageControl
            locale={locale}
            path="/"
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
          <a href={launchHref} className="nb nb-solid nav-cta">
            <span className="cta-label">{stripTrailingArrow(bundle.nav.cta)}</span>
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
                        path="/"
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
                    {bundle.hero.kicker}
                  </div>
                  <h1 className="hero-title font-sans text-[clamp(46px,6.2vw,88px)] font-bold leading-[0.94] tracking-[-0.05em] text-white">
                    <span className="hero-title-line">{stripTerminalPeriod(bundle.hero.titleLine1)}</span>
                    <span className="hero-title-line">
                      {renderLandingHeroLine2(locale, bundle.hero.titleLine2)}
                    </span>
                  </h1>
                </div>
                <div className="hero-copy-side">
                  <p className="hero-copy-sub text-[clamp(17px,1.75vw,20px)] leading-[1.55] text-muted">
                    {bundle.hero.subtitle}
                  </p>
                  <div className="hero-copy-actions flex flex-wrap gap-3">
                    <a href={launchHref} className="btn-cta btn-cta-primary">
                      <span className="cta-label">{stripTrailingArrow(bundle.hero.cta)}</span>
                      <ArrowRight />
                    </a>
                  </div>
                  <div className="hero-copy-proof font-mono text-[11px] uppercase tracking-[.16em] text-faint">
                    {bundle.hero.proof}
                  </div>
                </div>
              </div>
              <HeroMarketStage
                titles={DEFAULT_HERO_MARKET_TITLES}
                yesLabel={bundle.common.yes}
                noLabel={bundle.common.no}
              />
            </div>
          </div>
        </section>

        <section className="panel-wrap attention-scroll-panel" id="p1-scroll">
          <div className="panel-sticky">
            <div className="panel-inner attention-scroll-shell">
              <div className="attention-scroll-copy" aria-label="Attention shifts create windows of opportunity">
                <div className="attention-scroll-block">
                  <p className="attention-scroll-line">{bundle.attentionScroll.block1.line1}</p>
                  <p className="attention-scroll-line">{bundle.attentionScroll.block1.line2}</p>
                  <p className="attention-scroll-line">{bundle.attentionScroll.block1.line3}</p>
                  <p className="attention-scroll-line attention-scroll-line-pivot">
                    {bundle.attentionScroll.block1.line4}
                  </p>
                </div>
                <div className="attention-scroll-block attention-scroll-block-map">
                  <p className="attention-scroll-line">{bundle.attentionScroll.block2.line1}</p>
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
                  <p className="attention-scroll-line">{bundle.attentionScroll.block2.line3}</p>
                  <p className="attention-scroll-line">{bundle.attentionScroll.block2.line4}</p>
                </div>
                <div className="attention-scroll-block">
                  <p className="attention-scroll-line attention-scroll-line-lead">
                    {bundle.attentionScroll.block3.lead}
                  </p>
                  <p className="attention-scroll-line">{bundle.attentionScroll.block3.line2}</p>
                  <p className="attention-scroll-line attention-scroll-line-pivot">
                    {bundle.attentionScroll.block3.line3}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static panel-compact" id="p-social">
          <div className="panel-sticky">
            <div className="panel-inner max-w-[1180px]">
              <div className="r market-numbers market-numbers-4">
                <article className="mn">
                  <div className="mn-num">100+</div>
                  <div className="mn-label">markets launched on testnet</div>
                </article>
                <article className="mn">
                  <div className="mn-num">0.5-3%</div>
                  <div className="mn-label">fee per trade, direct to your wallet</div>
                </article>
                <article className="mn">
                  <div className="mn-num">15 min</div>
                  <div className="mn-label">average time to go live</div>
                </article>
                <article className="mn">
                  <div className="mn-num">Free</div>
                  <div className="mn-label">to launch, usage-based at scale</div>
                </article>
              </div>
              <div className="r flex items-center justify-center gap-3 border-t border-white/6 pt-5 mt-6">
                <div className="flex">
                  {["J", "M", "S", "N", "A"].map((initial, index) => (
                    <span
                      key={initial}
                      className="inline-flex size-7 items-center justify-center rounded-full border-2 border-[#0e1117] bg-card font-mono text-[10px] text-muted"
                      style={{ marginLeft: index === 0 ? 0 : -8 }}
                    >
                      {initial}
                    </span>
                  ))}
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[.12em] text-faint">
                  Joined by 100+ operators in early access
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static" id="p2">
          <div className="panel-sticky">
            <div className="panel-inner prediction-explainer">
              <div className="prediction-explainer-copy r">
                <div className="hero-kicker prediction-explainer-kicker">{bundle.social.eyebrow}</div>
                <h2 className="prediction-explainer-title">{bundle.social.title}</h2>
                <p className="prediction-explainer-sub">{bundle.social.subtitle}</p>
              </div>
              <NicheShowcase niches={niches} yesLabel={bundle.common.yes} noLabel={bundle.common.no} />
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static" id="p3">
          <div className="panel-sticky">
            <div className="panel-inner max-w-[1180px] grid-cols-1 gap-10">
              <div className="solution-split r">
                <div className="solution-head">
                  <h2 className="sh">{solutionTitleLines[0] ?? bundle.solution.title}</h2>
                </div>
                <div className="solution-body">
                  <div className="solution-copy-lead">
                    <div className="bt">
                      {solutionTitleLines.slice(1).map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                      {solutionSubtitleLines.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>
                  </div>
                  <div className="solution-proof-pane">
                    <RotatingProofCards cards={proofCards} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static" id="p3-flow">
          <div className="panel-sticky">
            <div className="panel-inner max-w-[1180px] grid-cols-1 gap-10">
              <div className="solution-flow-stage r">
                <div className="solution-flow-head">
                  <h2 className="sh">
                    {solutionSubtitleLines[solutionSubtitleLines.length - 1]?.replace(/[.:!?]\s*$/, "")}:
                  </h2>
                </div>
                <div className="solution-timeline" aria-label="How Kuest works">
                  <div className="solution-timeline-rail" aria-hidden="true">
                    <span className="solution-timeline-head" />
                  </div>
                  {bundle.solution.points.map((point, index) => (
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
                      <a href={launchHref} className="btn-cta btn-cta-primary" id="solutionCtaBtn">
                        <span className="cta-label">{bundle.solution.cta}</span>
                        <ArrowRight />
                      </a>
                      <div className="solution-cta-note" id="solutionCtaNote">
                        {bundle.solution.note}
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
                <div className="slbl justify-center">{bundle.features.eyebrow}</div>
                <h2 className="sh">{bundle.features.title}</h2>
                <p className="bt section-copy-center">{bundle.features.subtitle}</p>
              </div>
              <div className="r mini-cards-grid mini-cards-grid-feature">
                {bundle.features.cards.map((card, index) => {
                  const Icon = FEATURE_ICONS[index];

                  return (
                    <div key={card.title} className="mini-card mini-card-feature">
                      <div>
                        <div className="mini-card-head">
                          <span className="mini-card-icon">{Icon ? <Icon /> : null}</span>
                          <div className="mini-card-title">{card.title}</div>
                        </div>
                        <div className="mini-card-copy">{card.copy}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static" id="p3-demo">
          <div className="panel-sticky">
            <div className="panel-inner preview-section site-demo-section grid-cols-1 gap-10">
              <div className="site-demo-copy">
                <div className="site-demo-copy-inner">
                  <h2 className="sh">{bundle.preview.title}</h2>
                  <p className="bt">{bundle.preview.subtitle}</p>
                </div>
              </div>
              <div className="r rd hero-preview-wide hero-preview-break">
                <SitePreview
                  href={previewHref}
                  label={previewLabel}
                  iframeSrc={previewSrc}
                  liveLabel={bundle.preview.liveLabel}
                  switchToDesktopLabel={bundle.preview.switchToDesktop}
                  switchToMobileLabel={bundle.preview.switchToMobile}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static panel-compact" id="p-mid-cta">
          <div className="panel-sticky">
            <div className="cta-content r py-10">
              <h2 className="cta-h">Ready to turn your audience into a revenue stream?</h2>
              <div className="cta-btns">
                <a href={launchHref} className="btn-cta btn-cta-primary">
                  <span className="cta-label">Launch my market - it&apos;s free</span>
                  <ArrowRight />
                </a>
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
                  {bundle.faq.items.map((item) => (
                    <details key={item.q} className="faq-item">
                      <summary className="faq-q">{item.q}</summary>
                      <div className="faq-divider" aria-hidden="true" />
                      <div className="faq-panel">
                        <div className="faq-panel-inner">
                          <div
                            className="faq-a"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeTranslatedHtml(item.aHtml, locale),
                            }}
                          />
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
              <h2 className="cta-h">{bundle.finalCta.title}</h2>
              <p className="cta-sub">{bundle.finalCta.subtitle}</p>
              <div className="cta-btns">
                <a href={launchHref} className="btn-cta btn-cta-primary">
                  <span className="cta-label">{stripTrailingArrow(bundle.finalCta.cta)}</span>
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
