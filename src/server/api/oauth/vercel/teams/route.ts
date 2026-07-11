import { getValidVercelSession } from '@/lib/oauth-session'
import { fetchVercelTeams } from '@/lib/oauth-vercel'

export async function GET() {
  const session = await getValidVercelSession()
  if (!session?.accessToken) {
    return Response.json({ teams: [] })
  }
  const teams = await fetchVercelTeams(session.accessToken)
  return Response.json({ teams })
}
