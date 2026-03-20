import type { VercelDomainResponse, VercelProvisionResult } from '@/lib/launch-types'
import { LaunchError } from '@/lib/launch-utils'

const VERCEL_API_BASE = 'https://api.vercel.com'

type VercelEnvTarget = 'production' | 'preview' | 'development'

interface VercelProject {
  id: string
  name: string
}

interface VercelDeployment {
  id: string
  url?: string
}

interface VercelDomainVerification {
  type?: string
  domain?: string
  value?: string
  reason?: string
}

interface VercelProjectDomainRecord {
  name?: string
  verified?: boolean
  verification?: VercelDomainVerification[]
  configuredBy?: string
  nameservers?: string[]
  intendedNameservers?: string[]
  recommendedNameservers?: string[]
}

interface VercelDomainConfigRecord {
  configuredBy?: string
  nameservers?: string[]
  intendedNameservers?: string[]
  recommendedNameservers?: string[]
}

interface VercelEnvVar {
  key: string
  value: string
  target: readonly VercelEnvTarget[]
}

interface VercelIntegrationConfiguration {
  id: string
  slug?: string
  name?: string
  integration?: {
    slug?: string
    name?: string
  }
}

interface VercelIntegrationProduct {
  id?: string
  slug?: string
  name?: string
  protocols?: {
    storage?: unknown
  }
}

interface VercelIntegrationResource {
  id?: string
  internalId?: string
  externalId?: string
  externalResourceId?: string
  name?: string
}

interface VercelIntegrationStoreResponse {
  store?: {
    id?: string
    externalResourceId?: string
    dashboardUrl?: string
    name?: string
  }
  resourceId?: string
}

interface VercelTeam {
  id: string
  slug?: string
  name?: string
}

export interface SupabaseResourceOption {
  id: string
  name: string
}

interface VercelStorageStore {
  id?: string
  name?: string
  externalResourceId?: string
  integrationConfigurationId?: string
  installationId?: string
  integrationId?: string
}

function normalizeDeploymentUrl(url?: string) {
  const value = typeof url === 'string' ? url.trim() : ''
  if (!value) {
    return undefined
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }
  return `https://${value}`
}

function normalizeProjectDomainResponse(input: unknown, fallbackDomain: string): VercelDomainResponse {
  if (!input || typeof input !== 'object') {
    return {
      name: fallbackDomain,
      verified: false,
      verification: [],
    }
  }

  const source
    = 'domain' in input && (input as { domain?: unknown }).domain
      ? (input as { domain?: unknown }).domain
      : input
  if (!source || typeof source !== 'object') {
    return {
      name: fallbackDomain,
      verified: false,
      verification: [],
    }
  }

  const domain = source as VercelProjectDomainRecord
  const verification = Array.isArray(domain.verification)
    ? domain.verification
        .filter(record => record && typeof record === 'object')
        .map(record => ({
          type: typeof record.type === 'string' ? record.type : undefined,
          domain: typeof record.domain === 'string' ? record.domain : undefined,
          value: typeof record.value === 'string' ? record.value : undefined,
          reason: typeof record.reason === 'string' ? record.reason : undefined,
        }))
    : []

  return {
    name: typeof domain.name === 'string' && domain.name.trim() ? domain.name : fallbackDomain,
    verified: domain.verified === true,
    verification,
    nameservers: [],
    configuredBy: typeof domain.configuredBy === 'string' ? domain.configuredBy : undefined,
  }
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[]
  }
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map(item => item.trim())
}

function mergeUniqueStrings(...lists: Array<string[] | undefined>) {
  const merged = new Set<string>()
  for (const list of lists) {
    for (const item of list ?? []) {
      const normalized = item.trim()
      if (normalized) {
        merged.add(normalized)
      }
    }
  }
  return Array.from(merged)
}

function mergeDomainResponse(
  base: VercelDomainResponse,
  patch: Partial<VercelDomainResponse>,
): VercelDomainResponse {
  return {
    name: patch.name ?? base.name,
    verified: patch.verified ?? base.verified,
    verification: patch.verification?.length ? patch.verification : base.verification,
    nameservers: mergeUniqueStrings(base.nameservers, patch.nameservers),
    configuredBy: patch.configuredBy ?? base.configuredBy,
  }
}

