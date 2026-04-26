import type { SupportedLocale } from '@/i18n/locales'
import { ChevronRightIcon } from 'lucide-react'
import { getExtracted } from 'next-intl/server'
import DockMenuControl from '@/components/DockMenuControl'
import KuestMark from '@/components/KuestMark'
import LanguageControl from '@/components/LanguageControl'
import ThemeToggle from '@/components/ThemeToggle'

export type MarketingActiveSection = 'home' | 'enterprise' | 'protocol' | 'blog'

interface MarketingDockNavProps {
  locale: SupportedLocale
  active: MarketingActiveSection
  /** Path used by the language switcher to route to the same page in another locale. */
  languagePath: string
  /** Optional locale-specific paths (used for localized slugs). */
  languagePathByLocale?: Partial<Record<SupportedLocale, string>>
  /** Locales for which the current page exists; others fall back to languageFallbackPath. */
  availableLocales?: SupportedLocale[]
  /** Path used when switching to a locale not in availableLocales. */
  languageFallbackPath?: string
  /** Optional demo deeplink rendered inside the dock menu (used on home / enterprise). */
  demoHref?: string
  demoLabel?: string
  /** The right-side CTA. */
  ctaHref: string
  ctaLabel: string
}

export default async function MarketingDockNav({
  locale,
  active,
  languagePath,
  languagePathByLocale,
  availableLocales,
  languageFallbackPath,
  demoHref,
  demoLabel,
  ctaHref,
  ctaLabel,
}: MarketingDockNavProps) {
  const t = await getExtracted()

  return (
    <nav id="dockNav" className="dock-nav" aria-label={t('Site navigation')}>
      <a href="#page-top" className="nav-logo">
        <KuestMark />
        Kuest
      </a>
      <div className="nav-r">
        <DockMenuControl
          homeHref="/"
          enterpriseHref="/enterprise"
          protocolHref="/protocol"
          blogHref="/blog"
          demoHref={demoHref}
          demoLabel={demoLabel}
          active={active}
          openLabel={t('Open site navigation')}
          menuAriaLabel={t('Site navigation')}
          homeLabel={t('Home')}
          enterpriseLabel={t('Enterprise')}
          protocolLabel={t('The Protocol')}
          blogLabel={t('Blog')}
        />
        <LanguageControl
          locale={locale}
          path={languagePath}
          pathByLocale={languagePathByLocale}
          availableLocales={availableLocales}
          fallbackPath={languageFallbackPath}
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
        <a href={ctaHref} className="nb nb-solid nav-cta">
          <span className="cta-label">{ctaLabel}</span>
          <ChevronRightIcon />
        </a>
      </div>
    </nav>
  )
}
