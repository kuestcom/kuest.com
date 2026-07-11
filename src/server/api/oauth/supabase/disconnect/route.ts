import { clearCookie, OAUTH_COOKIE_NAMES } from '@/lib/oauth'

export async function POST() {
  await clearCookie(OAUTH_COOKIE_NAMES.supabaseSession)
  await clearCookie(OAUTH_COOKIE_NAMES.supabaseState)
  return Response.json({ ok: true })
}
