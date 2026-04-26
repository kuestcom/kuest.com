import type { MetadataRoute, Route } from 'next'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n/locales'
import { getPathname } from '@/i18n/navigation'
import { listPostSitemapEntries } from '@/lib/blog/content'
import { discoverStaticRoutes } from '@/lib/site-routes'
import { resolveSiteUrl } from '@/lib/site-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteOrigin = resolveSiteUrl(process.env)

  const staticEntries = discoverStaticRoutes().map(({ href, changeFrequency, priority, lastModified }) => {
    const typedHref = href as Route
    const localeUrls = Object.fromEntries(
      SUPPORTED_LOCALES.map(locale => [
        locale,
        new URL(getPathname({ locale, href: typedHref }), siteOrigin).toString(),
      ]),
    )
    return {
      url: localeUrls[DEFAULT_LOCALE],
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: { ...localeUrls, 'x-default': localeUrls[DEFAULT_LOCALE] },
      },
    }
  })

  const blogEntries = listPostSitemapEntries().map(({ contentSlug, locales, localizedSlugs, lastModified }) => {
    const localeUrls = Object.fromEntries(
      locales.map(locale => [
        locale,
        new URL(
          getPathname({ locale, href: `/blog/${localizedSlugs[locale] ?? contentSlug}` }),
          siteOrigin,
        ).toString(),
      ]),
    )
    const defaultUrl = localeUrls[DEFAULT_LOCALE] ?? Object.values(localeUrls)[0]
    return {
      url: defaultUrl,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        languages: { ...localeUrls, 'x-default': defaultUrl },
      },
    }
  })

  return [...staticEntries, ...blogEntries]
}
