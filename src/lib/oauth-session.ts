import {
  clearCookie,
  OAUTH_COOKIE_NAMES,
  readOAuthSession,
  setOAuthSession,
} from '@/lib/oauth'
import { refreshSupabaseAccessToken } from '@/lib/oauth-supabase'
import { refreshVercelAccessToken } from '@/lib/oauth-vercel'

function isExpired(expiresAt?: number) {
  if (!expiresAt) {
    return false
  }
  return Date.now() >= expiresAt - 45_000
}

export async function getValidVercelSession() {
  const session = await readOAuthSession(OAUTH_COOKIE_NAMES.vercelSession)
  if (!session?.accessToken) {
    return null
  }
  if (!isExpired(session.expiresAt)) {
    return session
  }
  if (!session.refreshToken) {
    return session
  }

  try {
    const refreshed = await refreshVercelAccessToken(session.refreshToken)
    const nextSession = {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? session.refreshToken,
      expiresAt: refreshed.expires_in
        ? Date.now() + Number(refreshed.expires_in) * 1000
        : session.expiresAt,
      user: session.user,
    }
    await setOAuthSession(OAUTH_COOKIE_NAMES.vercelSession, nextSession)
    return nextSession
  }
  catch {
    await clearCookie(OAUTH_COOKIE_NAMES.vercelSession)
    return null
  }
}

export async function getValidSupabaseSession() {
  const session = await readOAuthSession(OAUTH_COOKIE_NAMES.supabaseSession)
  if (!session?.accessToken) {
    return null
  }
  if (!isExpired(session.expiresAt)) {
    return session
  }
  if (!session.refreshToken) {
    return session
  }

  try {
    const refreshed = await refreshSupabaseAccessToken(session.refreshToken)
    const nextSession = {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? session.refreshToken,
      expiresAt: refreshed.expires_in
        ? Date.now() + Number(refreshed.expires_in) * 1000
        : session.expiresAt,
      user: session.user,
    }
    await setOAuthSession(OAUTH_COOKIE_NAMES.supabaseSession, nextSession)
    return nextSession
  }
  catch {
    await clearCookie(OAUTH_COOKIE_NAMES.supabaseSession)
    return null
  }
}
