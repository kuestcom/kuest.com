import { NextResponse } from 'next/server'
import {
  buildRateLimitHeaders,
  checkRateLimit,
  getRateLimitConfig,
} from '@/lib/rate-limit'
import { registerDomainSnapshot } from '@/lib/domain-register'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RequestBody {
  url?: unknown
  siteUrl?: unknown
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(
    request,
    getRateLimitConfig({
      route: 'domain-register',
      envMaxKey: 'RATE_LIMIT_DOMAIN_REGISTER_MAX',
      defaultMax: 600,
      envWindowKey: 'RATE_LIMIT_WINDOW_MS',
    }),
  )
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many registration attempts.' },
      {
        status: 429,
        headers: buildRateLimitHeaders(rateLimit),
      },
    )
  }

  try {
    const body = (await request.json()) as RequestBody
    const url = stringValue(body.url) || stringValue(body.siteUrl)
    if (!url) {
      return NextResponse.json(
        { ok: false, error: 'url is required.' },
        { status: 400 },
      )
    }

    const result = await registerDomainSnapshot({ url })

    return NextResponse.json({
      ok: true,
      ignored: result.ignored,
    })
  }
  catch (error) {
    console.error('[domain-register] Failed to register domain.', error)
    return NextResponse.json(
      { ok: false, error: 'Unable to register domain.' },
      { status: 500 },
    )
  }
}
