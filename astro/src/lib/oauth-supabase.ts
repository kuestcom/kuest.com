import type { OAuthSession, OAuthUser } from '@/lib/oauth'
import { LaunchError } from '@/lib/launch-utils'
import { basicAuthHeader, secondsToExpiresAt } from '@/lib/oauth'

const SUPABASE_AUTHORIZE_URL = 'https://api.supabase.com/v1/oauth/authorize'
const SUPABASE_TOKEN_URL = 'https://api.supabase.com/v1/oauth/token'
const SUPABASE_USERINFO_URL = 'https://api.supabase.com/v1/oauth/userinfo'

interface SupabaseTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number | string
}

interface SupabaseUserInfoResponse {
  email?: string
  preferred_username?: string
  name?: string
}

interface SupabaseOrg {
  id: string
  name: string
  slug?: string
}

function ensureSupabaseOAuthEnv() {
  const clientId = process.env.SUPABASE_OAUTH_CLIENT_ID ?? ''
  const clientSecret = process.env.SUPABASE_OAUTH_CLIENT_SECRET ?? ''
  if (!clientId || !clientSecret) {
    throw new LaunchError(
      'Missing SUPABASE_OAUTH_CLIENT_ID or SUPABASE_OAUTH_CLIENT_SECRET.',
      'oauth',
    )
  }
  return { clientId, clientSecret }
}

function parseSupabaseScopes() {
  return process.env.SUPABASE_OAUTH_SCOPES?.trim() || 'openid offline_access'
}

async function parseJsonResponse<T>(response: Response, step: string) {
  if (!response.ok) {
    let payload: unknown
    try {
      payload = await response.json()
    }
    catch {
      payload = await response.text()
    }
    throw new LaunchError(
      `Supabase OAuth request failed (${response.status}).`,
      step,
      payload,
    )
  }
  return (await response.json()) as T
}

export function buildSupabaseAuthorizeUrl(params: {
  redirectUri: string
  state: string
  codeChallenge: string
}) {
  const { clientId } = ensureSupabaseOAuthEnv()
  const query = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: params.redirectUri,
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
    scope: parseSupabaseScopes(),
  })
  const org = process.env.SUPABASE_OAUTH_ORGANIZATION_NAME?.trim()
  if (org) {
    query.set('organization_name', org)
  }
  return `${SUPABASE_AUTHORIZE_URL}?${query.toString()}`
}

export async function exchangeSupabaseCode(params: {
  code: string
  redirectUri: string
  codeVerifier: string
}) {
  const { clientId, clientSecret } = ensureSupabaseOAuthEnv()
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
  })

  const response = await fetch(SUPABASE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': basicAuthHeader(clientId, clientSecret),
    },
    body,
    cache: 'no-store',
  })

  const token = await parseJsonResponse<SupabaseTokenResponse>(response, 'oauth')
  if (!token.access_token) {
    throw new LaunchError('Supabase OAuth response missing access token.', 'oauth', token)
  }
  return token
}

export async function refreshSupabaseAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = ensureSupabaseOAuthEnv()
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: refreshToken,
  })

  const response = await fetch(SUPABASE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': basicAuthHeader(clientId, clientSecret),
    },
    body,
    cache: 'no-store',
  })

  return await parseJsonResponse<SupabaseTokenResponse>(response, 'oauth')
}

export async function fetchSupabaseUser(accessToken: string): Promise<OAuthUser> {
  const response = await fetch(SUPABASE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })
  const user = await parseJsonResponse<SupabaseUserInfoResponse>(response, 'oauth')
  return {
    email: user.email,
    login: user.preferred_username,
    name: user.name,
  }
}

export async function fetchSupabaseOrganizations(accessToken: string) {
  const response = await fetch('https://api.supabase.com/v1/organizations', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })
  const orgs = await parseJsonResponse<SupabaseOrg[]>(response, 'supabase')
  return orgs.map(org => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
  }))
}

export function buildSupabaseSession(params: {
  token: SupabaseTokenResponse
  user?: OAuthUser
}): OAuthSession {
  return {
    accessToken: params.token.access_token,
    refreshToken: params.token.refresh_token,
    expiresAt: secondsToExpiresAt(params.token.expires_in),
    user: params.user,
  }
}
