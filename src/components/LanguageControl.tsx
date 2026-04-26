import type { SupportedLocale } from '@/i18n/locales'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { LANGUAGE_OPTIONS } from '@/i18n/locales'
import { getPathname } from '@/i18n/navigation'

export default function LanguageControl({
  locale,
  path,
  pathByLocale,
  availableLocales,
  fallbackPath,
  controlId,
  buttonId,
  menuId,
  flagId,
  labelId,
  ariaLabel,
}: {
  locale: SupportedLocale
  path: string
  pathByLocale?: Partial<Record<SupportedLocale, string>>
  availableLocales?: SupportedLocale[]
  fallbackPath?: string
  controlId: string
  buttonId: string
  menuId: string
  flagId: string
  labelId: string
  ariaLabel: string
}) {
  const currentLanguage = LANGUAGE_OPTIONS.find(option => option.code === locale) ?? LANGUAGE_OPTIONS[0]
  const limitToAvailable = Array.isArray(availableLocales) && availableLocales.length > 0

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
        {LANGUAGE_OPTIONS.map((option) => {
          const isAvailable = !limitToAvailable || availableLocales!.includes(option.code)
          const localizedPath = pathByLocale?.[option.code]
          const targetPath = isAvailable
            ? (localizedPath ?? path)
            : (fallbackPath ?? path)
          return (
            <a
              key={option.code}
              href={getPathname({ href: targetPath, locale: option.code })}
              className={`site-language-option ${option.code === locale ? 'is-selected' : ''} ${isAvailable
                ? ''
                : `is-unavailable`}`}
              role="option"
              aria-selected={option.code === locale}
              data-available={isAvailable ? 'true' : 'false'}
            >
              <span className="site-language-option-row">
                <Image
                  className="site-language-flag"
                  src={option.flagSrc}
                  alt={option.label}
                  width={18}
                  height={12}
                />
                <span>{option.label}</span>
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
