import { NextResponse } from 'next/server'
import { LaunchError } from '@/lib/launch-utils'
import { getValidVercelSession } from '@/lib/oauth-session'
import {
  buildRateLimitHeaders,
  checkRateLimit,
  getRateLimitConfig,
} from '@/lib/rate-limit'
import { addProjectDomain, verifyProjectDomain } from '@/lib/vercel-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RequestBody {
  token?: string
  teamId?: string
  projectId?: string
  projectName?: string
  domain?: string
  action?: 'add' | 'verify'
}

function normalizeDomain(input: string) {
  return input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '')
}

function isLikelyDomain(input: string) {
  return /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(input)
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(
    request,
    getRateLimitConfig({
      route: 'api:vercel-domain',
      envMaxKey: 'RATE_LIMIT_DOMAIN_MAX',
      defaultMax: 90,
      envWindowKey: 'RATE_LIMIT_WINDOW_MS',
    }),
  )
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many domain actions. Please retry shortly.',
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
      return NextResponse.json(
        {
          error: 'Missing Vercel authentication. Connect OAuth or paste an Access Token.',
        },
        { status: 400 },
      )
    }

    const domain = normalizeDomain(typeof body.domain === 'string' ? body.domain : '')
    if (!domain || !isLikelyDomain(domain)) {
      return NextResponse.json(
        {
          error: 'Enter a valid domain (example: app.yourdomain.com).',
        },
        { status: 400 },
      )
    }

    const teamId
      = typeof body.teamId === 'string' && body.teamId.trim() ? body.teamId.trim() : undefined
    const projectRef
      = (typeof body.projectId === 'string' && body.projectId.trim())
        || (typeof body.projectName === 'string' && body.projectName.trim())
        || ''
    if (!projectRef) {
      return NextResponse.json(
        {
          error: 'Missing project reference.',
        },
        { status: 400 },
      )
    }

    const action = body.action === 'verify' ? 'verify' : 'add'
    const response
      = action === 'verify'
        ? await verifyProjectDomain({
            token,
            teamId,
            projectIdOrName: projectRef,
            domain,
          })
        : await addProjectDomain({
            token,
            teamId,
            projectIdOrName: projectRef,
            domain,
          })

    return NextResponse.json({
      domain: response,
    })
  }
  catch (error) {
    if (error instanceof LaunchError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected error.',
      },
      { status: 500 },
    )
  }
}
