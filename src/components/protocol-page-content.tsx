/* eslint-disable @next/next/no-img-element */
import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Script from "next/script";
import {
  ArrowRight,
  Banknote,
  Bot,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  Globe2,
  Moon,
  Newspaper,
  Sun,
} from "lucide-react";
import {
  getProtocolMessages,
  getSiteOrigin,
  localeHref,
  siteLocales,
  type SiteLocale,
} from "@/i18n/site";
import { ProtocolPitchDeckModal } from "@/components/protocol-pitch-deck-modal";

const CONTACT_HREF = "mailto:hello@kuest.com?subject=Kuest%20Protocol";
const DEMO_HREF = "https://demo.kuest.com";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flagSrc: "/assets/flags/en.svg" },
  { code: "de", label: "Deutsch", flagSrc: "/assets/flags/de.svg" },
  { code: "es", label: "Español", flagSrc: "/assets/flags/es.svg" },
  { code: "pt", label: "Português", flagSrc: "/assets/flags/pt.svg" },
  { code: "fr", label: "Français", flagSrc: "/assets/flags/fr.svg" },
  { code: "zh", label: "中文", flagSrc: "/assets/flags/zh.svg" },
] satisfies ReadonlyArray<{ code: SiteLocale; label: string; flagSrc: string }>;

const HERO_MARKET_SCENES = [
  {
    sceneClassName: "hero-market-scene hero-market-scene-a",
    cards: [
      { cardClassName: "hero-market-card hero-market-card-a1", rotate: "-9deg", imageSrc: "/assets/images/bitcoin-150k.png" },
      {
        cardClassName: "hero-market-card hero-market-card-a2 is-featured",
        rotate: "-4deg",
        imageSrc: "/assets/images/fed-rate-move.png",
        expandSide: "right",
      },
      { cardClassName: "hero-market-card hero-market-card-a3", rotate: "8deg", imageSrc: "/assets/images/uniswap-v4-mainnet.png" },
      { cardClassName: "hero-market-card hero-market-card-a4", rotate: "4deg", imageSrc: "/assets/images/ethereum-flippening.png" },
    ],
  },
  {
    sceneClassName: "hero-market-scene hero-market-scene-b",
    cards: [
      { cardClassName: "hero-market-card hero-market-card-b1", rotate: "-7deg", imageSrc: "/assets/images/elon-500b-net-worth.png" },
      {
        cardClassName: "hero-market-card hero-market-card-b2 is-featured",
        rotate: "-2deg",
        imageSrc: "/assets/images/donald-trump-president.png",
        expandSide: "left",
      },
      { cardClassName: "hero-market-card hero-market-card-b3", rotate: "7deg", imageSrc: "/assets/images/discord-50k-members.png" },
      { cardClassName: "hero-market-card hero-market-card-b4", rotate: "3deg", imageSrc: "/assets/images/brazil-election-2026.png" },
    ],
  },
  {
    sceneClassName: "hero-market-scene hero-market-scene-c",
    cards: [
      { cardClassName: "hero-market-card hero-market-card-c1", rotate: "-8deg", imageSrc: "/assets/images/donald-trump-president.png" },
      {
        cardClassName: "hero-market-card hero-market-card-c2 is-featured",
        rotate: "-3deg",
        imageSrc: "/assets/images/russia-x-ukraine.png",
        expandSide: "right",
      },
      { cardClassName: "hero-market-card hero-market-card-c3", rotate: "8deg", imageSrc: "/assets/images/uk-general-election.png" },
      { cardClassName: "hero-market-card hero-market-card-c4", rotate: "4deg", imageSrc: "/assets/images/marvel-opening-weekend.png" },
    ],
  },
] as const;

function serializeJsonForHtmlScript(value: unknown) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003C")
    .replaceAll(">", "\\u003E")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

function buildThemeBootstrapScript() {
  return `(function(){var root=document.documentElement;var meta=document.querySelector('meta[name="theme-color"]');var mode='dark';try{var saved=window.localStorage.getItem('kuest-theme-mode');if(saved==='dark'||saved==='light')mode=saved;}catch(error){}root.setAttribute('data-theme-mode',mode);if(meta){var fallback=mode==='dark'?'#CDFF00':'#0e1117';try{var accent=getComputedStyle(root).getPropertyValue('--color-accent').trim();meta.setAttribute('content',accent||fallback);}catch(error){meta.setAttribute('content',fallback);}}})();`;
}

