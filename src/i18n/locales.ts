export const SUPPORTED_LOCALES = ['en', 'de', 'es', 'pt', 'fr', 'ja', 'zh', 'ar'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'en'

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', flagSrc: '/assets/flags/en.svg' },
  { code: 'de', label: 'Deutsch', flagSrc: '/assets/flags/de.svg' },
  { code: 'es', label: 'Español', flagSrc: '/assets/flags/es.svg' },
  { code: 'pt', label: 'Português', flagSrc: '/assets/flags/pt.svg' },
  { code: 'fr', label: 'Français', flagSrc: '/assets/flags/fr.svg' },
  { code: 'ja', label: '日本語', flagSrc: '/assets/flags/ja.svg' },
  { code: 'zh', label: '中文', flagSrc: '/assets/flags/zh.svg' },
  { code: 'ar', label: 'العربية', flagSrc: '/assets/flags/ar.svg' },
] as const satisfies ReadonlyArray<{ code: SupportedLocale, label: string, flagSrc: string }>
