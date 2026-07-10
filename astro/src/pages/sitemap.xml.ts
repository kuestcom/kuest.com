import type { APIRoute } from 'astro'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n/locales'
import { getPathname } from '@/i18n/navigation'
import { listPostSitemapEntries } from '@/lib/blog/content'

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', frequency: 'monthly' },
  { path: '/blog', priority: '0.9', frequency: 'weekly' },
  { path: '/enterprise', priority: '0.8', frequency: 'monthly' },
  { path: '/protocol', priority: '0.8', frequency: 'monthly' },
  { path: '/launch', priority: '0.7', frequency: 'monthly' },
] as const

function xml(value: string) {
  return value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!)
}

function entry(origin: URL, pathByLocale: Partial<Record<string, string>>, lastModified: Date | undefined, frequency: string, priority: string) {
  const defaultPath = pathByLocale[DEFAULT_LOCALE] ?? Object.values(pathByLocale)[0]!
  const links = Object.entries(pathByLocale).map(([locale, path]) =>
    `<xhtml:link rel="alternate" hreflang="${locale}" href="${xml(new URL(path!, origin).toString())}"/>`,
  ).join('')
  return `<url><loc>${xml(new URL(defaultPath, origin).toString())}</loc>${links}<xhtml:link rel="alternate" hreflang="x-default" href="${xml(new URL(defaultPath, origin).toString())}"/>${lastModified ? `<lastmod>${lastModified.toISOString()}</lastmod>` : ''}<changefreq>${frequency}</changefreq><priority>${priority}</priority></url>`
}

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://kuest.com')
  const staticEntries = STATIC_ROUTES.map(route => entry(
    origin,
    Object.fromEntries(SUPPORTED_LOCALES.map(locale => [locale, getPathname({ href: route.path, locale })])),
    undefined,
    route.frequency,
    route.priority,
  ))
  const blogEntries = listPostSitemapEntries().map(post => entry(
    origin,
    Object.fromEntries(post.locales.map(locale => [locale, getPathname({ href: `/blog/${post.localizedSlugs[locale] ?? post.contentSlug}`, locale })])),
    post.lastModified,
    'monthly',
    '0.6',
  ))
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${[...staticEntries, ...blogEntries].join('')}</urlset>`, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  })
}
