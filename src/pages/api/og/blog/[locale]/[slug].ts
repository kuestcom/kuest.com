import type { APIRoute } from 'astro'
import { getPost, listPostStaticParams } from '@/lib/blog/content'

export function getStaticPaths() {
  return listPostStaticParams().map(({ locale, slug }) => ({
    params: { locale, slug },
    props: { title: getPost(slug, locale)?.frontmatter.title ?? slug },
  }))
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!)
}

export const GET: APIRoute = ({ props }) => {
  const title = escapeXml(String(props.title))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0e1117"/><circle cx="1030" cy="90" r="220" fill="#cdff00" opacity=".12"/><text x="80" y="120" fill="#cdff00" font-family="Arial,sans-serif" font-size="34" font-weight="700">KUEST</text><foreignObject x="80" y="180" width="1040" height="330"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#e8eaf0;font:700 58px/1.12 Arial,sans-serif">${title}</div></foreignObject><text x="80" y="570" fill="#6b7585" font-family="Arial,sans-serif" font-size="26">kuest.com/blog</text></svg>`
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=86400' } })
}
