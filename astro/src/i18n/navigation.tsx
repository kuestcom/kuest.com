import type { AnchorHTMLAttributes, ReactNode } from 'react'
import type { SupportedLocale } from './locales'
import { useI18n } from './index'

export function getPathname({
  href,
  locale,
}: {
  href: string
  locale: SupportedLocale
}) {
  if (/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(href)) {
    return href
  }

  const path = href.startsWith('/') ? href : `/${href}`
  if (locale === 'en') {
    return path
  }
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

export function Link({
  href,
  locale,
  children,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  locale?: SupportedLocale
  children?: ReactNode
}) {
  const context = useI18n()
  return (
    <a href={getPathname({ href, locale: locale ?? context.locale })} {...props}>
      {children}
    </a>
  )
}

export function usePathname() {
  return typeof window === 'undefined' ? '/' : window.location.pathname
}
