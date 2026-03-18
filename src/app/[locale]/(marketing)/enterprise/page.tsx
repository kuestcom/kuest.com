import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {getLandingMessages, getSiteOrigin, isSiteLocale, localeHref, siteLocales} from "@/i18n/site";
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {setRequestLocale} from "next-intl/server";
import {getEnterpriseContent} from "@/lib/marketing-page-copy";
import {
  buildEmbedPreviewBootstrapScript,
  buildThemeBootstrapScript,
  getDemoEmbedSrc,
  getDemoHref,
  getDemoLabel,
  sanitizeTranslatedHtml
} from "@/lib/marketing-content";
import LanguageControl from "@/components/LanguageControl";
import KuestMark from "@/components/KuestMark";
import DockMenuControl from "@/components/DockMenuControl";
import ThemeToggle from "@/components/ThemeToggle";
import {ChevronRightIcon} from "lucide-react";
import HeroMarketStage from "@/components/HeroMarketStage";
import Image from "next/image";
import NicheShowcase from "@/components/NicheShowcase";
import ShowcaseIcon from "@/components/ShowcaseIcon";
import SitePreview from "@/components/SitePreview";
import SiteFooter from "@/components/SiteFooter";
import SourceModal from "@/components/SourceModal";
import MarketingPageRuntime from "@/components/MarketingPageRuntime";
import {CONTACT_HREF} from "@/lib/constants";
import TimelineSpine from "@/components/TimelineSpine";

export async function generateMetadata({ params }: PageProps<'/[locale]/enterprise'>): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const siteOrigin = getSiteOrigin();
  const canonical = new URL(localeHref(locale, "/enterprise"), siteOrigin);
  const enterprise = getEnterpriseContent(locale);
  const ogImage = new URL("/assets/images/your-predictoin-market-500mi-vol.png", siteOrigin);

  return {
    metadataBase: new URL(siteOrigin),
    title: enterprise.meta.title,
    description: enterprise.meta.description,
    alternates: {
      canonical,
      languages: Object.fromEntries(
          siteLocales.map((entry) => [entry, localeHref(entry, "/enterprise")]),
      ),
    },
    openGraph: {
      type: "website",
      siteName: "Kuest",
      title: enterprise.meta.title,
      description: enterprise.meta.description,
      url: canonical,
      images: [{ url: ogImage, alt: enterprise.meta.imageAlt }],
    },
    twitter: {
      card: "summary",
      title: enterprise.meta.title,
      description: enterprise.meta.description,
      images: [ogImage],
    },
  };
}