async function vercelRequest<T>(
  token: string,
  path: string,
  init: RequestInit = {},
) {
  const response = await fetch(`${VERCEL_API_BASE}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })

  const rawBody = await response.text()
  function parseBody() {
    if (!rawBody.trim()) {
      return undefined
    }
    try {
      return JSON.parse(rawBody) as unknown
    }
    catch {
      return rawBody
    }
  }

  if (!response.ok) {
    const payload = parseBody()
    throw new LaunchError(
      `Vercel API request failed (${response.status}) at ${path}.`,
      'vercel',
      payload,
    )
  }

  if (response.status === 204 || !rawBody.trim()) {
    return undefined as T
  }

  return parseBody() as T
}

function withTeamId(path: string, teamId?: string) {
  if (!teamId) {
    return path
  }
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}teamId=${encodeURIComponent(teamId)}`
}

function extractErrorCode(details: unknown) {
  if (!details || typeof details !== 'object') {
    return ''
  }
  const value = (details as { error?: { code?: string } }).error?.code
  return typeof value === 'string' ? value : ''
}

function extractErrorMessage(details: unknown) {
  if (!details || typeof details !== 'object') {
    return ''
  }
  const value = (details as { error?: { message?: string } }).error?.message
  return typeof value === 'string' ? value : ''
}

function isValidationError(error: LaunchError) {
  const code = extractErrorCode(error.details).toLowerCase()
  return code === 'validation_error'
}

function extractRequiredMetadataKeys(error: LaunchError) {
  if (!isValidationError(error)) {
    return [] as string[]
  }

  const keys = new Set<string>()
  const message = extractErrorMessage(error.details)
  for (const match of message.matchAll(/metadata\.(\w+)\s*:\s*required/gi)) {
    if (match[1]) {
      keys.add(match[1])
    }
  }

  const fields = (error.details as { error?: { fields?: unknown[] } } | undefined)?.error?.fields
  if (Array.isArray(fields)) {
    for (const field of fields) {
      if (!field || typeof field !== 'object') {
        continue
      }
      const fieldMessage = String((field as { message?: unknown }).message ?? '')
      for (const match of fieldMessage.matchAll(/metadata\.(\w+)/gi)) {
        if (match[1]) {
          keys.add(match[1])
        }
      }
    }
  }

  return Array.from(keys)
}

function isProjectAlreadyExistsError(error: LaunchError) {
  const code = extractErrorCode(error.details).toLowerCase()
  const message = extractErrorMessage(error.details).toLowerCase()
  return code === 'conflict' || message.includes('already exists')
}

function isIntegrationConnectionConflict(error: LaunchError) {
  const code = extractErrorCode(error.details).toLowerCase()
  const message = extractErrorMessage(error.details).toLowerCase()
  return (
    code === 'conflict'
    || message.includes('already connected')
    || message.includes('already attached')
    || message.includes('already linked')
  )
}

function isNotFoundError(error: LaunchError) {
  const code = extractErrorCode(error.details).toLowerCase()
  const message = extractErrorMessage(error.details).toLowerCase()
  return code === 'not_found' || message.includes('not found') || error.message.includes('(404)')
}

function isForbiddenError(error: LaunchError) {
  const code = extractErrorCode(error.details).toLowerCase()
  const message = extractErrorMessage(error.details).toLowerCase()
  return code === 'forbidden' || message.includes('permission') || error.message.includes('(403)')
}

function isStoreInsertFailure(error: LaunchError) {
  const message = extractErrorMessage(error.details).toLowerCase()
  return message.includes('failed to insert project')
}

function isMissingRepoIdError(error: LaunchError) {
  const message = extractErrorMessage(error.details).toLowerCase()
  return message.includes('gitsource') && message.includes('repoid')
}

function isSupabaseIntegrationLookupError(error: LaunchError) {
  const message = error.message.toLowerCase()
  return message.includes('/v1/integrations/configurations')
}

function withSupabaseIntegrationHint(error: unknown, teamId?: string): never {
  if (!(error instanceof LaunchError) || !isSupabaseIntegrationLookupError(error)) {
    throw error
  }

  const hint = teamId
    ? 'Confirm your Vercel Access Token and Team ID are correct. If you are using a personal Vercel account, clear Team ID and try again.'
    : 'Confirm your Vercel Access Token is correct and that Supabase is installed in this Vercel account.'

  throw new LaunchError(
    `Unable to load Supabase from Vercel. ${hint}`,
    error.step,
    error.details,
  )
}

async function fetchProjectRepoId(params: {
  token: string
  teamId?: string
  projectIdOrName: string
}) {
  const path = withTeamId(
    `/v10/projects/${encodeURIComponent(params.projectIdOrName)}`,
    params.teamId,
  )
  const data = await vercelRequest<unknown>(params.token, path)
  if (!data || typeof data !== 'object') {
    return undefined
  }

  const record = data as Record<string, unknown>
  const fromLink = (record.link as { repoId?: unknown } | undefined)?.repoId
  const fromGitRepository = (
    record.gitRepository as { repoId?: unknown } | undefined
  )?.repoId
  const fromSource = (record.source as { repoId?: unknown } | undefined)?.repoId
  const candidate = fromLink ?? fromGitRepository ?? fromSource

  if (typeof candidate === 'number' || typeof candidate === 'string') {
    return candidate
  }
  return undefined
}

async function findProjectByName(params: {
  token: string
  teamId?: string
  projectName: string
}) {
  const escaped = encodeURIComponent(params.projectName)
  const candidates = [
    withTeamId(`/v10/projects/${escaped}`, params.teamId),
    withTeamId(`/v9/projects/${escaped}`, params.teamId),
  ]

  for (const path of candidates) {
    const response = await fetch(`${VERCEL_API_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${params.token}`,
      },
      cache: 'no-store',
    })
    if (response.status === 404) {
      continue
    }
    if (!response.ok) {
      continue
    }
    const data = (await response.json()) as Partial<VercelProject>
    if (data.id && data.name) {
      return {
        id: data.id,
        name: data.name,
      } satisfies VercelProject
    }
  }

  return null
}

export async function preflightVercelSupabaseLaunch(params: {
  token: string
  teamId?: string
  projectName: string
  log: (_step: string, _message: string) => void
}) {
  params.log('preflight', 'Checking Supabase integration availability in Vercel...')

  const match = await resolveSupabaseScope({
    token: params.token,
    requestedTeamId: params.teamId,
    log: params.log,
  })

  const products = await listIntegrationProducts({
    token: params.token,
    integrationConfigurationId: match.configuration.id,
    teamId: match.teamId,
  })
  if (!products.length) {
    throw new LaunchError(
      'Supabase integration exists but no database product is available. Complete the Storage setup in Vercel and retry.',
      'preflight',
    )
  }

  const existingProject = await findProjectByName({
    token: params.token,
    teamId: match.teamId,
    projectName: params.projectName,
  })

  if (existingProject) {
    params.log(
      'preflight',
      `Project ${params.projectName} already exists and will be reused.`,
    )
  }
  else {
    params.log('preflight', 'Project slug is available.')
  }

  return {
    resolvedTeamId: match.teamId,
  }
}

