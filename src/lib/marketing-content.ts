import type { SupportedLocale } from '@/i18n/locales'
import { DEFAULT_LOCALE } from '@/i18n/locales'

export const DEMO_ORIGIN = 'https://demo.kuest.com'

const LANDING_HERO_TITLE_ACCENT_BY_LOCALE: Record<SupportedLocale, string> = {
  en: 'Free',
  de: 'Kostenlos',
  es: 'Gratis',
  pt: 'Grátis',
  fr: 'Gratuit',
  zh: '免费开始',
}

export function buildEmbedPreviewBootstrapScript() {
  return 'if(new URLSearchParams(window.location.search).has(\'embed-preview\')){document.documentElement.classList.add(\'embed-preview\');}'
}

export function serializeJsonForHtmlScript(value: unknown) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003C')
    .replaceAll('>', '\\u003E')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')
}

export function getDemoLocalePath(locale: SupportedLocale) {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`
}

export function getDemoHref(locale: SupportedLocale) {
  return `${DEMO_ORIGIN}${getDemoLocalePath(locale)}`
}

export function getDemoEmbedSrc(locale: SupportedLocale) {
  const path = getDemoLocalePath(locale)
  return `${DEMO_ORIGIN}${path ? `${path}/` : '/'}?embed-preview=1`
}

export function getDemoLabel(locale: SupportedLocale) {
  return `demo.kuest.com${getDemoLocalePath(locale)}`
}

export function getLandingHeroAccent(locale: SupportedLocale) {
  return LANDING_HERO_TITLE_ACCENT_BY_LOCALE[locale]
}
