import type { LaunchResponseBody } from '@/lib/launch-types'
import { env as cloudflareEnv } from 'cloudflare:workers'
import { registerDomainSnapshot } from '@/lib/domain-register'
import {
  createLogger,
  ensureValidRepo,
  LaunchError,
  masked,
  parseLaunchRequest,
  sanitizeProjectName,
} from '@/lib/launch-utils'
import { getValidVercelSession } from '@/lib/oauth-session'
import { buildRateLimitHeaders, checkRateLimit, getRateLimitConfig } from '@/lib/rate-limit'
import { normalizeSiteUrl } from '@/lib/site-url'
import { getServerRuntimeConfig } from '@/lib/server-env'
import {
  connectSupabaseViaVercelIntegration,
  createProjectDeployment,
  isMissingVercelGitImportError,
  preflightVercelSupabaseLaunch,
  provisionVercelProject,
  resolveProjectProductionUrl,
} from '@/lib/vercel-api'
import { getAffiliateConfig, type AffiliateWorkerEnv } from '@/server/affiliate/constants'
import { readDubClickId } from '@/server/affiliate/cookie'
import { createDubTracker } from '@/server/affiliate/dub'
import { deliverPendingLead } from '@/server/affiliate/lead'
import {
  completeOperatorAttribution,
  failWalletAuthorization,
  markOperatorLaunchFailed,
  persistOperatorAttribution,
  reserveWalletAuthorization,
} from '@/server/affiliate/repository'
import { deriveCanonicalDepositWallet } from '@/server/affiliate/source'
import { verifyWalletControlProof } from '@/server/affiliate/wallet-proof'

