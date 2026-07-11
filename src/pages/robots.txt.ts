import type { APIRoute } from 'astro'
import { getPublicRuntimeConfig } from '@/lib/server-env'

export const GET: APIRoute = () => {
  const origin = new URL(getPublicRuntimeConfig().SITE_URL)
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${new URL('/sitemap.xml', origin)}\n`,
    {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    },
  )
}
