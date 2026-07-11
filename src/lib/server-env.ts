import { getSecret } from "astro:env/server";
import { PUBLIC_RUNTIME_DEFAULTS, type PublicRuntimeConfig } from "@/lib/runtime-config";

function readString(name: string, fallback = "") {
  return getSecret(name)?.trim() || fallback;
}

function readBoolean(name: string, fallback: boolean) {
  const value = getSecret(name)?.trim().toLowerCase();
  if (!value) {
    return fallback;
  }
  if (["1", "true", "yes", "on"].includes(value)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(value)) {
    return false;
  }
  throw new Error(`${name} must be true or false.`);
}

function readPositiveInteger(name: string, fallback: number) {
  const value = getSecret(name)?.trim();
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

function readUrl(name: string, fallback = "") {
  const value = readString(name, fallback);
  if (!value) {
    return "";
  }
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${name} must use http or https.`);
  }
  return value;
}

export function getPublicRuntimeConfig(): PublicRuntimeConfig {
  const chainMode = readString("KUEST_CHAIN_MODE", PUBLIC_RUNTIME_DEFAULTS.KUEST_CHAIN_MODE);
  if (chainMode !== "amoy" && chainMode !== "polygon") {
    throw new Error("KUEST_CHAIN_MODE must be amoy or polygon.");
  }

  return {
    SITE_URL: readUrl("SITE_URL", PUBLIC_RUNTIME_DEFAULTS.SITE_URL),
    GITHUB_APP_URL: readUrl("GITHUB_APP_URL", PUBLIC_RUNTIME_DEFAULTS.GITHUB_APP_URL),
    DEFAULT_VERCEL_TEAM_ID: readString(
      "DEFAULT_VERCEL_TEAM_ID",
      PUBLIC_RUNTIME_DEFAULTS.DEFAULT_VERCEL_TEAM_ID,
    ),
    DEFAULT_SUPABASE_REGION: readString(
      "DEFAULT_SUPABASE_REGION",
      PUBLIC_RUNTIME_DEFAULTS.DEFAULT_SUPABASE_REGION,
    ),
    VERCEL_ALLOW_TOKEN_FALLBACK: readBoolean(
      "VERCEL_ALLOW_TOKEN_FALLBACK",
      PUBLIC_RUNTIME_DEFAULTS.VERCEL_ALLOW_TOKEN_FALLBACK,
    ),
    KUEST_CHAIN_MODE: chainMode,
    REOWN_APPKIT_PROJECT_ID: readString("REOWN_APPKIT_PROJECT_ID"),
    CLOB_URL: readUrl("CLOB_URL", PUBLIC_RUNTIME_DEFAULTS.CLOB_URL),
    RELAYER_URL: readUrl("RELAYER_URL", PUBLIC_RUNTIME_DEFAULTS.RELAYER_URL),
    SUPABASE_URL: readUrl("SUPABASE_URL"),
    SUPABASE_ANON_KEY: readString("SUPABASE_ANON_KEY"),
  };
}

export function getServerRuntimeConfig() {
  return {
    ...getPublicRuntimeConfig(),
    SUPABASE_SERVICE_ROLE_KEY: readString("SUPABASE_SERVICE_ROLE_KEY"),
    VERCEL_OAUTH_CLIENT_ID: readString("VERCEL_OAUTH_CLIENT_ID"),
    VERCEL_OAUTH_CLIENT_SECRET: readString("VERCEL_OAUTH_CLIENT_SECRET"),
    VERCEL_TEAM_ID: readString("VERCEL_TEAM_ID"),
    SUPABASE_OAUTH_CLIENT_ID: readString("SUPABASE_OAUTH_CLIENT_ID"),
    SUPABASE_OAUTH_CLIENT_SECRET: readString("SUPABASE_OAUTH_CLIENT_SECRET"),
    SUPABASE_OAUTH_SCOPES: readString("SUPABASE_OAUTH_SCOPES", "openid offline_access"),
    SUPABASE_OAUTH_ORGANIZATION_NAME: readString("SUPABASE_OAUTH_ORGANIZATION_NAME"),
    RESEND_API_KEY: readString("RESEND_API_KEY"),
    RESEND_FROM_EMAIL: readString("RESEND_FROM_EMAIL", "Kuest <hello@kuest.com>"),
    PROTOCOL_PITCH_DECK_TO_EMAIL: readString("PROTOCOL_PITCH_DECK_TO_EMAIL", "hello@kuest.com"),
    VERCEL_SUPABASE_REGION: readString("VERCEL_SUPABASE_REGION"),
    VERCEL_SUPABASE_PUBLIC_ENV_VAR_PREFIX: readString(
      "VERCEL_SUPABASE_PUBLIC_ENV_VAR_PREFIX",
      "NEXT_PUBLIC_",
    ),
    RATE_LIMIT_WINDOW_MS: readPositiveInteger("RATE_LIMIT_WINDOW_MS", 600_000),
    RATE_LIMIT_LAUNCH_MAX: readPositiveInteger("RATE_LIMIT_LAUNCH_MAX", 30),
    RATE_LIMIT_SUPABASE_RESOURCES_MAX: readPositiveInteger(
      "RATE_LIMIT_SUPABASE_RESOURCES_MAX",
      240,
    ),
    RATE_LIMIT_DOMAIN_MAX: readPositiveInteger("RATE_LIMIT_DOMAIN_MAX", 90),
    RATE_LIMIT_DOMAIN_REGISTER_MAX: readPositiveInteger("RATE_LIMIT_DOMAIN_REGISTER_MAX", 600),
    RATE_LIMIT_PROTOCOL_DECK_MAX: readPositiveInteger("RATE_LIMIT_PROTOCOL_DECK_MAX", 12),
    RATE_LIMIT_REOWN_CONNECTION_MAX: readPositiveInteger("RATE_LIMIT_REOWN_CONNECTION_MAX", 240),
    RATE_LIMIT_VERCEL_CONNECTION_MAX: readPositiveInteger("RATE_LIMIT_VERCEL_CONNECTION_MAX", 240),
  };
}

export type ServerRuntimeConfig = ReturnType<typeof getServerRuntimeConfig>;
