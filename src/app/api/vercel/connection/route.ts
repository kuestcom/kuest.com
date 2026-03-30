import type { VercelConnectionStatusResponse } from '@/lib/launch-types'
import { NextResponse } from 'next/server'
import { LaunchError } from '@/lib/launch-utils'
import { getValidVercelSession } from '@/lib/oauth-session'
import {
  buildRateLimitHeaders,
  checkRateLimit,
  getRateLimitConfig,
} from '@/lib/rate-limit'
import { inspectVercelConnection } from '@/lib/vercel-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RequestBody {
  token?: string
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(
    request,
    getRateLimitConfig({
      route: 'api:vercel-connection',
      envMaxKey: 'RATE_LIMIT_VERCEL_CONNECTION_MAX',
      defaultMax: 240,
      envWindowKey: 'RATE_LIMIT_WINDOW_MS',
    }),
  )
  if (!rateLimit.allowed) {
    return NextResponse.json<VercelConnectionStatusResponse>(
      {
        connected: false,
        error: 'Too many checks. Please retry shortly.',
      },
      {
        status: 429,
        headers: buildRateLimitHeaders(rateLimit),
      },
    )
  }

  try {
    const body = (await request.json()) as RequestBody
    const rawToken = typeof body.token === 'string' ? body.token.trim() : ''
    const session = rawToken ? null : await getValidVercelSession()
    const token = rawToken || session?.accessToken || ''

    if (!token) {
      return NextResponse.json<VercelConnectionStatusResponse>(
        {
          connected: false,
          error: 'Missing Vercel authentication.',
        },
        { status: 400 },
      )
    }

    const connection = await inspectVercelConnection({ token })

    return NextResponse.json<VercelConnectionStatusResponse>({
      connected: true,
      identity: connection.identity,
      githubImportReady: connection.githubImportReady,
      githubImportNamespace: connection.githubImportNamespace,
      githubImportProvider: connection.githubImportProvider,
    })
  }
  catch (error) {
    if (error instanceof LaunchError) {
      return NextResponse.json<VercelConnectionStatusResponse>(
        {
          connected: false,
          error: 'We could not verify this Vercel connection. Check it and try again.',
        },
        { status: 400 },
      )
    }

    return NextResponse.json<VercelConnectionStatusResponse>(
      {
        connected: false,
        error: error instanceof Error ? error.message : 'Unexpected error.',
      },
      { status: 500 },
    )
  }
}
