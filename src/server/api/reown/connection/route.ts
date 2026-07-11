import { RATE_LIMIT_REOWN_CONNECTION_MAX, RATE_LIMIT_WINDOW_MS } from 'astro:env/server'
import { LaunchError } from '@/lib/launch-utils'
import {
  buildRateLimitHeaders,
  checkRateLimit,
  getRateLimitConfig,
} from '@/lib/rate-limit'
import { inspectReownProjectId } from '@/lib/reown-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RequestBody {
  projectId?: string
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(
    request,
    getRateLimitConfig({
      route: 'api:reown-connection',
      max: RATE_LIMIT_REOWN_CONNECTION_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    }),
  )

  if (!rateLimit.allowed) {
    return Response.json(
      {
        valid: false,
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
    const projectId = typeof body.projectId === 'string' ? body.projectId.trim() : ''

    if (!projectId) {
      return Response.json(
        {
          valid: false,
          error: 'Missing Reown Project ID.',
        },
        { status: 400 },
      )
    }

    const result = await inspectReownProjectId(projectId)
    return Response.json(result)
  }
  catch (error) {
    if (error instanceof LaunchError) {
      return Response.json(
        {
          valid: false,
          error: error.message,
        },
        { status: 400 },
      )
    }

    return Response.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : 'Unexpected error.',
      },
      { status: 500 },
    )
  }
}
