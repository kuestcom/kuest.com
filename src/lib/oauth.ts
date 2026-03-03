import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { LaunchError } from "@/lib/launch-utils";

export interface OAuthUser {
  email?: string;
  login?: string;
  name?: string;
}

export interface OAuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: OAuthUser;
}

export interface OAuthTempState {
  state: string;
  codeVerifier: string;
  returnTo: string;
  createdAt: number;
}

export const OAUTH_COOKIE_NAMES = {
  vercelSession: "launchpad_vercel_session",
  supabaseSession: "launchpad_supabase_session",
  vercelState: "launchpad_vercel_state",
  supabaseState: "launchpad_supabase_state",
} as const;

const TEN_MINUTES = 60 * 10;
const THIRTY_DAYS = 60 * 60 * 24 * 30;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax" as const,
  path: "/",
};

function base64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function parseBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = pad ? normalized + "=".repeat(4 - pad) : normalized;
  return Buffer.from(padded, "base64");
}

function encodeJsonCookie(value: unknown) {
  return base64Url(Buffer.from(JSON.stringify(value), "utf8"));
}

function decodeJsonCookie<T>(value?: string): T | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(parseBase64Url(value).toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function randomStateToken() {
  return base64Url(randomBytes(24));
}

export function createPkcePair() {
  const verifier = base64Url(randomBytes(48));
  const challenge = base64Url(createHash("sha256").update(verifier).digest());
  return {
    verifier,
    challenge,
  };
}

export async function setTemporaryOAuthState(
  cookieName: string,
  state: OAuthTempState,
) {
  const store = await cookies();
  store.set(cookieName, encodeJsonCookie(state), {
    ...COOKIE_OPTIONS,
    maxAge: TEN_MINUTES,
  });
}

export async function readTemporaryOAuthState(cookieName: string) {
  const store = await cookies();
  return decodeJsonCookie<OAuthTempState>(store.get(cookieName)?.value);
}

export async function clearCookie(cookieName: string) {
  const store = await cookies();
  store.set(cookieName, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export async function setOAuthSession(cookieName: string, session: OAuthSession) {
  const store = await cookies();
  store.set(cookieName, encodeJsonCookie(session), {
    ...COOKIE_OPTIONS,
    maxAge: THIRTY_DAYS,
  });
}

export async function readOAuthSession(cookieName: string) {
  const store = await cookies();
  return decodeJsonCookie<OAuthSession>(store.get(cookieName)?.value);
}

export async function ensureOAuthStateValid(params: {
  cookieName: string;
  state?: string | null;
}) {
  const saved = await readTemporaryOAuthState(params.cookieName);
  if (!saved) {
    throw new LaunchError("OAuth state cookie missing or expired.", "oauth");
  }
  if (!params.state || params.state !== saved.state) {
    throw new LaunchError("OAuth state mismatch.", "oauth");
  }
  return saved;
}

export function secondsToExpiresAt(expiresIn?: number | string) {
  const seconds =
    typeof expiresIn === "number"
      ? expiresIn
      : typeof expiresIn === "string"
        ? Number(expiresIn)
        : undefined;
  if (!seconds || Number.isNaN(seconds)) {
    return undefined;
  }
  return Date.now() + seconds * 1000;
}

export function basicAuthHeader(clientId: string, clientSecret: string) {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}
