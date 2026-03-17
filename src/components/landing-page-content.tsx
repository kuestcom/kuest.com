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
const EARLY_ACCESS_AVATAR_SRCS = [
  "https://avatars.githubusercontent.com/u/1?v=4",
  "https://avatars.githubusercontent.com/u/2?v=4",
  "https://avatars.githubusercontent.com/u/3?v=4",
  "https://avatars.githubusercontent.com/u/4?v=4",
  "https://avatars.githubusercontent.com/u/5?v=4",
] as const;

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

function formatSolutionConclusionHeading(value?: string | null) {
  const text = (value ?? "").trim();
  return text ? `${text.replace(/[.:!?\u3002\uff01\uff1f]\s*$/, "").trim()}:` : "";
}

function renderSolutionCopyContent(titleRest: string[], subtitleLines: string[]) {
  const [calloutLine, ...bodyLines] = subtitleLines;
  const conclusionLine = bodyLines.length > 0 ? bodyLines[bodyLines.length - 1] : "";
  const proseLines = conclusionLine ? bodyLines.slice(0, -1) : bodyLines;

  return (
    <>
      {titleRest.map((line, index) => (
        <span key={`intro-${index}`} className="solution-copy-line">
          {line}
        </span>
      ))}
      {calloutLine ? (
        <span className="solution-copy-callout">
          <span className="solution-copy-callout-mark">
            <KuestMark />
          </span>
          <span>{calloutLine}</span>
        </span>
      ) : null}
      {proseLines.map((line, index) => {
        if (index !== 0) {
          return (
            <span key={`prose-${index}`} className="solution-copy-line">
              {line}
            </span>
          );
        }

        const sentenceBreakMatch = line.match(/^(.+?[.!?]["']?)(?:\s+)(.+)$/);

        if (!sentenceBreakMatch) {
          return (
            <span key={`prose-${index}`} className="solution-copy-line">
              {line}
            </span>
          );
        }

        const [, firstSentence, remainingCopy] = sentenceBreakMatch;

        return (
          <span key={`prose-${index}`} className="solution-copy-block">
            <span className="solution-copy-line">{firstSentence.trim()}</span>
            <span className="solution-copy-line">{remainingCopy.trim()}</span>
          </span>
        );
      })}
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
  const solutionBodyLines = solutionSubtitleLines.slice(1);
  const solutionFlowHeading = formatSolutionConclusionHeading(solutionBodyLines[solutionBodyLines.length - 1]);
  const socialProofStats = bundle.socialProof.stats;

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
            labelToDark={bundle.themeToggle.toDark}
            labelToLight={bundle.themeToggle.toLight}
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
                        labelToDark={bundle.themeToggle.toDark}
                        labelToLight={bundle.themeToggle.toLight}
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
              <div className="attention-scroll-copy" aria-label={bundle.attentionScroll.ariaLabel}>
                <div className="attention-scroll-block">
                  <p className="attention-scroll-line" data-attention-step="line">
                    {bundle.attentionScroll.block1.line1}
                  </p>
                  <p className="attention-scroll-line" data-attention-step="line">
                    {bundle.attentionScroll.block1.line2}
                  </p>
                  <p className="attention-scroll-line" data-attention-step="line">
                    {bundle.attentionScroll.block1.line3}
                  </p>
                  <p className="attention-scroll-line attention-scroll-line-pivot" data-attention-step="line">
                    {bundle.attentionScroll.block1.line4}
                  </p>
                </div>
                <div className="attention-scroll-block attention-scroll-block-map">
                  <p className="attention-scroll-line" data-attention-step="line">
                    {bundle.attentionScroll.block2.line1}
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
                    {bundle.attentionScroll.block2.line3}
                  </p>
                  <p className="attention-scroll-line" data-attention-step="line">
                    {bundle.attentionScroll.block2.line4}
                  </p>
                </div>
                <div className="attention-scroll-block">
                  <p
                    className="attention-scroll-line attention-scroll-line-lead"
                    data-attention-step="line"
                  >
                    {bundle.attentionScroll.block3.lead}
                  </p>
                  <p className="attention-scroll-line" data-attention-step="line">
                    {bundle.attentionScroll.block3.line2}
                  </p>
                  <p className="attention-scroll-line attention-scroll-line-pivot" data-attention-step="line">
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
                {socialProofStats.map((stat) => (
                  <article key={`${stat.value}-${stat.label}`} className="mn">
                    <div className="mn-num">{stat.value}</div>
                    <div className="mn-label">{stat.label}</div>
                  </article>
                ))}
              </div>
              <div className="r flex items-center justify-center gap-3 border-t border-white/6 pt-5 mt-6">
                <div className="flex">
                  {EARLY_ACCESS_AVATAR_SRCS.map((src, index) => (
                    <span
                      key={src}
                      className="inline-flex overflow-hidden rounded-full border-2 border-[#0e1117] bg-card"
                      style={{ marginLeft: index === 0 ? 0 : -8 }}
                    >
                      <Image src={src} alt="" width={28} height={28} className="h-7 w-7 object-cover" />
                    </span>
                  ))}
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[.12em] text-faint">
                  {bundle.socialProof.joinedLabel}
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
                      {renderSolutionCopyContent(solutionTitleLines.slice(1), solutionSubtitleLines)}
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
                  <h2 className="sh">{solutionFlowHeading}</h2>
                </div>
                <div className="solution-timeline" aria-label={bundle.solution.timelineAriaLabel}>
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
              <h2 className="cta-h">{bundle.midCta.title}</h2>
              <div className="cta-btns">
                <a href={launchHref} className="btn-cta btn-cta-primary">
                  <span className="cta-label">{bundle.midCta.cta}</span>
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
                  <div className="slbl">{bundle.faq.eyebrow}</div>
                  <h2
                    className="sh"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeTranslatedHtml(bundle.faq.titleHtml, locale),
                    }}
                  />
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

        <section className="panel-wrap panel-static panel-compact marketing-final-section" id="p9">
          <div className="panel-sticky">
            <div className="marketing-final-panel">
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
              <div className="marketing-footer-wrap">
                <SiteFooter
                  note={bundle.footer.note}
                  docsLabel={bundle.footer.docs}
                  contactLabel={bundle.footer.contact}
                  xLabel="X"
                  discordLabel="Discord"
                />
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

      <MarketingPageRuntime nextSectionId="p1-scroll" finalSectionId="p9" />
    </>
  );
}
