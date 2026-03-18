import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  Activity,
  BarChart2,
  Bitcoin,
  Bot,
  ChevronDown,
  Clapperboard,
  Globe2,
  Landmark,
  MonitorSmartphone,
  Moon,
  Server,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { localeHref, type SiteLocale } from "@/i18n/site-config";
import {
  HERO_MARKET_SCENES,
  LANGUAGE_OPTIONS,
  type ShowcaseIconName,
} from "@/lib/marketing-shared-data";

const showcaseIconMap: Record<ShowcaseIconName, ComponentType<{ className?: string }>> = {
  activity: Activity,
  "bar-chart-2": BarChart2,
  bitcoin: Bitcoin,
  bot: Bot,
  clapperboard: Clapperboard,
  "globe-2": Globe2,
  landmark: Landmark,
  "monitor-smartphone": MonitorSmartphone,
  moon: Moon,
  server: Server,
  "share-2": Share2,
  "shield-check": ShieldCheck,
  sliders: SlidersHorizontal,
  sun: Sun,
  trophy: Trophy,
  "trending-up": TrendingUp,
  users: Users,
  zap: Zap,
};

export function KuestMark() {
  return <span className="kuest-logo-mark" aria-hidden="true" />;
}

export function ThemeToggle({
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

export function LanguageControl({
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
          <Link
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
          </Link>
        ))}
      </div>
    </div>
  );
}

export function DockMenuControl({
  homeHref,
  enterpriseHref,
  protocolHref,
  active,
  openLabel,
  menuAriaLabel,
  homeLabel,
  enterpriseLabel,
  protocolLabel,
}: {
  homeHref: string;
  enterpriseHref: string;
  protocolHref: string;
  active: "home" | "enterprise" | "protocol";
  openLabel: string;
  menuAriaLabel: string;
  homeLabel: string;
  enterpriseLabel: string;
  protocolLabel: string;
}) {
  return (
    <div className="site-language-control site-nav-control" id="dockSiteNavControl">
      <button
        type="button"
        id="dockSiteNavButton"
        className="dock-theme-toggle site-language-trigger site-nav-trigger"
        aria-label={openLabel}
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <span className="site-nav-trigger-bars" aria-hidden="true">
          <span className="site-nav-trigger-line" />
          <span className="site-nav-trigger-line" />
          <span className="site-nav-trigger-line" />
        </span>
      </button>
      <div id="dockSiteNavMenu" className="site-language-menu site-nav-menu" role="menu" aria-label={menuAriaLabel}>
        {active === "home" ? (
          <span className="site-language-option site-nav-option is-disabled" role="menuitem" aria-disabled="true">
            {homeLabel}
          </span>
        ) : (
          <Link href={homeHref} className="site-language-option site-nav-option" role="menuitem">
            {homeLabel}
          </Link>
        )}
        {active === "enterprise" ? (
          <span className="site-language-option site-nav-option is-disabled" role="menuitem" aria-disabled="true">
            {enterpriseLabel}
          </span>
        ) : (
          <Link href={enterpriseHref} className="site-language-option site-nav-option" role="menuitem">
            {enterpriseLabel}
          </Link>
        )}
        {active === "protocol" ? (
          <span className="site-language-option site-nav-option is-disabled" role="menuitem" aria-disabled="true">
            {protocolLabel}
          </span>
        ) : (
          <Link href={protocolHref} className="site-language-option site-nav-option" role="menuitem">
            {protocolLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export function HeroMarketStage({
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
                    <Image
                      src={card.imageSrc}
                      alt=""
                      width={320}
                      height={320}
                      className="h-full w-full object-cover"
                    />
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

export function ShowcaseIcon({ name }: { name: ShowcaseIconName }) {
  const Icon = showcaseIconMap[name] ?? Zap;

  return <Icon />;
}

export function SiteFooter({
  note,
  docsLabel,
  contactLabel,
  xLabel,
  discordLabel,
}: {
  note: string;
  docsLabel: string;
  contactLabel: string;
  xLabel: string;
  discordLabel: string;
}) {
  return (
    <footer>
      <div className="foot-brand">
        <div className="nav-logo gap-2 font-sans text-[15px] font-bold text-muted">
          <KuestMark />
          Kuest
        </div>
        <div className="foot-note">{note}</div>
      </div>
      <div className="foot-links">
        <a
          id="footerDocsLink"
          className="foot-link-icon"
          href="https://kuest.com/docs/owners"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={docsLabel}
          title={docsLabel}
        >
          <Image src="/assets/images/docs.svg" alt="" width={21} height={21} />
        </a>
        <a
          id="footerMailLink"
          className="foot-link-icon"
          href="mailto:hello@kuest.com"
          aria-label={contactLabel}
          title={contactLabel}
        >
          <Image src="/assets/images/mail.svg" alt="" width={20} height={20} />
        </a>
        <a
          id="footerXLink"
          className="foot-link-icon"
          href="https://x.com/kuest"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={xLabel}
          title={xLabel}
        >
          <Image src="/assets/images/x.svg" alt="" width={20} height={20} />
        </a>
        <a
          id="footerDiscordLink"
          className="foot-link-icon"
          href="https://discord.gg/kuest"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={discordLabel}
          title={discordLabel}
        >
          <Image src="/assets/images/discord.svg" alt="" width={20} height={20} />
        </a>
      </div>
    </footer>
  );
}
