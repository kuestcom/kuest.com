import { LaunchError } from "@/lib/launch-utils";
import type { OAuthSession, OAuthUser } from "@/lib/oauth";
import { secondsToExpiresAt } from "@/lib/oauth";

const VERCEL_AUTHORIZE_URL = "https://vercel.com/oauth/authorize";
const VERCEL_TOKEN_URL = "https://api.vercel.com/login/oauth/token";
const VERCEL_USERINFO_URL = "https://api.vercel.com/login/oauth/userinfo";

interface VercelTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number | string;
}

interface VercelUserInfoResponse {
  email?: string;
  preferred_username?: string;
  name?: string;
}

interface VercelTeamResponse {
  teams?: Array<{
    id: string;
    slug?: string;
    name: string;
  }>;
}

function ensureVercelOAuthEnv() {
  const clientId = process.env.VERCEL_OAUTH_CLIENT_ID ?? "";
  const clientSecret = process.env.VERCEL_OAUTH_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) {
    throw new LaunchError(
      "Missing VERCEL_OAUTH_CLIENT_ID or VERCEL_OAUTH_CLIENT_SECRET.",
      "oauth",
    );
  }
  return { clientId, clientSecret };
}

async function parseJsonResponse<T>(response: Response, step: string) {
  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      payload = await response.text();
    }
    throw new LaunchError(
      `Vercel OAuth request failed (${response.status}).`,
      step,
      payload,
    );
  }
  return (await response.json()) as T;
}

export function buildVercelAuthorizeUrl(params: {
  redirectUri: string;
  state: string;
  codeChallenge: string;
}) {
  const { clientId } = ensureVercelOAuthEnv();
  const query = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: params.redirectUri,
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: "S256",
  });
  return `${VERCEL_AUTHORIZE_URL}?${query.toString()}`;
}

export async function exchangeVercelCode(params: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}) {
  const { clientId, clientSecret } = ensureVercelOAuthEnv();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
  });

  const response = await fetch(VERCEL_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const token = await parseJsonResponse<VercelTokenResponse>(response, "oauth");
  if (!token.access_token) {
    throw new LaunchError("Vercel OAuth response missing access token.", "oauth", token);
  }
  return token;
}

export async function refreshVercelAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = ensureVercelOAuthEnv();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const response = await fetch(VERCEL_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  return await parseJsonResponse<VercelTokenResponse>(response, "oauth");
}

export async function fetchVercelUser(accessToken: string): Promise<OAuthUser> {
  const response = await fetch(VERCEL_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  const user = await parseJsonResponse<VercelUserInfoResponse>(response, "oauth");
  return {
    email: user.email,
    login: user.preferred_username,
    name: user.name,
  };
}

export async function fetchVercelTeams(accessToken: string) {
  const response = await fetch("https://api.vercel.com/v2/teams", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  const data = await parseJsonResponse<VercelTeamResponse>(response, "vercel");
  return (data.teams ?? []).map((team) => ({
    id: team.id,
    slug: team.slug,
    name: team.name,
  }));
}

export function buildVercelSession(params: {
  token: VercelTokenResponse;
  user?: OAuthUser;
}): OAuthSession {
  return {
    accessToken: params.token.access_token,
    refreshToken: params.token.refresh_token,
    expiresAt: secondsToExpiresAt(params.token.expires_in),
    user: params.user,
  };
}
