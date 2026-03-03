import { NextResponse } from "next/server";
import type { OAuthStatusResponse } from "@/lib/launch-types";
import { getValidSupabaseSession, getValidVercelSession } from "@/lib/oauth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toProviderState(
  session: Awaited<ReturnType<typeof getValidVercelSession>>,
) {
  if (session) {
    return {
      connected: true,
      email: session.user?.email,
      login: session.user?.login,
      name: session.user?.name,
    };
  }
  return { connected: false };
}

export async function GET() {
  const [vercel, supabase] = await Promise.all([
    getValidVercelSession(),
    getValidSupabaseSession(),
  ]);

  const response: OAuthStatusResponse = {
    vercel: toProviderState(vercel),
    supabase: toProviderState(supabase),
  };

  return NextResponse.json(response);
}
