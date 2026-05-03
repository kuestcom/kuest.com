import { createClient } from '@supabase/supabase-js'
import { normalizeSiteUrl } from '@/lib/site-url'

const KEY_EMAILS_TABLE = 'key_emails'
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1'])
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export interface DomainRegistrationInput {
  url: string
  apiKey?: string | null
}

export interface DomainRegistrationResult {
  url: string
  hostname: string
  ignored: boolean
}

function normalizeOptionalString(value: string | null | undefined) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return normalized || undefined
}

function normalizeApiKey(value: string | null | undefined) {
  const normalized = normalizeOptionalString(value)
  return normalized && UUID_PATTERN.test(normalized) ? normalized : undefined
}

function isLocalHostname(hostname: string) {
  const normalized = hostname.toLowerCase()
  return LOCAL_HOSTNAMES.has(normalized)
    || normalized.endsWith('.localhost')
    || normalized.endsWith('.local')
}

function normalizeRegisteredUrl(input: string) {
  const normalized = normalizeSiteUrl(input)
  if (!normalized) {
    return null
  }

  try {
    const parsed = new URL(normalized)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    if (isLocalHostname(parsed.hostname)) {
      return null
    }

    return {
      url: parsed.origin,
      hostname: parsed.hostname.toLowerCase(),
    }
  }
  catch {
    return null
  }
}

function createDomainRegisterClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase domain registry environment variables are missing.')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function registerDomainSnapshot(input: DomainRegistrationInput): Promise<DomainRegistrationResult> {
  const normalized = normalizeRegisteredUrl(input.url)
  if (!normalized) {
    return {
      url: '',
      hostname: '',
      ignored: true,
    }
  }

  const supabase = createDomainRegisterClient()
  const now = new Date().toISOString()
  const apiKey = normalizeApiKey(input.apiKey)
  const row: Record<string, unknown> = {
    site_url: normalized.url,
    updated_at: now,
  }

  if (apiKey) {
    const { data, error } = await supabase
      .from(KEY_EMAILS_TABLE)
      .update(row)
      .eq('api_key', apiKey)
      .select('id')
      .limit(1)

    if (error) {
      throw new Error(error.message)
    }

    if (Array.isArray(data) && data.length > 0) {
      return {
        ...normalized,
        ignored: false,
      }
    }

    row.api_key = apiKey
  }

  const { error } = await supabase
    .from(KEY_EMAILS_TABLE)
    .upsert(row, { onConflict: 'site_url' })

  if (error) {
    throw new Error(error.message)
  }

  return {
    ...normalized,
    ignored: false,
  }
}