export default async function EnterprisePage({ params }: PageProps<'/[locale]/enterprise'>) {
  const { locale } = await params;

  if (!isSiteLocale(locale)) {
    notFound();
  }

  const bundle = await getLandingMessages(locale);
  const enterprise = getEnterpriseContent(locale);

  return (
      <>
        <script
            id="enterprise-theme-bootstrap"
            dangerouslySetInnerHTML={{ __html: buildThemeBootstrapScript() }}
        />
        <script
            id="enterprise-embed-preview"
            dangerouslySetInnerHTML={{ __html: buildEmbedPreviewBootstrapScript() }}
        />

        <TimelineSpine />

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
                openLabel={bundle.nav.openMenuLabel}
                menuAriaLabel={bundle.nav.menuAriaLabel}
                homeLabel={bundle.nav.homeLabel}
                enterpriseLabel={bundle.nav.enterpriseLabel}
                protocolLabel={bundle.nav.protocolLabel}
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
                labelToDark={bundle.themeToggle.toDark}
                labelToLight={bundle.themeToggle.toLight}
            />
            <a href={CONTACT_HREF} className="nb nb-solid nav-cta">
              <span className="cta-label">{enterprise.hero.contactCta}</span>
              <ChevronRightIcon />
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
                            labelToDark={bundle.themeToggle.toDark}
                            labelToLight={bundle.themeToggle.toLight}
                        />
                      </div>
                    </div>
                    <div className="hero-kicker mb-5! gap-3! opacity-100! animate-none!">
                      {enterprise.hero.kicker}
                    </div>
                    <h1 className="hero-title enterprise-hero-title font-sans text-[clamp(46px,6.2vw,88px)] font-bold leading-[0.94] tracking-[-0.05em] text-white">
                      <span className="hero-title-line">{enterprise.hero.titleLine1}</span>
                      <span className="hero-title-line">
                      {enterprise.hero.titleLine2}&nbsp;
                        <span className="hero-title-accent">{enterprise.hero.titleAccent}</span>
                    </span>
                    </h1>
                  </div>
                  <div className="hero-copy-side">
                    <p className="hero-copy-sub text-[clamp(17px,1.75vw,20px)] leading-[1.55] text-muted">
                      {enterprise.hero.subtitle}
                    </p>
                    <div className="hero-copy-actions flex flex-wrap gap-3">
                      <a href={CONTACT_HREF} className="btn-cta btn-cta-primary">
                        <span className="cta-label">{enterprise.hero.contactCta}</span>
                        <ChevronRightIcon />
                      </a>
                      <a href="#p3-demo" className="btn-cta btn-cta-secondary">
                        <span className="cta-label">{enterprise.hero.viewDemoCta}</span>
                        <ChevronRightIcon />
                      </a>
                    </div>
                    <div className="hero-copy-proof font-mono text-[11px] uppercase tracking-[.16em] text-faint">
                      {enterprise.hero.proof}
                    </div>
                  </div>
                </div>
                <HeroMarketStage
                    titles={enterprise.hero.heroMarketTitles}
                    yesLabel={bundle.common.yes}
                    noLabel={bundle.common.no}
                />
              </div>
            </div>
          </section>

          <section className="panel-wrap attention-scroll-panel" id="p1-scroll">
            <div className="panel-sticky">
              <div className="panel-inner attention-scroll-shell">
                <div className="attention-scroll-copy" aria-label={enterprise.attention.ariaLabel}>
                  <div className="attention-scroll-block">
                    <p className="attention-scroll-line" data-attention-step="line">
                      {enterprise.attention.blockOne[0]}
                    </p>
                    <p className="attention-scroll-line" data-attention-step="line">
                      {enterprise.attention.blockOne[1]}
                    </p>
                    <p className="attention-scroll-line" data-attention-step="line">
                      {enterprise.attention.blockOne[2]}
                    </p>
                    <p className="attention-scroll-line attention-scroll-line-pivot" data-attention-step="line">
                      {enterprise.attention.blockOne[3]}
                    </p>
                  </div>
                  <div className="attention-scroll-block attention-scroll-block-map">
                    <p className="attention-scroll-line" data-attention-step="line">
                      {enterprise.attention.marketVolume}
                    </p>
                    <div className="attention-scroll-brand-row" data-attention-step="brands" aria-hidden="true">
                      <div className="attention-scroll-brand">
                        <Image
                            src="/assets/images/polymarket-logo.svg"
                            alt={enterprise.attention.polymarketAlt}
                            width={132}
                            height={28}
                            className="attention-scroll-brand-logo"
                        />
                      </div>
                      <div className="attention-scroll-brand">
                        <Image
                            src="/assets/images/kalshi-logo.svg"
                            alt={enterprise.attention.kalshiAlt}
                            width={124}
                            height={28}
                            className="attention-scroll-brand-logo"
                        />
                      </div>
                    </div>
                    <p className="attention-scroll-line" data-attention-step="line">
                      {enterprise.attention.outsideUs}
                    </p>
                    <p className="attention-scroll-line" data-attention-step="line">
                      {enterprise.attention.withoutLocalOperator}
                    </p>
                  </div>
                  <div className="attention-scroll-block">
                    <p
                        className="attention-scroll-line attention-scroll-line-lead"
                        data-attention-step="line"
                    >
                      {enterprise.attention.xpLead}
                    </p>
                    <p className="attention-scroll-line" data-attention-step="line">
                      {enterprise.attention.xpFollowUp}
                    </p>
                    <p className="attention-scroll-line attention-scroll-line-pivot" data-attention-step="line">
                      {enterprise.attention.xpPivot}
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
                  <div className="slbl justify-center">{enterprise.marketToday.eyebrow}</div>
                </div>
                <div className="r market-numbers market-numbers-4">
                  {enterprise.marketToday.stats.map((stat) => (
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
                  <div className="hero-kicker prediction-explainer-kicker">{enterprise.explainer.kicker}</div>
                  <h2 className="prediction-explainer-title">{enterprise.explainer.title}</h2>
                  <p className="prediction-explainer-sub">{enterprise.explainer.subtitle}</p>
                </div>
                <NicheShowcase
                    niches={enterprise.niches}
                    yesLabel={bundle.common.yes}
                    noLabel={bundle.common.no}
                />
              </div>
            </div>
          </section>

          <section className="panel-wrap panel-static" id="p3">
            <div className="panel-sticky">
              <div className="panel-inner max-w-[1180px] grid-cols-1 gap-10">
                <div className="solution-split enterprise-solution-split r">
                  <div className="solution-head">
                    <h2 className="sh">{enterprise.solution.title}</h2>
                  </div>
                  <div className="solution-body enterprise-solution-body">
                    <div className="solution-copy-lead">
                      <p className="bt">{enterprise.solution.lead}</p>
                    </div>
                  </div>
                  <div
                      className="solution-timeline enterprise-solution-timeline"
                      aria-label={enterprise.solution.timelineAriaLabel}
                  >
                    <div className="solution-timeline-rail" aria-hidden="true">
                      <span className="solution-timeline-head" />
                    </div>
                    {enterprise.solution.points.map((point, index) => (
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
                          <span className="cta-label">{enterprise.solution.cta}</span>
                          <ChevronRightIcon />
                        </a>
                        <div className="solution-cta-note" id="solutionCtaNote">
                          {enterprise.solution.note}
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
                  <div className="slbl justify-center">{enterprise.features.eyebrow}</div>
                  <h2 className="sh">{enterprise.features.title}</h2>
                  <p className="bt section-copy-center">{enterprise.features.subtitle}</p>
                </div>
                <div className="r mini-cards-grid mini-cards-grid-feature">
                  {enterprise.features.cards.map((feature) => (
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
                <div className="site-demo-copy enterprise-site-demo-copy">
                  <div className="site-demo-copy-inner enterprise-site-demo-copy-inner">
                    <h2 className="sh enterprise-site-demo-title">{enterprise.preview.title}</h2>
                    <p className="bt enterprise-site-demo-sub">{enterprise.preview.subtitle}</p>
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
                    <h2 className="sh">{enterprise.faq.title}</h2>
                  </div>
                  <div className="faq-list">
                    {enterprise.faq.items.map((item) => (
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

          <section className="panel-wrap panel-static panel-compact marketing-final-section enterprise-final-section" id="p9">
            <div className="panel-sticky">
              <div className="marketing-final-panel enterprise-final-panel justify-center">
                <div className="cta-content enterprise-cta-content r py-36!">
                  <h2 className="cta-h">{enterprise.finalCta.title}</h2>
                  <p className="cta-sub">{enterprise.finalCta.subtitle}</p>
                  <div className="cta-btns">
                    <a href={CONTACT_HREF} className="btn-cta btn-cta-primary">
                      <span className="cta-label">{enterprise.finalCta.contactCta}</span>
                      <ChevronRightIcon />
                    </a>
                    <a
                        href={getDemoHref(locale)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-cta btn-cta-secondary"
                    >
                      <span className="cta-label">{enterprise.finalCta.viewLiveDemoCta}</span>
                      <ChevronRightIcon />
                    </a>
                  </div>
                </div>
                <div className="marketing-footer-wrap enterprise-footer-wrap">
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
