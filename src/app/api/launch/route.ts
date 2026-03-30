import type { LaunchResponseBody } from '@/lib/launch-types'
import { NextResponse } from 'next/server'
import {
  createLogger,
  ensureValidRepo,
  LaunchError,
  masked,
  parseLaunchRequest,
  sanitizeProjectName,
} from '@/lib/launch-utils'
import { getValidVercelSession } from '@/lib/oauth-session'
import {
  buildRateLimitHeaders,
  checkRateLimit,
  getRateLimitConfig,
} from '@/lib/rate-limit'
import { normalizeSiteUrl } from '@/lib/site-url'
import {
  connectSupabaseViaVercelIntegration,
  createProjectDeployment,
  isMissingVercelGitImportError,
  preflightVercelSupabaseLaunch,
  provisionVercelProject,
  resolveProjectProductionUrl,
} from '@/lib/vercel-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function buildErrorResponse(
  error: unknown,
  status: number,
  body: Omit<LaunchResponseBody, 'ok'>,
) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return NextResponse.json<LaunchResponseBody>(
    {
      ok: false,
      ...body,
      error: message,
    },
    { status },
  )
}

function buildDashboardUrl(projectName: string, vercelTeamId?: string) {
  if (vercelTeamId) {
    return `https://vercel.com/${vercelTeamId}/${projectName}`
  }
  return 'https://vercel.com/dashboard'
}

function withNormalizedSiteUrl(env: Record<string, string>): Record<string, string> {
  if (!env.SITE_URL) {
    return env
  }

  return {
    ...env,
    SITE_URL: normalizeSiteUrl(env.SITE_URL),
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now()
  const logs: LaunchResponseBody['logs'] = []
  const log = createLogger(logs)

  const rateLimit = checkRateLimit(
    request,
    getRateLimitConfig({
      route: 'api:launch',
      envMaxKey: 'RATE_LIMIT_LAUNCH_MAX',
      defaultMax: 30,
      envWindowKey: 'RATE_LIMIT_WINDOW_MS',
    }),
  )
  if (!rateLimit.allowed) {
    const durationMs = Date.now() - startedAt
    log(
      'rate_limit',
      `Too many launch attempts from this IP. Retry in about ${rateLimit.retryAfterSec}s.`,
      'warning',
    )
    return NextResponse.json<LaunchResponseBody>(
      {
        ok: false,
        logs,
        durationMs,
        error: 'Too many launch attempts. Please retry shortly.',
      },
      {
        status: 429,
        headers: buildRateLimitHeaders(rateLimit),
      },
    )
  }

  try {
    const rawBody = (await request.json()) as unknown
    const payload = parseLaunchRequest(rawBody)

    const projectName = sanitizeProjectName(payload.projectName || payload.brandName)
    const gitRepo = ensureValidRepo(payload.gitRepo)
    const gitBranch = payload.gitBranch.trim()
    const vercelTeamId = payload.vercelTeamId?.trim() || process.env.VERCEL_TEAM_ID?.trim() || undefined

    const vercelSession = await getValidVercelSession()

    const vercelToken = payload.tokens?.vercel || vercelSession?.accessToken || ''

    log(
      'validation',
      `Input accepted. Repo: ${gitRepo}#${gitBranch}. Database mode: ${payload.databaseMode}.`,
    )
    log(
      'validation',
      `Vercel token: ${masked(vercelToken)}.`,
    )

    if (!vercelToken) {
      throw new LaunchError(
        'Missing Vercel authentication. Connect Vercel OAuth or paste a Vercel Access Token.',
        'validation',
      )
    }

    if (payload.databaseMode !== 'vercel_supabase_integration') {
      throw new LaunchError(
        'Only vercel_supabase_integration is enabled in this launchpad instance.',
        'validation',
      )
    }

    let supabaseDashboardUrl: string | undefined

    const preflight = await preflightVercelSupabaseLaunch({
      token: vercelToken,
      teamId: vercelTeamId,
      projectName,
      log,
    })
    const launchTeamId = preflight.resolvedTeamId ?? vercelTeamId
    const env = withNormalizedSiteUrl({ ...payload.env })

    const vercelEnvironmentVariables = Object.entries(env)
      .filter(([, value]) => value !== '')
      .map(([key, value]) => ({
        key,
        value,
        target: ['production', 'preview', 'development'] as const,
      }))

    const shouldAutoDeploy = payload.databaseMode !== 'vercel_supabase_integration'
    const vercel = await provisionVercelProject({
      token: vercelToken,
      teamId: launchTeamId,
      projectName,
      gitRepo,
      gitBranch,
      environmentVariables: vercelEnvironmentVariables,
      triggerDeployment: shouldAutoDeploy,
      log,
    })

    if (payload.databaseMode === 'vercel_supabase_integration') {
      const integrated = await connectSupabaseViaVercelIntegration({
        token: vercelToken,
        teamId: launchTeamId,
        projectId: vercel.projectId,
        projectName,
        existingResourceId: payload.supabase?.existingResourceId,
        supabaseRegion: payload.supabase?.region,
        log,
      })
      supabaseDashboardUrl = integrated.dashboardUrl ?? supabaseDashboardUrl

      const deployment = await createProjectDeployment({
        token: vercelToken,
        teamId: launchTeamId,
        projectId: vercel.projectId,
        projectName: vercel.projectName,
        gitRepo,
        gitBranch,
      })
      log('vercel', 'Deployment triggered after Supabase integration connection.')

      const projectUrl
        = normalizeSiteUrl(
          (await resolveProjectProductionUrl({
            token: vercelToken,
            teamId: launchTeamId,
            projectIdOrName: vercel.projectId,
          }))
          || deployment.url
          || vercel.projectUrl
          || '',
        )

      const durationMs = Date.now() - startedAt
      return NextResponse.json<LaunchResponseBody>({
        ok: true,
        databaseMode: payload.databaseMode,
        projectId: vercel.projectId,
        projectName: vercel.projectName,
        resolvedTeamId: launchTeamId,
        projectUrl,
        vercelDashboardUrl:
          vercel.dashboardUrl || buildDashboardUrl(projectName, launchTeamId),
        supabaseDashboardUrl,
        logs,
        durationMs,
      })
    }

    const durationMs = Date.now() - startedAt
    return NextResponse.json<LaunchResponseBody>({
      ok: true,
      databaseMode: payload.databaseMode,
      projectId: vercel.projectId,
      projectName: vercel.projectName,
      resolvedTeamId: launchTeamId,
      projectUrl: vercel.projectUrl,
      vercelDashboardUrl:
        vercel.dashboardUrl || buildDashboardUrl(projectName, launchTeamId),
      supabaseDashboardUrl,
      logs,
      durationMs,
    })
  }
  catch (error) {
    const durationMs = Date.now() - startedAt
    if (error instanceof LaunchError) {
      log(error.step, error.message, 'error')
      if (error.details) {
        log(error.step, JSON.stringify(error.details), 'warning')
      }
      const requiresVercelGitImport = isMissingVercelGitImportError(error)
      const responseError = requiresVercelGitImport
        ? 'Finish connecting Vercel to GitHub, then try again.'
        : error.message
      return NextResponse.json<LaunchResponseBody>(
        {
          ok: false,
          logs,
          durationMs,
          error: responseError,
          hints: {
            vercelGitImportRequired: requiresVercelGitImport,
          },
        },
        { status: 400 },
      )
    }

    log('unknown', 'Unexpected internal error.', 'error')
    return buildErrorResponse(error, 500, { logs, durationMs })
  }
}