export async function listSupabaseIntegrationResources(params: {
  token: string
  teamId?: string
  log?: (_step: string, _message: string) => void
}) {
  const log
    = params.log
      ?? ((step: string, message: string) => {
        void step
        void message
      })

  try {
    const match = await resolveSupabaseScope({
      token: params.token,
      requestedTeamId: params.teamId,
      log,
    })

    const products = await listIntegrationProducts({
      token: params.token,
      integrationConfigurationId: match.configuration.id,
      teamId: match.teamId,
    })

    const selectedProduct = pickSupabaseProduct(products)
    const integrationProductIdOrSlug = selectedProduct?.id || selectedProduct?.slug
    const resources = await listIntegrationResources({
      token: params.token,
      teamId: match.teamId,
      integrationConfigurationId: match.configuration.id,
      integrationProductIdOrSlug,
    })

    const seen = new Set<string>()
    const options: SupabaseResourceOption[] = []
    for (const resource of resources) {
      const id = resolveIntegrationResourceId(resource)
      if (!id || seen.has(id)) {
        continue
      }
      seen.add(id)
      options.push({
        id,
        name: resource.name?.trim() || id,
      })
    }

    return {
      resolvedTeamId: match.teamId,
      resources: options,
    }
  }
  catch (error) {
    return withSupabaseIntegrationHint(error, params.teamId)
  }
}

export async function provisionVercelProject(params: {
  token: string
  teamId?: string
  projectName: string
  gitRepo: string
  gitBranch: string
  environmentVariables: VercelEnvVar[]
  triggerDeployment?: boolean
  log: (_step: string, _message: string) => void
}): Promise<VercelProvisionResult> {
  params.log('vercel', 'Creating Vercel project...')

  const createPath = withTeamId('/v10/projects', params.teamId)
  let project: VercelProject
  let reusedExisting = false

  try {
    project = await vercelRequest<VercelProject>(params.token, createPath, {
      method: 'POST',
      body: JSON.stringify({
        name: params.projectName,
        framework: 'nextjs',
        gitRepository: {
          type: 'github',
          repo: params.gitRepo,
          productionBranch: params.gitBranch,
        },
        environmentVariables: params.environmentVariables.map(item => ({
          key: item.key,
          value: item.value,
          type: 'encrypted',
          target: item.target,
        })),
      }),
    })
  }
  catch (error) {
    if (!(error instanceof LaunchError)) {
      throw error
    }

    if (isProjectAlreadyExistsError(error)) {
      const existingProject = await findProjectByName({
        token: params.token,
        teamId: params.teamId,
        projectName: params.projectName,
      })
      if (!existingProject) {
        throw error
      }
      project = existingProject
      reusedExisting = true
      params.log(
        'vercel',
        `Project ${params.projectName} already exists. Reusing ${existingProject.id}.`,
      )
    }
    else {
      params.log(
        'vercel',
        'Primary import payload failed. Retrying with minimal payload...',
      )

      try {
        project = await vercelRequest<VercelProject>(params.token, createPath, {
          method: 'POST',
          body: JSON.stringify({
            name: params.projectName,
            framework: 'nextjs',
            gitRepository: {
              type: 'github',
              repo: params.gitRepo,
              productionBranch: params.gitBranch,
            },
          }),
        })
      }
      catch (retryError) {
        if (!(retryError instanceof LaunchError)) {
          throw retryError
        }
        if (!isProjectAlreadyExistsError(retryError)) {
          throw retryError
        }
        const existingProject = await findProjectByName({
          token: params.token,
          teamId: params.teamId,
          projectName: params.projectName,
        })
        if (!existingProject) {
          throw retryError
        }
        project = existingProject
        reusedExisting = true
        params.log(
          'vercel',
          `Project ${params.projectName} already exists. Reusing ${existingProject.id}.`,
        )
      }

      if (!reusedExisting) {
        for (const envVar of params.environmentVariables) {
          await createProjectEnvVar({
            token: params.token,
            teamId: params.teamId,
            projectIdOrName: project.id,
            envVar,
          })
        }
      }
    }
  }

  params.log('vercel', `Project ready: ${project.name} (${project.id}).`)
  if (reusedExisting) {
    params.log(
      'vercel',
      'Using existing project. Existing environment variables were preserved.',
    )
  }
  const shouldTriggerDeployment = params.triggerDeployment ?? true
  let deploymentId: string | undefined
  let deploymentUrl: string | undefined

  if (shouldTriggerDeployment) {
    try {
      const deployment = await createProjectDeployment({
        token: params.token,
        teamId: params.teamId,
        projectId: project.id,
        projectName: project.name,
        gitRepo: params.gitRepo,
        gitBranch: params.gitBranch,
      })
      deploymentId = deployment.id
      deploymentUrl = deployment.url
      params.log('vercel', `Production deployment triggered: ${deployment.id}.`)
    }
    catch {
      params.log(
        'vercel',
        'Deployment trigger endpoint failed. The Git import should still start build automatically.',
      )
    }
  }

  return {
    projectId: project.id,
    projectName: project.name,
    projectUrl: deploymentUrl,
    dashboardUrl: `https://vercel.com/dashboard`,
    deploymentId,
    reusedExisting,
  }
}

