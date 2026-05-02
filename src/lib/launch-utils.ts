import type {
  LaunchLogEntry,
  LaunchLogLevel,
  LaunchRequestBody,
} from '@/lib/launch-types'
import { randomBytes } from 'node:crypto'
import { normalizeSiteUrl } from '@/lib/site-url'

export class LaunchError extends Error {
  constructor(
    message: string,
    readonly step: string,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'LaunchError'
    this.step = step
    this.details = details
  }
}

export function createLogger(logs: LaunchLogEntry[]) {
  return (step: string, message: string, level: LaunchLogLevel = 'info') => {
    logs.push({
      at: new Date().toISOString(),
      level,
      step,
      message,
    })
  }
}

export function sanitizeProjectName(projectName: string) {
  const base = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  if (!base) {
    throw new LaunchError(
      'Project name generated an empty slug. Use letters and numbers.',
      'validation',
    )
  }
  return base.slice(0, 96)
}

export function ensureValidRepo(repo: string) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo.trim())) {
    throw new LaunchError(
      'Git repo must be in owner/repo format.',
      'validation',
    )
  }
  return repo.trim()
}

export function generateSecureToken(size = 24) {
  return randomBytes(size).toString('base64url')
}

export function parseLaunchRequest(input: unknown): LaunchRequestBody {
  if (!input || typeof input !== 'object') {
    throw new LaunchError('Invalid request body.', 'validation')
  }
  const raw = input as Partial<LaunchRequestBody>

  if (!raw.brandName || typeof raw.brandName !== 'string') {
    throw new LaunchError('brandName is required.', 'validation')
  }
  if (!raw.gitRepo || typeof raw.gitRepo !== 'string') {
    throw new LaunchError('gitRepo is required.', 'validation')
  }
  if (!raw.gitBranch || typeof raw.gitBranch !== 'string') {
    throw new LaunchError('gitBranch is required.', 'validation')
  }
  if (
    !raw.databaseMode
    || !['vercel_supabase_integration', 'supabase_direct', 'external_postgres'].includes(
      raw.databaseMode,
    )
  ) {
    throw new LaunchError(
      'databaseMode must be vercel_supabase_integration, supabase_direct, or external_postgres.',
      'validation',
    )
  }
  if (!raw.env || typeof raw.env !== 'object') {
    throw new LaunchError('env block is required.', 'validation')
  }

  const envObject = Object.fromEntries(
    Object.entries(raw.env).map(([key, value]) => [key, String(value ?? '').trim()]),
  )

  if (envObject.SITE_URL) {
    envObject.SITE_URL = normalizeSiteUrl(envObject.SITE_URL)
  }

  const requiredEnvKeys = [
    'KUEST_ADDRESS',
    'KUEST_API_KEY',
    'KUEST_API_SECRET',
    'KUEST_PASSPHRASE',
    'ADMIN_WALLETS',
    'REOWN_APPKIT_PROJECT_ID',
  ] as const

  for (const key of requiredEnvKeys) {
    if (!envObject[key]) {
      throw new LaunchError(`${key} is required.`, 'validation')
    }
  }

  if (!envObject.BETTER_AUTH_SECRET) {
    envObject.BETTER_AUTH_SECRET = generateSecureToken(24)
  }
  if (!envObject.CRON_SECRET) {
    envObject.CRON_SECRET = generateSecureToken(18)
  }

  return {
    brandName: raw.brandName,
    contactEmail:
      typeof raw.contactEmail === 'string' && raw.contactEmail.trim()
        ? raw.contactEmail.trim()
        : undefined,
    projectName:
      typeof raw.projectName === 'string' && raw.projectName.trim()
        ? raw.projectName.trim()
        : undefined,
    gitRepo: raw.gitRepo,
    gitBranch: raw.gitBranch,
    databaseMode: raw.databaseMode,
    vercelTeamId:
      typeof raw.vercelTeamId === 'string' && raw.vercelTeamId.trim()
        ? raw.vercelTeamId.trim()
        : undefined,
    tokens: {
      vercel:
        typeof raw.tokens?.vercel === 'string' && raw.tokens.vercel.trim()
          ? raw.tokens.vercel.trim()
          : undefined,
      supabase:
        typeof raw.tokens?.supabase === 'string' && raw.tokens.supabase.trim()
          ? raw.tokens.supabase.trim()
          : undefined,
    },
    supabase: raw.supabase
      ? {
          organizationId:
            typeof raw.supabase.organizationId === 'string'
            && raw.supabase.organizationId.trim()
              ? raw.supabase.organizationId.trim()
              : undefined,
          region:
            typeof raw.supabase.region === 'string' && raw.supabase.region.trim()
              ? raw.supabase.region.trim()
              : undefined,
          databasePassword:
            typeof raw.supabase.databasePassword === 'string'
            && raw.supabase.databasePassword.trim()
              ? raw.supabase.databasePassword.trim()
              : undefined,
          existingResourceId:
            typeof raw.supabase.existingResourceId === 'string'
            && raw.supabase.existingResourceId.trim()
              ? raw.supabase.existingResourceId.trim()
              : undefined,
        }
      : undefined,
    env: envObject,
  }
}

export function masked(value?: string) {
  if (!value) {
    return '(missing)'
  }
  if (value.length <= 8) {
    return '********'
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}
