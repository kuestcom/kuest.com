import { NextResponse } from 'next/server'
import { LaunchError } from '@/lib/launch-utils'
import { getValidVercelSession } from '@/lib/oauth-session'
import {
  buildRateLimitHeaders,
  checkRateLimit,
  getRateLimitConfig,
} from '@/lib/rate-limit'
import { listSupabaseIntegrationResources } from '@/lib/vercel-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RequestBody {
  token?: string
  teamId?: string
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(
    request,
    getRateLimitConfig({
      route: 'api:supabase-resources',
      envMaxKey: 'RATE_LIMIT_SUPABASE_RESOURCES_MAX',
      defaultMax: 240,
      envWindowKey: 'RATE_LIMIT_WINDOW_MS',
    }),
  )
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        resources: [],
        error: 'Too many refresh attempts. Please retry shortly.',
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
    const teamId
      = typeof body.teamId === 'string' && body.teamId.trim() ? body.teamId.trim() : undefined
    const session = rawToken ? null : await getValidVercelSession()
    const token = rawToken || session?.accessToken || ''

    if (!token) {
      return NextResponse.json(
        {
          resources: [],
          error: 'Missing Vercel authentication. Connect OAuth or paste an Access Token.',
        },
        { status: 400 },
      )
    }

    const listed = await listSupabaseIntegrationResources({
      token,
      teamId,
    })

    return NextResponse.json({
      resources: listed.resources,
      resolvedTeamId: listed.resolvedTeamId,
    })
  }
  catch (error) {
    if (error instanceof LaunchError) {
      return NextResponse.json(
        {
          resources: [],
          error: error.message,
          details: error.details,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        resources: [],
        error: error instanceof Error ? error.message : 'Unexpected error.',
      },
      { status: 500 },
    )
  }
}
