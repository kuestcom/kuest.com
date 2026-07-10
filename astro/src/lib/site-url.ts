const HAS_PROTOCOL_PATTERN = /^[a-z][a-z0-9+.-]*:\/\//i
const LOCAL_HOST_PATTERN = /^(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(?::\d+)?(?:\/|$)/i

export function normalizeSiteUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  try {
    const withProtocol = HAS_PROTOCOL_PATTERN.test(trimmed)
      ? trimmed
      : `${LOCAL_HOST_PATTERN.test(trimmed) ? 'http' : 'https'}://${trimmed}`
    const url = new URL(withProtocol)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return trimmed.replace(/\/+$/, '')
    }

    const normalizedPath = url.pathname.replace(/\/+$/, '')
    return `${url.protocol}//${url.host}${normalizedPath}${url.search}${url.hash}`
  }
  catch {
    return trimmed.replace(/\/+$/, '')
  }
}

export function resolveSiteUrl(
  env: Record<string, string | undefined> = process.env,
) {
  const explicitSiteUrl = typeof env.SITE_URL === 'string' && env.SITE_URL.trim()
    ? env.SITE_URL
    : null
  const vercelProductionUrl
    = typeof env.VERCEL_PROJECT_PRODUCTION_URL === 'string' && env.VERCEL_PROJECT_PRODUCTION_URL.trim()
      ? env.VERCEL_PROJECT_PRODUCTION_URL
      : null
  const publicVercelProductionUrl
    = typeof env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL === 'string'
      && env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL.trim()
      ? env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      : null

  if (explicitSiteUrl) {
    return normalizeSiteUrl(explicitSiteUrl)
  }

  if (vercelProductionUrl) {
    return normalizeSiteUrl(vercelProductionUrl)
  }

  if (publicVercelProductionUrl) {
    return normalizeSiteUrl(publicVercelProductionUrl)
  }

  return 'http://localhost:3000'
}