export async function connectSupabaseViaVercelIntegration(params: {
  token: string
  teamId?: string
  projectId: string
  projectName: string
  existingResourceId?: string
  supabaseRegion?: string
  supabasePublicEnvVarPrefix?: string
  log: (_step: string, _message: string) => void
}) {
  params.log('vercel-integration', 'Searching installed Supabase integration...')
  const configuration = await findSupabaseConfiguration({
    token: params.token,
    teamId: params.teamId,
  })
  if (!configuration) {
    throw new LaunchError(
      'No Supabase integration configuration found in this Vercel account/team.',
      'vercel-integration',
    )
  }

  const integrationConfigurationId = configuration.id
  params.log(
    'vercel-integration',
    `Supabase integration found: ${integrationConfigurationId}.`,
  )

  const products = await listIntegrationProducts({
    token: params.token,
    integrationConfigurationId,
    teamId: params.teamId,
  })

  if (!products.length) {
    throw new LaunchError(
      'Supabase integration has no products available for provisioning.',
      'vercel-integration',
    )
  }

  const chosenProduct = pickSupabaseProduct(products)
  const integrationProductIdOrSlug = chosenProduct.id || chosenProduct.slug
  if (!integrationProductIdOrSlug) {
    throw new LaunchError(
      'Could not determine Supabase integration product id/slug.',
      'vercel-integration',
      chosenProduct,
    )
  }

  async function safeListResources() {
    try {
      return await listIntegrationResources({
        token: params.token,
        teamId: params.teamId,
        integrationConfigurationId,
        integrationProductIdOrSlug,
      })
    }
    catch (error) {
      if (error instanceof LaunchError) {
        params.log(
          'vercel-integration',
          `Warning: failed to list existing Supabase resources: ${error.message}`,
        )
        if (error.details) {
          params.log('vercel-integration', `Details: ${JSON.stringify(error.details)}`)
        }
      }
      params.log(
        'vercel-integration',
        'Warning: listing resources is unavailable. Continuing with create flow.',
      )
      return [] as VercelIntegrationResource[]
    }
  }

  if (params.existingResourceId) {
    const selectedResourceId = params.existingResourceId.trim()
    params.log(
      'vercel-integration',
      `Using selected existing Supabase database: ${selectedResourceId}.`,
    )
    await connectIntegrationResourceToProject({
      token: params.token,
      teamId: params.teamId,
      projectId: params.projectId,
      resourceId: selectedResourceId,
      integrationConfigurationId,
    })
    params.log('vercel-integration', 'Selected Supabase database connected to project.')
    return {
      dashboardUrl: undefined,
      resourceId: selectedResourceId,
      integrationConfigurationId,
    }
  }

  async function tryAttachReusableResource(resources: VercelIntegrationResource[], reason: string) {
    const candidate = pickReusableSupabaseResource(resources, params.projectName)
    if (!candidate) {
      return null
    }

    const resourceId = resolveIntegrationResourceId(candidate)
    if (!resourceId) {
      return null
    }

    params.log(
      'vercel-integration',
      `Reusing existing Supabase resource ${resourceId} (${candidate.name ?? 'unnamed'}) because ${reason}.`,
    )
    try {
      await connectIntegrationResourceToProject({
        token: params.token,
        teamId: params.teamId,
        projectId: params.projectId,
        resourceId,
        integrationConfigurationId,
      })
    }
    catch (error) {
      if (error instanceof LaunchError && isIntegrationConnectionConflict(error)) {
        params.log(
          'vercel-integration',
          `Warning: existing resource ${resourceId} is already connected elsewhere. Continuing with create flow.`,
        )
        return null
      }
      throw error
    }
    params.log('vercel-integration', 'Existing Supabase resource connected to project.')
    return {
      dashboardUrl: undefined,
      resourceId,
      integrationConfigurationId,
    }
  }

  const existingResources = await safeListResources()
  const reusedExisting = await tryAttachReusableResource(
    existingResources,
    'a compatible unlinked resource is already available',
  )
  if (reusedExisting) {
    return reusedExisting
  }

  const storeNameCandidates = createStoreNameCandidates(params.projectName)
  const regionCandidates = Array.from(
    new Set(
      [
        params.supabaseRegion,
        process.env.VERCEL_SUPABASE_REGION,
        'us-east-1',
        'us-west-1',
        'eu-west-1',
        'sa-east-1',
        'ap-southeast-1',
      ]
        .map(value => value?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value)),
    ),
  )
  const publicEnvVarPrefixCandidates = Array.from(
    new Set(
      [
        params.supabasePublicEnvVarPrefix,
        process.env.VERCEL_SUPABASE_PUBLIC_ENV_VAR_PREFIX,
        'NEXT_PUBLIC_',
        'NEXT_PUBLIC',
      ]
        .map(value => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  )

  let createdStore: VercelIntegrationStoreResponse | undefined
  let selectedStoreName: string | undefined
  let selectedRegion: string | undefined
  let selectedPublicEnvVarPrefix: string | undefined
  let lastMetadataValidationError: LaunchError | undefined
  let lastCreateError: LaunchError | undefined

  createAttempts:
  for (const storeName of storeNameCandidates) {
    let shouldTryNextStoreName = false

    metadataAttempts:
    for (const region of regionCandidates) {
      for (const publicEnvVarPrefix of publicEnvVarPrefixCandidates) {
        try {
          params.log(
            'vercel-integration',
            `Creating Supabase store "${storeName}" from product ${integrationProductIdOrSlug} in region ${region} (prefix ${publicEnvVarPrefix})...`,
          )
          createdStore = await createIntegrationStore({
            token: params.token,
            teamId: params.teamId,
            integrationConfigurationId,
            integrationProductIdOrSlug,
            storeName,
            externalId: `${storeName}-${Date.now().toString(36)}`,
            region,
            publicEnvVarPrefix,
          })
          selectedStoreName = storeName
          selectedRegion = region
          selectedPublicEnvVarPrefix = publicEnvVarPrefix
          break createAttempts
        }
        catch (error) {
          if (!(error instanceof LaunchError) || !isValidationError(error)) {
            throw error
          }

          const requiredMetadataKeys = extractRequiredMetadataKeys(error)
          const unsupportedRequiredKeys = requiredMetadataKeys.filter(
            key => key !== 'region' && key !== 'publicEnvVarPrefix',
          )
          if (unsupportedRequiredKeys.length > 0) {
            lastCreateError = new LaunchError(
              `Supabase integration requires additional metadata not auto-supported: ${unsupportedRequiredKeys.join(', ')}.`,
              'vercel-integration',
              error.details,
            )
            break createAttempts
          }

          if (requiredMetadataKeys.length === 0) {
            lastCreateError = error
            if (isStoreInsertFailure(error)) {
              shouldTryNextStoreName = true
              params.log(
                'vercel-integration',
                `Warning: store name "${storeName}" failed to insert. Trying alternate store name...`,
              )
              break metadataAttempts
            }
            params.log(
              'vercel-integration',
              'Warning: create-store failed with non-metadata validation error. Will try attaching existing resource.',
            )
            break createAttempts
          }

          lastMetadataValidationError = error
          params.log(
            'vercel-integration',
            `Warning: integration rejected region ${region} / prefix ${publicEnvVarPrefix}. Trying next option...`,
          )
        }
      }
    }

    if (!shouldTryNextStoreName) {
      break
    }
  }

  if (!createdStore) {
    const resourcesAfterCreateFailure = await safeListResources()
    const reusedAfterFailure = await tryAttachReusableResource(
      resourcesAfterCreateFailure,
      'new Supabase project creation failed',
    )
    if (reusedAfterFailure) {
      return reusedAfterFailure
    }

    if (lastCreateError) {
      throw lastCreateError
    }
    if (lastMetadataValidationError) {
      throw lastMetadataValidationError
    }
    throw new LaunchError(
      'Failed to create Supabase store. No valid region/prefix candidate was available.',
      'vercel-integration',
    )
  }

  if (selectedRegion) {
    params.log(
      'vercel-integration',
      `Supabase store "${selectedStoreName ?? 'unknown'}" created in region ${selectedRegion} with prefix ${selectedPublicEnvVarPrefix ?? 'unknown'}.`,
    )
  }

  const directResourceId
    = createdStore.resourceId
      || createdStore.store?.id
      || createdStore.store?.externalResourceId
  const dashboardUrl = createdStore.store?.dashboardUrl

  let resourceId = directResourceId
  if (!resourceId) {
    params.log(
      'vercel-integration',
      'Store created but resource id missing in response. Listing integration resources...',
    )
    const resources = await safeListResources()
    const picked
      = resources.find(item => item.name === selectedStoreName)
        || resources.at(-1)
    resourceId = resolveIntegrationResourceId(picked)
  }

  if (!resourceId) {
    throw new LaunchError(
      'Could not resolve integration resource id for Supabase store connection.',
      'vercel-integration',
      createdStore,
    )
  }

  params.log(
    'vercel-integration',
    `Connecting resource ${resourceId} to project ${params.projectId}...`,
  )
  await connectIntegrationResourceToProject({
    token: params.token,
    teamId: params.teamId,
    projectId: params.projectId,
    resourceId,
    integrationConfigurationId,
  })

  params.log('vercel-integration', 'Supabase store connected to project.')
  return {
    dashboardUrl,
    resourceId,
    integrationConfigurationId,
  }
}

async function createProjectEnvVar(params: {
  token: string
  teamId?: string
  projectIdOrName: string
  envVar: VercelEnvVar
}) {
  const path = withTeamId(
    `/v10/projects/${encodeURIComponent(params.projectIdOrName)}/env`,
    params.teamId,
  )
  await vercelRequest(params.token, path, {
    method: 'POST',
    body: JSON.stringify({
      key: params.envVar.key,
      value: params.envVar.value,
      type: 'encrypted',
      target: params.envVar.target,
    }),
  })
}

export async function createProjectDeployment(params: {
  token: string
  teamId?: string
  projectId?: string
  projectName: string
  gitRepo: string
  gitBranch: string
}) {
  const path = withTeamId('/v13/deployments', params.teamId)
  const projectReference = params.projectId || params.projectName

  try {
    const deployment = await vercelRequest<VercelDeployment>(params.token, path, {
      method: 'POST',
      body: JSON.stringify({
        name: params.projectName,
        target: 'production',
        project: projectReference,
      }),
    })
    return {
      ...deployment,
      url: normalizeDeploymentUrl(deployment.url),
    }
  }
  catch (error) {
    if (!(error instanceof LaunchError)) {
      throw error
    }

    // Legacy payload for accounts that still require explicit gitSource.
    try {
      const deployment = await vercelRequest<VercelDeployment>(params.token, path, {
        method: 'POST',
        body: JSON.stringify({
          name: params.projectName,
          target: 'production',
          project: projectReference,
          gitSource: {
            type: 'github',
            repo: params.gitRepo,
            ref: params.gitBranch,
          },
        }),
      })
      return {
        ...deployment,
        url: normalizeDeploymentUrl(deployment.url),
      }
    }
    catch (legacyError) {
      if (!(legacyError instanceof LaunchError)) {
        throw legacyError
      }
      if (!isMissingRepoIdError(legacyError)) {
        throw legacyError
      }

      const repoId = await fetchProjectRepoId({
        token: params.token,
        teamId: params.teamId,
        projectIdOrName: projectReference,
      })
      if (!repoId) {
        throw legacyError
      }

      const deployment = await vercelRequest<VercelDeployment>(params.token, path, {
        method: 'POST',
        body: JSON.stringify({
          name: params.projectName,
          target: 'production',
          project: projectReference,
          gitSource: {
            type: 'github',
            repo: params.gitRepo,
            repoId,
            ref: params.gitBranch,
          },
        }),
      })
      return {
        ...deployment,
        url: normalizeDeploymentUrl(deployment.url),
      }
    }
  }
}

export async function addProjectDomain(params: {
  token: string
  teamId?: string
  projectIdOrName: string
  domain: string
}) {
  const path = withTeamId(
    `/v10/projects/${encodeURIComponent(params.projectIdOrName)}/domains`,
    params.teamId,
  )

  const payload = await vercelRequest<unknown>(params.token, path, {
    method: 'POST',
    body: JSON.stringify({
      name: params.domain,
    }),
  })

  const base = normalizeProjectDomainResponse(payload, params.domain)
  return await enrichDomainResponse(params, base)
}

export async function verifyProjectDomain(params: {
  token: string
  teamId?: string
  projectIdOrName: string
  domain: string
}) {
  const candidatePaths = [
    withTeamId(
      `/v10/projects/${encodeURIComponent(params.projectIdOrName)}/domains/${encodeURIComponent(
        params.domain,
      )}/verify`,
      params.teamId,
    ),
    withTeamId(
      `/v9/projects/${encodeURIComponent(params.projectIdOrName)}/domains/${encodeURIComponent(
        params.domain,
      )}/verify`,
      params.teamId,
    ),
  ]

  let lastError: LaunchError | null = null
  for (const path of candidatePaths) {
    try {
      const payload = await vercelRequest<unknown>(params.token, path, {
        method: 'POST',
      })
      const base = normalizeProjectDomainResponse(payload, params.domain)
      return await enrichDomainResponse(params, base)
    }
    catch (error) {
      if (error instanceof LaunchError && isNotFoundError(error)) {
        lastError = error
        continue
      }
      throw error
    }
  }

  if (lastError) {
    throw lastError
  }

  return {
    name: params.domain,
    verified: false,
    verification: [],
    nameservers: [],
  } satisfies VercelDomainResponse
}

async function enrichDomainResponse(
  params: {
    token: string
    teamId?: string
    projectIdOrName: string
    domain: string
  },
  base: VercelDomainResponse,
) {
  let next = base

  try {
    const details = await fetchProjectDomainDetails(params)
    if (details) {
      next = mergeDomainResponse(next, details)
    }
  }
  catch {
    // Best-effort only.
  }

  try {
    const config = await fetchDomainConfig(params.token, params.domain)
    if (config) {
      next = mergeDomainResponse(next, config)
    }
  }
  catch {
    // Best-effort only.
  }

  return next
}

async function fetchProjectDomainDetails(params: {
  token: string
  teamId?: string
  projectIdOrName: string
  domain: string
}) {
  const candidatePaths = [
    withTeamId(
      `/v10/projects/${encodeURIComponent(params.projectIdOrName)}/domains/${encodeURIComponent(
        params.domain,
      )}`,
      params.teamId,
    ),
    withTeamId(
      `/v9/projects/${encodeURIComponent(params.projectIdOrName)}/domains/${encodeURIComponent(
        params.domain,
      )}`,
      params.teamId,
    ),
  ]

  for (const path of candidatePaths) {
    try {
      const payload = await vercelRequest<unknown>(params.token, path)
      const normalized = normalizeProjectDomainResponse(payload, params.domain)
      const source
        = payload && typeof payload === 'object' && 'domain' in payload
          ? ((payload as { domain?: unknown }).domain as VercelProjectDomainRecord | undefined)
          : (payload as VercelProjectDomainRecord | undefined)

      const nameservers = mergeUniqueStrings(
        normalized.nameservers,
        readStringArray(source?.nameservers),
        readStringArray(source?.intendedNameservers),
        readStringArray(source?.recommendedNameservers),
      )

      return {
        ...normalized,
        nameservers,
      } satisfies Partial<VercelDomainResponse>
    }
    catch (error) {
      if (error instanceof LaunchError && isNotFoundError(error)) {
        continue
      }
      throw error
    }
  }

  return null
}

async function fetchDomainConfig(token: string, domain: string) {
  const candidatePaths = [
    `/v6/domains/${encodeURIComponent(domain)}/config`,
    `/v6/domains/${encodeURIComponent(domain)}`,
  ]

  for (const path of candidatePaths) {
    try {
      const payload = await vercelRequest<unknown>(token, path)
      if (!payload || typeof payload !== 'object') {
        continue
      }

      const source
        = 'domain' in payload
          ? ((payload as { domain?: unknown }).domain as VercelDomainConfigRecord | undefined)
          : (payload as VercelDomainConfigRecord | undefined)

      const nameservers = mergeUniqueStrings(
        readStringArray(source?.nameservers),
        readStringArray(source?.intendedNameservers),
        readStringArray(source?.recommendedNameservers),
      )

      return {
        nameservers,
        configuredBy: typeof source?.configuredBy === 'string' ? source.configuredBy : undefined,
      } satisfies Partial<VercelDomainResponse>
    }
    catch (error) {
      if (error instanceof LaunchError && isNotFoundError(error)) {
        continue
      }
      throw error
    }
  }

  return null
}

async function findSupabaseConfiguration(params: {
  token: string
  teamId?: string
}) {
  const response = await listIntegrationConfigurations({
    token: params.token,
    teamId: params.teamId,
  })

  const configurations = normalizeConfigurationsResponse(response)
  const directMatch
    = configurations.find(configuration => isSupabaseLikeConfiguration(configuration))
      ?? null
  if (directMatch) {
    return directMatch
  }

  // Some marketplace installations do not expose "supabase" in configuration slug/name.
  // Fallback: inspect product catalogs and pick a configuration with DB/storage products.
  for (const configuration of configurations) {
    try {
      const products = await listIntegrationProducts({
        token: params.token,
        teamId: params.teamId,
        integrationConfigurationId: configuration.id,
      })
      const hasDatabaseProduct = products.some((product) => {
        const signature = `${product.slug ?? ''} ${product.name ?? ''}`.toLowerCase()
        return (
          signature.includes('supabase')
          || signature.includes('postgres')
          || signature.includes('database')
          || Boolean(product.protocols?.storage)
        )
      })
      if (hasDatabaseProduct) {
        return configuration
      }
    }
    catch {
      // Ignore per-configuration failures and keep searching.
    }
  }

  return null
}

async function listIntegrationConfigurations(params: {
  token: string
  teamId?: string
}) {
  const candidatePaths = Array.from(
    new Set(
      [
        withTeamId('/v1/integrations/configurations?view=account', params.teamId),
        params.teamId ? withTeamId('/v1/integrations/configurations?view=team', params.teamId) : '',
        withTeamId('/v1/integrations/configurations', params.teamId),
      ].filter(Boolean),
    ),
  )

  let lastForbiddenError: LaunchError | null = null

  for (const path of candidatePaths) {
    try {
      return await vercelRequest<unknown>(params.token, path)
    }
    catch (error) {
      if (error instanceof LaunchError && isForbiddenError(error)) {
        lastForbiddenError = error
        continue
      }
      throw error
    }
  }

  if (lastForbiddenError) {
    throw new LaunchError(
      'Vercel denied access while listing integrations. This auth context may not have integration read permission yet.',
      'vercel-integration',
      lastForbiddenError.details,
    )
  }

  return { configurations: [] }
}

async function resolveSupabaseScope(params: {
  token: string
  requestedTeamId?: string
  log: (_step: string, _message: string) => void
}) {
  if (params.requestedTeamId) {
    const configuration = await findSupabaseConfiguration({
      token: params.token,
      teamId: params.requestedTeamId,
    })
    if (!configuration) {
      throw new LaunchError(
        `Supabase integration was not found in team "${params.requestedTeamId}". In Vercel Storage, install/create Supabase in this same team or clear the team id field.`,
        'preflight',
      )
    }
    return {
      teamId: params.requestedTeamId,
      configuration,
    }
  }

  const personalConfiguration = await findSupabaseConfiguration({
    token: params.token,
  })
  if (personalConfiguration) {
    params.log('preflight', 'Supabase integration found in personal account.')
    return {
      teamId: undefined,
      configuration: personalConfiguration,
    }
  }

  const teams = await listAccessibleTeams(params.token)
  const matches: Array<{
    team: VercelTeam
    configuration: VercelIntegrationConfiguration
  }> = []

  for (const team of teams) {
    const configuration = await findSupabaseConfiguration({
      token: params.token,
      teamId: team.id,
    })
    if (configuration) {
      matches.push({ team, configuration })
    }
  }

  if (matches.length === 1) {
    const [singleMatch] = matches
    const teamLabel = formatTeamLabel(singleMatch.team)
    params.log(
      'preflight',
      `Supabase integration found in team ${teamLabel}. Using this team automatically.`,
    )
    return {
      teamId: singleMatch.team.id,
      configuration: singleMatch.configuration,
    }
  }

  if (matches.length > 1) {
    const options = matches
      .map(({ team }) => `${formatTeamLabel(team)} (id: ${team.id})`)
      .join('; ')
    throw new LaunchError(
      `Supabase integration was found in multiple teams. Fill "Vercel target team id" with one of: ${options}.`,
      'preflight',
    )
  }

  throw new LaunchError(
    'Supabase integration is not configured in your personal account or any accessible team. In Vercel open Storage, install/create Supabase, then retry.',
    'preflight',
  )
}

function normalizeConfigurationsResponse(input: unknown) {
  if (Array.isArray(input)) {
    return input as VercelIntegrationConfiguration[]
  }
  if (input && typeof input === 'object') {
    const fromObject = (input as { configurations?: unknown }).configurations
    if (Array.isArray(fromObject)) {
      return fromObject as VercelIntegrationConfiguration[]
    }
  }
  return [] as VercelIntegrationConfiguration[]
}

function isSupabaseLikeConfiguration(configuration: VercelIntegrationConfiguration) {
  const signature = [
    configuration.slug,
    configuration.name,
    configuration.integration?.slug,
    configuration.integration?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return signature.includes('supabase')
}

async function listIntegrationProducts(params: {
  token: string
  teamId?: string
  integrationConfigurationId: string
}) {
  const path = withTeamId(
    `/v1/integrations/configuration/${encodeURIComponent(
      params.integrationConfigurationId,
    )}/products`,
    params.teamId,
  )
  const response = await vercelRequest<{ products?: VercelIntegrationProduct[] }>(
    params.token,
    path,
  )
  return response.products ?? []
}

async function listAccessibleTeams(token: string) {
  const response = await vercelRequest<{ teams?: VercelTeam[] }>(token, '/v2/teams')
  return response.teams ?? []
}

function formatTeamLabel(team: VercelTeam) {
  return team.slug || team.name || team.id
}

function resolveIntegrationResourceId(resource?: VercelIntegrationResource | null) {
  if (!resource) {
    return undefined
  }
  return resource.internalId || resource.id || resource.externalResourceId || resource.externalId
}

function pickReusableSupabaseResource(
  resources: VercelIntegrationResource[],
  projectName: string,
) {
  if (!resources.length) {
    return null
  }

  const normalizedProjectName = projectName.toLowerCase()
  const exactPreferredNames = new Set([`${normalizedProjectName}-db`, normalizedProjectName])

  const byExactName
    = resources.find((resource) => {
      const name = resource.name?.toLowerCase()
      return Boolean(name && exactPreferredNames.has(name))
    }) ?? null
  if (byExactName) {
    return byExactName
  }

  const byContains
    = resources.find(resource => resource.name?.toLowerCase().includes(normalizedProjectName))
      ?? null
  if (byContains) {
    return byContains
  }

  // Auto-reuse only when there is a single resource and choice is unambiguous.
  if (resources.length === 1) {
    return resources[0]
  }

  return null
}

function createStoreNameCandidates(projectName: string) {
  function normalize(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 58)
  }

  const base = normalize(`${projectName}-db`) || 'kuest-db'
  const stamp = Date.now().toString(36)
  const entropy = Math.random().toString(36).slice(2, 6)

  return Array.from(
    new Set([base, normalize(`${base}-${stamp}`), normalize(`${base}-${stamp}-${entropy}`)]),
  ).filter(Boolean)
}

function pickSupabaseProduct(products: VercelIntegrationProduct[]) {
  return (
    products.find((product) => {
      const signature = `${product.slug ?? ''} ${product.name ?? ''}`.toLowerCase()
      return signature.includes('postgres') || signature.includes('db')
    })
    || products.find(product => Boolean(product.protocols?.storage))
    || products[0]
  )
}

async function createIntegrationStore(params: {
  token: string
  teamId?: string
  integrationConfigurationId: string
  integrationProductIdOrSlug: string
  storeName: string
  externalId: string
  region: string
  publicEnvVarPrefix: string
}) {
  const path = withTeamId('/v1/storage/stores/integration/direct', params.teamId)
  return await vercelRequest<VercelIntegrationStoreResponse>(params.token, path, {
    method: 'POST',
    body: JSON.stringify({
      name: params.storeName,
      externalId: params.externalId,
      source: 'deploy-button',
      integrationConfigurationId: params.integrationConfigurationId,
      integrationProductIdOrSlug: params.integrationProductIdOrSlug,
      metadata: {
        createdBy: 'kuest-launchpad',
        region: params.region,
        publicEnvVarPrefix: params.publicEnvVarPrefix,
      },
    }),
  })
}

async function listIntegrationResources(params: {
  token: string
  teamId?: string
  integrationConfigurationId: string
  integrationProductIdOrSlug?: string
}) {
  const encodedConfigurationId = encodeURIComponent(params.integrationConfigurationId)
  const productQuery = params.integrationProductIdOrSlug
    ? `?productId=${encodeURIComponent(params.integrationProductIdOrSlug)}`
    : ''

  const paths = [
    withTeamId(`/v1/installations/${encodedConfigurationId}/resources${productQuery}`, params.teamId),
    withTeamId(`/v1/installations/${encodedConfigurationId}/resources`, params.teamId),
    withTeamId(
      `/v1/integrations/installations/${encodedConfigurationId}/resources${productQuery}`,
      params.teamId,
    ),
    withTeamId(`/v1/integrations/installations/${encodedConfigurationId}/resources`, params.teamId),
  ]

  let lastError: LaunchError | undefined
  for (const path of paths) {
    try {
      const response = await vercelRequest<unknown>(params.token, path)
      const resources = normalizeIntegrationResourcesResponse(response)
      // First successful endpoint response wins, even if empty.
      return resources
    }
    catch (error) {
      if (error instanceof LaunchError) {
        if (isNotFoundError(error) || isForbiddenError(error)) {
          continue
        }
        lastError = error
        continue
      }
      throw error
    }
  }

  const stores = await listStorageStores({
    token: params.token,
    teamId: params.teamId,
  })
  const resourcesFromStores = mapStoresToIntegrationResources(
    stores,
    params.integrationConfigurationId,
  )
  if (resourcesFromStores.length > 0) {
    return resourcesFromStores
  }

  if (lastError) {
    throw lastError
  }
  return []
}

function normalizeIntegrationResourcesResponse(input: unknown) {
  if (Array.isArray(input)) {
    return input as VercelIntegrationResource[]
  }
  if (input && typeof input === 'object') {
    const maybeResources = (input as { resources?: unknown }).resources
    if (Array.isArray(maybeResources)) {
      return maybeResources as VercelIntegrationResource[]
    }
  }
  return [] as VercelIntegrationResource[]
}

async function listStorageStores(params: {
  token: string
  teamId?: string
}) {
  const paths = [
    withTeamId('/v1/storage/stores', params.teamId),
    withTeamId('/v1/storage/stores?type=integration', params.teamId),
  ]

  let lastError: LaunchError | undefined
  for (const path of paths) {
    try {
      const response = await vercelRequest<unknown>(params.token, path)
      const stores = normalizeStorageStoresResponse(response)
      return stores
    }
    catch (error) {
      if (error instanceof LaunchError) {
        if (isNotFoundError(error) || isForbiddenError(error)) {
          continue
        }
        lastError = error
        continue
      }
      throw error
    }
  }

  if (lastError) {
    throw lastError
  }
  return [] as VercelStorageStore[]
}

function normalizeStorageStoresResponse(input: unknown) {
  if (Array.isArray(input)) {
    return input as VercelStorageStore[]
  }
  if (input && typeof input === 'object') {
    const stores = (input as { stores?: unknown }).stores
    if (Array.isArray(stores)) {
      return stores as VercelStorageStore[]
    }
  }
  return [] as VercelStorageStore[]
}

function mapStoresToIntegrationResources(
  stores: VercelStorageStore[],
  integrationConfigurationId: string,
) {
  const relevant = stores.filter((store) => {
    const integrationKey
      = store.integrationConfigurationId || store.installationId || store.integrationId
    if (!integrationKey) {
      return false
    }
    return integrationKey === integrationConfigurationId
  })

  const source = relevant.length > 0 ? relevant : stores
  return source.map(store => ({
    id: store.externalResourceId || store.id,
    internalId: store.id,
    externalResourceId: store.externalResourceId,
    name: store.name,
  })) as VercelIntegrationResource[]
}

async function connectIntegrationResourceToProject(params: {
  token: string
  teamId?: string
  projectId: string
  resourceId: string
  integrationConfigurationId: string
}) {
  const installationPath = withTeamId(
    `/v1/integrations/installations/${encodeURIComponent(
      params.integrationConfigurationId,
    )}/resources/${encodeURIComponent(params.resourceId)}/connections`,
    params.teamId,
  )
  try {
    await vercelRequest(params.token, installationPath, {
      method: 'POST',
      body: JSON.stringify({
        projectId: params.projectId,
      }),
    })
    return
  }
  catch (error) {
    if (!(error instanceof LaunchError) || !isNotFoundError(error)) {
      throw error
    }
  }

  const legacyPath = withTeamId(
    `/v1/projects/${encodeURIComponent(params.projectId)}/connect/${encodeURIComponent(
      params.resourceId,
    )}`,
    params.teamId,
  )
  await vercelRequest(params.token, legacyPath, {
    method: 'POST',
    body: JSON.stringify({
      integrationConfigurationId: params.integrationConfigurationId,
    }),
  })
}
