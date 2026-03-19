import { NextResponse } from 'next/server'
import { getValidSupabaseSession } from '@/lib/oauth-session'
import { fetchSupabaseOrganizations } from '@/lib/oauth-supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getValidSupabaseSession()
  if (!session?.accessToken) {
    return NextResponse.json({ organizations: [] })
  }
  const organizations = await fetchSupabaseOrganizations(session.accessToken)
  return NextResponse.json({ organizations })
}
