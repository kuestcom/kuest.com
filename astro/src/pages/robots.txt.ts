import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://kuest.com')
  return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${new URL('/sitemap.xml', origin)}\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
