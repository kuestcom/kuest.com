import { NextResponse } from 'next/server'
import { getValidVercelSession } from '@/lib/oauth-session'
import { fetchVercelTeams } from '@/lib/oauth-vercel'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getValidVercelSession()
  if (!session?.accessToken) {
    return NextResponse.json({ teams: [] })
  }
  const teams = await fetchVercelTeams(session.accessToken)
  return NextResponse.json({ teams })
}
