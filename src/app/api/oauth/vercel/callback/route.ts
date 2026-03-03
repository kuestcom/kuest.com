import { NextResponse } from "next/server";
import { LaunchError } from "@/lib/launch-utils";
import {
  OAUTH_COOKIE_NAMES,
  clearCookie,
  ensureOAuthStateValid,
  setOAuthSession,
} from "@/lib/oauth";
import {
  buildVercelSession,
  exchangeVercelCode,
  fetchVercelUser,
} from "@/lib/oauth-vercel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildRedirectUri(request: Request) {
  const url = new URL(request.url);
  return `${url.origin}/api/oauth/vercel/callback`;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  try {
    const providerError = requestUrl.searchParams.get("error");
    const providerErrorDescription =
      requestUrl.searchParams.get("error_description") ||
      requestUrl.searchParams.get("errorMessage");
    if (providerError) {
      const suffix = providerErrorDescription ? `: ${providerErrorDescription}` : "";
      throw new LaunchError(`Vercel OAuth error (${providerError})${suffix}`, "oauth");
    }

    const code = requestUrl.searchParams.get("code");
    const state = requestUrl.searchParams.get("state");
    if (!code) {
      throw new LaunchError(
        "Missing OAuth code in callback. Confirm callback URL and OAuth app settings.",
        "oauth",
      );
    }

    const savedState = await ensureOAuthStateValid({
      cookieName: OAUTH_COOKIE_NAMES.vercelState,
      state,
    });
    const redirectUri = buildRedirectUri(request);

    const token = await exchangeVercelCode({
      code,
      redirectUri,
      codeVerifier: savedState.codeVerifier,
    });
    const user = await fetchVercelUser(token.access_token);
    const session = buildVercelSession({ token, user });
    await setOAuthSession(OAUTH_COOKIE_NAMES.vercelSession, session);
    await clearCookie(OAUTH_COOKIE_NAMES.vercelState);

    const returnUrl = new URL(savedState.returnTo, requestUrl.origin);
    returnUrl.searchParams.set("oauth", "vercel_connected");
    return NextResponse.redirect(returnUrl);
  } catch (error) {
    await clearCookie(OAUTH_COOKIE_NAMES.vercelState);
    const message = error instanceof Error ? error.message : "OAuth callback failed.";
    return NextResponse.redirect(
      new URL(`/?oauth_error=${encodeURIComponent(message)}`, requestUrl.origin),
    );
  }
}
