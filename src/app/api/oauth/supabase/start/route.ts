import { NextResponse } from "next/server";
import {
  OAUTH_COOKIE_NAMES,
  createPkcePair,
  randomStateToken,
  setTemporaryOAuthState,
} from "@/lib/oauth";
import { buildSupabaseAuthorizeUrl } from "@/lib/oauth-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildRedirectUri(request: Request) {
  const url = new URL(request.url);
  return `${url.origin}/api/oauth/supabase/callback`;
}

function safeReturnTo(input: string | null) {
  if (!input || !input.startsWith("/") || input.startsWith("//")) {
    return "/launch";
  }
  return input;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  try {
    const returnTo = safeReturnTo(requestUrl.searchParams.get("return_to"));
    const state = randomStateToken();
    const pkce = createPkcePair();
    const redirectUri = buildRedirectUri(request);

    await setTemporaryOAuthState(OAUTH_COOKIE_NAMES.supabaseState, {
      state,
      codeVerifier: pkce.verifier,
      returnTo,
      createdAt: Date.now(),
    });

    const authorizeUrl = buildSupabaseAuthorizeUrl({
      redirectUri,
      state,
      codeChallenge: pkce.challenge,
    });

    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth start failed.";
    return NextResponse.redirect(
      new URL(`/launch?oauth_error=${encodeURIComponent(message)}`, requestUrl.origin),
    );
  }
}
