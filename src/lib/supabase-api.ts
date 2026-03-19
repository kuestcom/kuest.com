import type { SupabaseProvisionResult } from '@/lib/launch-types'
import { generateSecureToken, LaunchError } from '@/lib/launch-utils'

const SUPABASE_API_BASE = 'https://api.supabase.com/v1'

interface SupabaseProject {
  id: string
  name: string
  region?: string
  status?: string
}

interface SupabaseApiKey {
  name: string
  api_key: string
}

async function supabaseRequest<T>(
  token: string,
  path: string,
  init: RequestInit = {},
) {
  const response = await fetch(`${SUPABASE_API_BASE}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    let payload: unknown
    try {
      payload = await response.json()
    }
    catch {
      payload = await response.text()
    }
    throw new LaunchError(
      `Supabase API request failed (${response.status}) at ${path}.`,
      'supabase',
      payload,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function provisionSupabaseProject(params: {
  token: string
  organizationId: string
  projectName: string
  region: string
  databasePassword?: string
  log: (_step: string, _message: string) => void
}): Promise<SupabaseProvisionResult> {
  const dbPassword = params.databasePassword ?? generateSecureToken(20)

  params.log('supabase', 'Creating Supabase project...')

  const created = await supabaseRequest<SupabaseProject>(params.token, '/projects', {
    method: 'POST',
    body: JSON.stringify({
      organization_id: params.organizationId,
      name: params.projectName,
      region: params.region,
      db_pass: dbPassword,
    }),
  })

  const projectRef = created.id
  if (!projectRef) {
    throw new LaunchError(
      'Supabase project creation response did not include project id.',
      'supabase',
      created,
    )
  }

  params.log('supabase', `Project created: ${projectRef}. Waiting until healthy...`)
  const projectStatus = await waitForProjectHealthy(
    params.token,
    projectRef,
    params.log,
  )

  params.log('supabase', 'Fetching service role key...')
  const keys = await supabaseRequest<SupabaseApiKey[]>(
    params.token,
    `/projects/${projectRef}/api-keys`,
  )
  const serviceRole = keys.find(key => key.name === 'service_role')
  if (!serviceRole?.api_key) {
    throw new LaunchError(
      'Could not find service_role API key in Supabase project.',
      'supabase',
      keys,
    )
  }

  const supabaseUrl = `https://${projectRef}.supabase.co`
  const postgresUrl = `postgresql://postgres:${encodeURIComponent(
    dbPassword,
  )}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`

  return {
    projectRef,
    projectName: created.name ?? params.projectName,
    projectStatus,
    dashboardUrl: `https://supabase.com/dashboard/project/${projectRef}`,
    postgresUrl,
    supabaseUrl,
    serviceRoleKey: serviceRole.api_key,
  }
}

async function waitForProjectHealthy(
  token: string,
  projectRef: string,
  log: (_step: string, _message: string) => void,
) {
  const deadline = Date.now() + 8 * 60 * 1000
  let lastStatus = 'UNKNOWN'

  while (Date.now() < deadline) {
    const project = await supabaseRequest<SupabaseProject>(
      token,
      `/projects/${projectRef}`,
    )
    lastStatus = project.status ?? 'UNKNOWN'
    log('supabase', `Current status: ${lastStatus}`)

    if (lastStatus.toUpperCase().includes('HEALTHY')) {
      return lastStatus
    }

    await new Promise(resolve => setTimeout(resolve, 7000))
  }

  throw new LaunchError(
    `Supabase project did not become healthy in time. Last status: ${lastStatus}`,
    'supabase',
  )
}
