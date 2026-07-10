interface RateLimitConfig {
  route: string
  max: number
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  retryAfterSec: number
}

const buckets = new Map<string, number[]>()
const MAX_BUCKETS = 10_000

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) {
      return first
    }
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) {
    return realIp
  }

  return 'unknown'
}

function pruneTimestamps(values: number[], now: number, windowMs: number) {
  const threshold = now - windowMs
  let start = 0
  while (start < values.length && values[start] <= threshold) {
    start += 1
  }
  return start > 0 ? values.slice(start) : values
}

function cleanupBuckets(now: number, windowMs: number) {
  if (buckets.size <= MAX_BUCKETS) {
    return
  }

  const threshold = now - windowMs
  for (const [key, timestamps] of buckets.entries()) {
    // @ts-expect-error ignore
    if (!timestamps.length || timestamps.at(-1) <= threshold) {
      buckets.delete(key)
    }
  }
}

export function checkRateLimit(request: Request, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const ip = getClientIp(request)
  const key = `${config.route}:${ip}`
  const existing = buckets.get(key) ?? []
  const values = pruneTimestamps(existing, now, config.windowMs)

  if (values.length >= config.max) {
    const retryAfterMs = Math.max(1_000, config.windowMs - (now - values[0]))
    const retryAfterSec = Math.ceil(retryAfterMs / 1_000)
    buckets.set(key, values)
    cleanupBuckets(now, config.windowMs)
    return {
      allowed: false,
      limit: config.max,
      remaining: 0,
      retryAfterSec,
    }
  }

  values.push(now)
  buckets.set(key, values)
  cleanupBuckets(now, config.windowMs)
  return {
    allowed: true,
    limit: config.max,
    remaining: Math.max(0, config.max - values.length),
    retryAfterSec: 0,
  }
}

export function buildRateLimitHeaders(result: RateLimitResult) {
  const headers = new Headers({
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
  })
  if (!result.allowed && result.retryAfterSec > 0) {
    headers.set('Retry-After', String(result.retryAfterSec))
  }
  return headers
}

export function getRateLimitConfig(params: {
  route: string
  envMaxKey: string
  defaultMax: number
  envWindowKey?: string
  defaultWindowMs?: number
}) {
  const defaultWindowMs = params.defaultWindowMs ?? 10 * 60 * 1000
  const rawMax = process.env[params.envMaxKey]
  const rawWindow = params.envWindowKey ? process.env[params.envWindowKey] : undefined

  const max = Number(rawMax)
  const windowMs = Number(rawWindow)

  return {
    route: params.route,
    max: Number.isFinite(max) && max > 0 ? Math.floor(max) : params.defaultMax,
    windowMs:
      Number.isFinite(windowMs) && windowMs > 0
        ? Math.floor(windowMs)
        : defaultWindowMs,
  } satisfies RateLimitConfig
}
