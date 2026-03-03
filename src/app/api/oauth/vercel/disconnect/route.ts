import { NextResponse } from "next/server";
import { OAUTH_COOKIE_NAMES, clearCookie } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearCookie(OAUTH_COOKIE_NAMES.vercelSession);
  await clearCookie(OAUTH_COOKIE_NAMES.vercelState);
  return NextResponse.json({ ok: true });
}