function buildErrorResponse(error: unknown, status: number, body: Omit<LaunchResponseBody, 'ok'>) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return Response.json(
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

async function registerLaunchDomainSnapshot(params: { url: string; apiKey?: string }) {
  try {
    await registerDomainSnapshot({
      url: params.url,
      apiKey: params.apiKey,
    })
  } catch (error) {
    console.warn(
      '[domain-register] Failed to register launch domain.',
      error instanceof Error ? error.message : error,
    )
  }
}

export async function POST(request: Request) {
  const { RATE_LIMIT_LAUNCH_MAX, RATE_LIMIT_WINDOW_MS, VERCEL_TEAM_ID } = getServerRuntimeConfig()
  const startedAt = Date.now()
  const logs: LaunchResponseBody['logs'] = []
  const log = createLogger(logs)
  const affiliateEnv = cloudflareEnv as AffiliateWorkerEnv
  const affiliateConfig = getAffiliateConfig(affiliateEnv)
  let reservedProofHash: string | null = null
  let verifiedOperatorWallet: string | null = null
  let attributionPersisted = false

  const rateLimit = checkRateLimit(
    request,
    getRateLimitConfig({
      route: 'api:launch',
      max: RATE_LIMIT_LAUNCH_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    }),
  )
  if (!rateLimit.allowed) {
    const durationMs = Date.now() - startedAt
    log(
      'rate_limit',
      `Too many launch attempts from this IP. Retry in about ${rateLimit.retryAfterSec}s.`,
      'warning',
    )
    return Response.json(
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
    const verifiedWallet = await verifyWalletControlProof({
      proof: payload.walletProof,
      expectedWallet: payload.env.KUEST_ADDRESS,
      expectedChainId: affiliateConfig.chainId,
    })
    await reserveWalletAuthorization({
      db: affiliateEnv.AFFILIATE_DB,
      proofHash: verifiedWallet.proofHash,
      operatorWallet: verifiedWallet.address,
      chainId: affiliateConfig.chainId,
      expiresAt: verifiedWallet.expiresAt,
    })
    reservedProofHash = verifiedWallet.proofHash
    verifiedOperatorWallet = verifiedWallet.address

    const canonicalWallet = await deriveCanonicalDepositWallet({
      rpcUrl: affiliateConfig.rpcUrl,
      factory: affiliateConfig.depositWalletFactory,
      operatorWallet: verifiedWallet.address,
    })
    const dubClickId = readDubClickId(request)

    const projectName = sanitizeProjectName(payload.projectName || payload.brandName)
    const gitRepo = ensureValidRepo(payload.gitRepo)
    const gitBranch = payload.gitBranch.trim()
    const vercelTeamId = payload.vercelTeamId?.trim() || VERCEL_TEAM_ID?.trim() || undefined

    const vercelSession = await getValidVercelSession()

    const vercelToken = payload.tokens?.vercel || vercelSession?.accessToken || ''

    log(
      'validation',
      `Input accepted. Repo: ${gitRepo}#${gitBranch}. Database mode: ${payload.databaseMode}.`,
    )
    log('validation', `Vercel token: ${masked(vercelToken)}.`)

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
      vercelRegion: payload.vercelRegion,
      environmentVariables: vercelEnvironmentVariables,
      triggerDeployment: shouldAutoDeploy,
      log,
    })

    const attributionResult = await persistOperatorAttribution(affiliateEnv.AFFILIATE_DB, {
      operatorWallet: verifiedWallet.address,
      operatorEmail: payload.contactEmail,
      operatorName: payload.brandName.trim(),
      depositWallet: canonicalWallet.depositWallet,
      chainId: affiliateConfig.chainId,
      dubClickId,
      proofHash: verifiedWallet.proofHash,
      firstProjectId: vercel.projectId,
    })
    attributionPersisted = true
    const attributedClickId = attributionResult.attribution?.dub_click_id ?? null

    const finalizeAttribution = async () => {
      await completeOperatorAttribution(
        affiliateEnv.AFFILIATE_DB,
        verifiedWallet.address,
        affiliateConfig.chainId,
      )
      if (attributedClickId && affiliateConfig.dryRun) {
        await deliverPendingLead({
          db: affiliateEnv.AFFILIATE_DB,
          operatorWallet: verifiedWallet.address,
          chainId: affiliateConfig.chainId,
          maxAttempts: affiliateConfig.maxAttempts,
          dryRun: true,
        })
        log('affiliate', 'Affiliate lead payload saved in dry-run mode.')
      } else if (attributedClickId && affiliateConfig.dubApiKey) {
        await deliverPendingLead({
          db: affiliateEnv.AFFILIATE_DB,
          dub: createDubTracker(affiliateConfig.dubApiKey),
          operatorWallet: verifiedWallet.address,
          chainId: affiliateConfig.chainId,
          maxAttempts: affiliateConfig.maxAttempts,
        })
      } else if (attributedClickId) {
        log('affiliate', 'Affiliate lead queued because the Dub secret is unavailable.', 'warning')
      }
    }

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
        vercelRegion: payload.vercelRegion,
      })
      log('vercel', 'Deployment triggered after Supabase integration connection.')

      const projectUrl = normalizeSiteUrl(
        (await resolveProjectProductionUrl({
          token: vercelToken,
          teamId: launchTeamId,
          projectIdOrName: vercel.projectId,
        })) ||
          deployment.url ||
          vercel.projectUrl ||
          '',
      )

      await registerLaunchDomainSnapshot({
        url: projectUrl,
        apiKey: payload.env.KUEST_API_KEY,
      })
      await finalizeAttribution()

      const durationMs = Date.now() - startedAt
      return Response.json({
        ok: true,
        databaseMode: payload.databaseMode,
        projectId: vercel.projectId,
        projectName: vercel.projectName,
        resolvedTeamId: launchTeamId,
        projectUrl,
        vercelDashboardUrl: vercel.dashboardUrl || buildDashboardUrl(projectName, launchTeamId),
        supabaseDashboardUrl,
        logs,
        durationMs,
      })
    }

    const durationMs = Date.now() - startedAt
    await registerLaunchDomainSnapshot({
      url: vercel.projectUrl ?? '',
      apiKey: payload.env.KUEST_API_KEY,
    })
    await finalizeAttribution()

    return Response.json({
      ok: true,
      databaseMode: payload.databaseMode,
      projectId: vercel.projectId,
      projectName: vercel.projectName,
      resolvedTeamId: launchTeamId,
      projectUrl: vercel.projectUrl,
      vercelDashboardUrl: vercel.dashboardUrl || buildDashboardUrl(projectName, launchTeamId),
      supabaseDashboardUrl,
      logs,
      durationMs,
    })
  } catch (error) {
    if (reservedProofHash) {
      try {
        if (attributionPersisted && verifiedOperatorWallet) {
          await markOperatorLaunchFailed(
            affiliateEnv.AFFILIATE_DB,
            verifiedOperatorWallet,
            affiliateConfig.chainId,
          )
        } else {
          await failWalletAuthorization(affiliateEnv.AFFILIATE_DB, reservedProofHash)
        }
      } catch {
        // Preserve the launch failure; the reservation expires and remains non-replayable.
      }
    }
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
      return Response.json(
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
