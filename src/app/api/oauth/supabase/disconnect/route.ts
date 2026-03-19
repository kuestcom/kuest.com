import { NextResponse } from 'next/server'
import { clearCookie, OAUTH_COOKIE_NAMES } from '@/lib/oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  await clearCookie(OAUTH_COOKIE_NAMES.supabaseSession)
  await clearCookie(OAUTH_COOKIE_NAMES.supabaseState)
  return NextResponse.json({ ok: true })
}
