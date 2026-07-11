import { getValidSupabaseSession } from "@/lib/oauth-session";
import { fetchSupabaseOrganizations } from "@/lib/oauth-supabase";

export async function GET() {
  const session = await getValidSupabaseSession();
  if (!session?.accessToken) {
    return Response.json({ organizations: [] });
  }
  const organizations = await fetchSupabaseOrganizations(session.accessToken);
  return Response.json({ organizations });
}
