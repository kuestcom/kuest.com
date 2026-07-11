import { clearCookie, OAUTH_COOKIE_NAMES } from '@/lib/oauth'

export async function POST() {
  await clearCookie(OAUTH_COOKIE_NAMES.vercelSession)
  await clearCookie(OAUTH_COOKIE_NAMES.vercelState)
  return Response.json({ ok: true })
}