function KuestMark() {
  return <span className="kuest-logo-mark" aria-hidden="true" />;
}

function ThemeToggle({
  id,
  className,
  labelToDark,
  labelToLight,
}: {
  id: string;
  className: string;
  labelToDark: string;
  labelToLight: string;
}) {
  return (
    <button
      type="button"
      id={id}
      className={className}
      data-theme-toggle
      data-label-to-dark={labelToDark}
      data-label-to-light={labelToLight}
      aria-label={labelToDark}
      aria-pressed="false"
      title={labelToDark}
    >
      <span className="dock-theme-toggle-inner" aria-hidden="true">
        <span className="theme-toggle-icon theme-toggle-icon-light">
          <Sun />
        </span>
        <span className="theme-toggle-icon theme-toggle-icon-dark">
          <Moon />
        </span>
      </span>
    </button>
  );
}

function LanguageControl({
  locale,
  path,
  controlId,
  buttonId,
  menuId,
  flagId,
  labelId,
  ariaLabel,
}: {
  locale: SiteLocale;
  path: string;
  controlId: string;
  buttonId: string;
  menuId: string;
  flagId: string;
  labelId: string;
  ariaLabel: string;
}) {
  const currentLanguage = LANGUAGE_OPTIONS.find((option) => option.code === locale) ?? LANGUAGE_OPTIONS[0];

  return (
    <div className="site-language-control" id={controlId}>
      <button
        type="button"
        id={buttonId}
        className="site-language-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded="false"
      >
        <span className="site-language-trigger-content">
          <Image
            id={flagId}
            className="site-language-flag"
            src={currentLanguage.flagSrc}
            alt=""
            width={18}
            height={12}
          />
          <span id={labelId} className="site-language-label">
            {currentLanguage.label}
          </span>
        </span>
        <span className="site-language-icon" aria-hidden="true">
          <ChevronDown />
        </span>
      </button>
      <div id={menuId} className="site-language-menu" role="listbox" aria-label={ariaLabel}>
        {LANGUAGE_OPTIONS.map((option) => (
          <a
            key={option.code}
            href={localeHref(option.code, path)}
            className={`site-language-option${option.code === locale ? " is-selected" : ""}`}
            role="option"
            aria-selected={option.code === locale}
          >
            <span className="site-language-option-row">
              <Image
                className="site-language-flag"
                src={option.flagSrc}
                alt=""
                width={18}
                height={12}
              />
              <span>{option.label}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function DockMenuControl({
  homeHref,
  enterpriseHref,
  protocolHref,
  active,
}: {
  homeHref: string;
  enterpriseHref: string;
  protocolHref: string;
  active: "home" | "enterprise" | "protocol";
}) {
  return (
    <div className="site-language-control site-nav-control" id="dockSiteNavControl">
      <button
        type="button"
        id="dockSiteNavButton"
        className="dock-theme-toggle site-nav-trigger"
        aria-label="Open site navigation"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <span className="site-nav-trigger-bars" aria-hidden="true">
          <span className="site-nav-trigger-line" />
          <span className="site-nav-trigger-line" />
          <span className="site-nav-trigger-line" />
        </span>
      </button>
      <div id="dockSiteNavMenu" className="site-language-menu site-nav-menu" role="menu" aria-label="Site navigation">
        {active === "home" ? (
          <span className="site-language-option site-nav-option is-disabled" role="menuitem" aria-disabled="true">
            Home
          </span>
        ) : (
          <a href={homeHref} className="site-language-option site-nav-option" role="menuitem">
            Home
          </a>
        )}
        {active === "enterprise" ? (
          <span className="site-language-option site-nav-option is-disabled" role="menuitem" aria-disabled="true">
            Enterprise
          </span>
        ) : (
          <a href={enterpriseHref} className="site-language-option site-nav-option" role="menuitem">
            Enterprise
          </a>
        )}
        {active === "protocol" ? (
          <span className="site-language-option site-nav-option is-disabled" role="menuitem" aria-disabled="true">
            The Protocol
          </span>
        ) : (
          <a href={protocolHref} className="site-language-option site-nav-option" role="menuitem">
            The Protocol
          </a>
        )}
      </div>
    </div>
  );
}

function HeroMarketStage({
  titles,
  yesLabel,
  noLabel,
}: {
  titles: readonly string[];
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <div className="hero-market-stage" aria-hidden="true">
      {HERO_MARKET_SCENES.map((scene, sceneIndex) => (
        <div key={scene.sceneClassName} className={scene.sceneClassName}>
          {scene.cards.map((card, cardIndex) => {
            const titleIndex =
              HERO_MARKET_SCENES
                .slice(0, sceneIndex)
                .reduce((total, entry) => total + entry.cards.length, 0) + cardIndex;
            const title = titles[titleIndex] ?? "";
            const expandSide = "expandSide" in card ? card.expandSide : undefined;

            return (
              <figure
                key={card.cardClassName}
                className={card.cardClassName}
                data-expand-side={expandSide}
                style={{ ["--hero-market-rotate" as string]: card.rotate }}
              >
                <div className="protocol-hero-card-shell">
                  <div className="hero-market-card-media">
                    <img src={card.imageSrc} alt="" />
                  </div>
                  {expandSide ? (
                    <figcaption className="protocol-hero-card-panel" aria-hidden="true">
                      <div className="protocol-hero-card-title">{title}</div>
                      <div className="protocol-hero-card-actions">
                        <span className="hero-market-tooltip-btn hero-market-tooltip-btn-yes">{yesLabel}</span>
                        <span className="hero-market-tooltip-btn hero-market-tooltip-btn-no">{noLabel}</span>
                      </div>
                    </figcaption>
                  ) : null}
                </div>
              </figure>
            );
          })}
        </div>
      ))}
    </div>
  );
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
  quote: string;
  attribution: string;
  sourceLabel?: string;
  sourceHref?: string;
  media: { kind: "image"; src: string } | { kind: "kuest-mark" };
  centered?: boolean;
  hideAttribution?: boolean;
}) {
  const titleClassName = `prediction-showcase-title protocol-quote-card-title${
    quote.length > 110 ? " is-long" : ""
  }`;

  return (
    <article className={`prediction-showcase-card protocol-quote-card${centered ? " is-centered" : ""}`}>
      <div
        className={`prediction-showcase-thumb protocol-quote-card-thumb${
          media.kind === "kuest-mark" ? " is-kuest-mark" : ""
        }`}
        aria-hidden="true"
      >
        {media.kind === "image" ? (
          <Image src={media.src} alt="" width={92} height={92} />
        ) : (
          <span className="protocol-quote-card-thumb-mark">
            <KuestMark />
          </span>
        )}
      </div>
      <h3 className={titleClassName}>{quote}</h3>
      {!hideAttribution || (sourceLabel && sourceHref) ? (
        <div className="protocol-quote-card-meta">
          {!hideAttribution ? <div className="protocol-quote-card-attribution">{attribution}</div> : null}
          {sourceLabel && sourceHref ? (
            <a
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="protocol-quote-card-source"
            >
              {sourceLabel}
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export async function buildProtocolMetadata(locale: SiteLocale): Promise<Metadata> {
  const messages = await getProtocolMessages(locale);
  const siteOrigin = getSiteOrigin();
  const canonical = new URL(localeHref(locale, "/protocol"), siteOrigin);
  const ogImage = new URL("/assets/images/your-predictoin-market-500mi-vol.png", siteOrigin);
  const title = messages.meta.title;
  const description = messages.meta.description;

  return {
    title,
    description,
    keywords: messages.meta.keywords,
    authors: [{ name: "Kuest" }],
    alternates: {
      canonical,
      languages: Object.fromEntries(
        siteLocales.map((entry) => [entry, localeHref(entry, "/protocol")]),
      ),
    },
    openGraph: {
      type: "website",
      siteName: "Kuest",
      title,
      description,
      url: canonical,
      images: [
        {
          url: ogImage,
          alt: messages.meta.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function buildProtocolViewport(): Viewport {
  return {
    themeColor: "#CDFF00",
  };
}

export async function ProtocolPageContent({ locale }: { locale: SiteLocale }) {
  const messages = await getProtocolMessages(locale);
  const partnerIcons = [Banknote, Bot, Building2] as const;
  const [whyNowLead, ...whyNowRest] = messages.whyNow.paragraphs;
  const [architectureLead, ...architectureRest] = messages.architecture.paragraphs;

  const renderDemoLinkText = (value: string) => {
    const [before, after] = value.split("demo.kuest.com");

    if (after === undefined) {
      return value;
    }

    return (
      <>
        {before}
        <a href={DEMO_HREF} target="_blank" rel="noopener noreferrer">
          demo.kuest.com
        </a>
        {after}
      </>
    );
  };

  return (
    <>
      <script
        id="protocol-theme-bootstrap"
        dangerouslySetInnerHTML={{
          __html: buildThemeBootstrapScript(),
        }}
      />
      <Script
        id="protocol-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: serializeJsonForHtmlScript({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Kuest Protocol",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: new URL(localeHref(locale, "/protocol"), getSiteOrigin()).toString(),
            description: messages.structuredData.description,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: messages.structuredData.featureList,
          }),
        }}
      />
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
            ariaLabel={messages.languageSelector.ariaLabel}
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
            enterpriseHref="/enterprise"
            protocolHref={localeHref(locale, "/protocol")}
            active="protocol"
          />
          <LanguageControl
            locale={locale}
            path="/protocol"
            controlId="dockSiteLanguageControl"
            buttonId="dockSiteLanguageButton"
            menuId="dockSiteLanguageMenu"
            flagId="dockSiteLanguageCurrentFlag"
            labelId="dockSiteLanguageCurrentLabel"
            ariaLabel={messages.languageSelector.ariaLabel}
          />
          <ThemeToggle
            id="dockThemeToggle"
            className="dock-theme-toggle"
            labelToDark={messages.themeToggle.toDark}
            labelToLight={messages.themeToggle.toLight}
          />
          <a href={CONTACT_HREF} className="nb nb-solid nav-cta">
            <span className="cta-label">{messages.nav.contactCta}</span>
            <ArrowRight />
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
                        ariaLabel={messages.languageSelector.ariaLabel}
                      />
                      <ThemeToggle
                        id="heroBrandThemeToggle"
                        className="dock-theme-toggle hero-brand-theme-toggle"
                        labelToDark={messages.themeToggle.toDark}
                        labelToLight={messages.themeToggle.toLight}
                      />
                    </div>
                  </div>
                  <div className="hero-kicker protocol-hero-kicker">{messages.hero.kicker}</div>
                  <h1 className="hero-title font-sans text-[clamp(46px,6.2vw,88px)] font-bold leading-[0.94] tracking-[-0.05em] text-white">
                    <span className="hero-title-line">{messages.hero.titleLine1}</span>
                    <span className="hero-title-line">
                      {messages.hero.titleLine2BeforeAccent}
                      <span className="hero-title-accent">{messages.hero.titleLine2Accent}</span>
                    </span>
                  </h1>
                </div>
                <div className="hero-copy-side protocol-hero-side">
                  <p className="hero-copy-sub protocol-hero-sub">{messages.hero.subtitle}</p>
                  <div className="hero-copy-actions protocol-action-row">
                    <button type="button" className="btn-cta btn-cta-primary" data-protocol-deck-open>
                      <span className="cta-label">{messages.hero.pitchDeckCta}</span>
                      <ArrowRight />
                    </button>
                    <a href={CONTACT_HREF} className="btn-cta btn-cta-secondary">
                      <span className="cta-label">{messages.hero.contactCta}</span>
                      <ArrowRight />
                    </a>
                  </div>
                  <div className="hero-copy-proof protocol-proof-line">{messages.hero.proof}</div>
                </div>
              </div>
              <HeroMarketStage
                titles={messages.heroStage.cards}
                yesLabel={messages.common.yes}
                noLabel={messages.common.no}
              />
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section" id="p1">
          <div className="panel-sticky">
            <div className="panel-inner market-focus protocol-section-center">
              <div className="r">
                <div className="slbl justify-center">{messages.opportunity.badge}</div>
                <h2 className="sh">{messages.opportunity.title}</h2>
              </div>
              <div className="r rd market-proof-grid">
                <div className="market-numbers market-numbers-4">
                  {messages.opportunity.stats.map((stat) => (
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
                <p>{messages.opportunity.body}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section">
          <div className="panel-sticky">
            <div className="panel-inner protocol-copy-shell">
              <div className="r protocol-copy-head">
                <div className="slbl">{messages.whyNow.badge}</div>
                <h2 className="sh">{messages.whyNow.title}</h2>
              </div>
              <div className="r rd protocol-rich-text protocol-rich-text-wide">
                {whyNowLead ? <p>{whyNowLead}</p> : null}
                {whyNowLead ? (
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
                ) : null}
                {whyNowRest.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="r rd2 protocol-quote-wrap">
                <ProtocolQuoteCard
                  quote={messages.whyNow.quote.quote}
                  attribution={messages.whyNow.quote.attribution}
                  sourceLabel={messages.whyNow.quote.sourceLabel}
                  sourceHref={messages.whyNow.quote.sourceHref}
                  media={{
                    kind: "image",
                    src: "/assets/images/luana-kalshi.webp",
                  }}
                />
              </div>
              <div className="r rd3 protocol-rich-text">
                <p>{messages.whyNow.followup}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section">
          <div className="panel-sticky">
            <div className="panel-inner protocol-section-center">
              <div className="r quote-stage-head protocol-heading-wide">
                <div className="slbl justify-center">{messages.protocol.badge}</div>
                <h2 className="sh">{messages.protocol.title}</h2>
              </div>
              <div className="r rd steps-grid">
                {messages.protocol.cards.map((card, index) => (
                  <article key={card.title} className="step-card">
                    <div className="step-num">{String(index + 1).padStart(2, "0")}</div>
                    <div className="step-body">
                      <h3 className="step-title">{card.title}</h3>
                      <p className="step-sub">{renderDemoLinkText(card.body)}</p>
                      <div className="step-tech">
                        {card.tags.map((tag) => (
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

        <section className="panel-wrap panel-static protocol-section">
          <div className="panel-sticky">
            <div className="panel-inner protocol-copy-shell">
              <div className="r protocol-copy-head">
                <div className="slbl">{messages.architecture.badge}</div>
                <h2 className="sh">{messages.architecture.title}</h2>
              </div>
              <div className="r rd protocol-rich-text protocol-rich-text-wide">
                {architectureLead ? <p>{architectureLead}</p> : null}
                {architectureLead ? (
                  <div className="protocol-inline-logo protocol-inline-logo-polymarket">
                    <Image src="/assets/images/polymarket-logo.svg" alt="Polymarket" width={128} height={23} />
                  </div>
                ) : null}
                {architectureRest.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="r rd2 protocol-inline-quote">
                <ProtocolQuoteCard
                  quote={messages.architecture.quote.quote}
                  attribution={messages.architecture.quote.attribution}
                  media={{ kind: "kuest-mark" }}
                  centered
                  hideAttribution
                />
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section">
          <div className="panel-sticky">
            <div className="panel-inner protocol-section-center">
              <div className="r quote-stage-head">
                <div className="slbl justify-center">{messages.businessModel.badge}</div>
                <h2 className="sh">{messages.businessModel.title}</h2>
              </div>
              <div className="r rd steps-grid">
                {messages.businessModel.cards.map((card, index) => (
                  <article key={card.title} className="step-card">
                    <div className="step-num">{String(index + 1).padStart(2, "0")}</div>
                    <div className="step-body">
                      <h3 className="step-title">{card.title}</h3>
                      <p className="step-sub">{card.body}</p>
                      <div className="step-tech">
                        {card.tags.map((tag) => (
                          <span key={tag} className="tech-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="r rd2 protocol-context-line">{messages.businessModel.context}</div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section">
          <div className="panel-sticky">
            <div className="panel-inner audience-stage protocol-audience-stage">
              <div className="r audience-stage-head">
                <div className="slbl">{messages.partners.badge}</div>
                <h2 className="sh">{messages.partners.title}</h2>
              </div>
              <div className="r rd audience-rows">
                {messages.partners.cards.map((card, index) => {
                  const Icon = partnerIcons[index];

                  return (
                    <article key={card.title} className="audience-row">
                      <div className="audience-row-icon">{Icon ? <Icon /> : null}</div>
                      <div className="audience-row-body">
                        <h3>{card.title}</h3>
                        <p>{card.body}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section">
          <div className="panel-sticky">
            <div className="panel-inner protocol-section-center">
              <div className="r quote-stage-head">
                <div className="slbl justify-center">{messages.strategicQuestion.badge}</div>
                <h2 className="sh">{messages.strategicQuestion.title}</h2>
              </div>
              <div className="r rd protocol-rich-text section-copy-center section-copy-center-wide">
                <p>{messages.strategicQuestion.intro}</p>
              </div>
              <div className="r rd2 path-grid">
                <article className="path-card investor">
                  <div className="path-tag i">
                    <Newspaper size={14} />
                    {messages.strategicQuestion.applicationLayer.tag}
                  </div>
                  <h3 className="path-h">{messages.strategicQuestion.applicationLayer.title}</h3>
                  <p className="path-p">{messages.strategicQuestion.applicationLayer.body}</p>
                  <div className="path-list">
                    {messages.strategicQuestion.applicationLayer.items.map((item) => (
                      <div key={item.label} className="pl">
                        <strong>{item.label}:</strong> {item.value}
                      </div>
                    ))}
                  </div>
                </article>
                <article className="path-card creator">
                  <div className="path-tag c">
                    <Globe2 size={14} />
                    {messages.strategicQuestion.protocolLayer.tag}
                  </div>
                  <h3 className="path-h">{messages.strategicQuestion.protocolLayer.title}</h3>
                  <p className="path-p">{messages.strategicQuestion.protocolLayer.body}</p>
                  <div className="path-list">
                    {messages.strategicQuestion.protocolLayer.items.map((item) => (
                      <div key={item.label} className="pl">
                        <strong>{item.label}:</strong> {item.value}
                      </div>
                    ))}
                  </div>
                </article>
              </div>
              <div className="r rd3 protocol-rich-text section-copy-center section-copy-center-wide">
                <p>{messages.strategicQuestion.outro}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-wrap panel-static protocol-section">
          <div className="panel-sticky">
            <div className="panel-inner protocol-section-center">
              <div className="r quote-stage-head protocol-heading-wide">
                <div className="slbl justify-center">{messages.status.badge}</div>
                <h2 className="sh">{messages.status.title}</h2>
              </div>
              <div className="r rd audience-rows protocol-status-rows">
                {messages.status.items.map((item) => (
                  <article key={item.label} className="audience-row">
                    <div
                      className={`audience-row-icon ${item.complete ? "is-complete" : "is-pending"}`}
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
            <div className="cta-content r py-12 protocol-final-cta">
              <h2 className="cta-h">{messages.finalCta.title}</h2>
              <p className="cta-sub">{messages.finalCta.subtitle}</p>
              <div className="protocol-final-primary">
                <button type="button" className="btn-cta btn-cta-primary" data-protocol-deck-open>
                  <span className="cta-label">{messages.finalCta.requestDeckCta}</span>
                  <ArrowRight />
                </button>
              </div>
              <div className="cta-btns protocol-final-actions">
                <a href={CONTACT_HREF} className="btn-cta btn-cta-secondary">
                  <span className="cta-label">{messages.finalCta.contactCta}</span>
                  <ArrowRight />
                </a>
                <a
                  href={DEMO_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta btn-cta-secondary"
                >
                  <span className="cta-label">{messages.finalCta.viewDemoCta}</span>
                  <ArrowRight />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="foot-brand">
          <div className="nav-logo gap-2 font-sans text-[15px] font-bold text-muted">
            <KuestMark />
            Kuest
          </div>
          <div className="foot-note">{messages.footer.note}</div>
        </div>
        <div className="foot-links">
          <a
            id="footerDocsLink"
            className="foot-link-icon"
            href="https://kuest.com/docs/owners"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={messages.footer.docsLabel}
            title={messages.footer.docsLabel}
          >
            <Image src="/assets/images/docs.svg" alt="" width={21} height={21} />
          </a>
          <a
            id="footerMailLink"
            className="foot-link-icon"
            href="mailto:hello@kuest.com"
            aria-label={messages.footer.contactLabel}
            title={messages.footer.contactLabel}
          >
            <Image src="/assets/images/mail.svg" alt="" width={20} height={20} />
          </a>
          <a
            id="footerXLink"
            className="foot-link-icon"
            href="https://x.com/kuest"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={messages.footer.xLabel}
            title={messages.footer.xLabel}
          >
            <Image src="/assets/images/x.svg" alt="" width={20} height={20} />
          </a>
          <a
            id="footerDiscordLink"
            className="foot-link-icon"
            href="https://discord.gg/kuest"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={messages.footer.discordLabel}
            title={messages.footer.discordLabel}
          >
            <Image src="/assets/images/discord.svg" alt="" width={20} height={20} />
          </a>
        </div>
      </footer>

      <ProtocolPitchDeckModal messages={messages.deckModal} />

      <Script src="/assets/app.js" strategy="afterInteractive" />
    </>
  );
}
