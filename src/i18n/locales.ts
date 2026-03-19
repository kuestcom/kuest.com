export const SUPPORTED_LOCALES = ['en', 'de', 'es', 'pt', 'fr', 'zh'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'en'

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', flagSrc: '/assets/flags/en.svg' },
  { code: 'de', label: 'Deutsch', flagSrc: '/assets/flags/de.svg' },
  { code: 'es', label: 'Español', flagSrc: '/assets/flags/es.svg' },
  { code: 'pt', label: 'Português', flagSrc: '/assets/flags/pt.svg' },
  { code: 'fr', label: 'Français', flagSrc: '/assets/flags/fr.svg' },
  { code: 'zh', label: '中文', flagSrc: '/assets/flags/zh.svg' },
] as const satisfies ReadonlyArray<{ code: SupportedLocale, label: string, flagSrc: string }>
