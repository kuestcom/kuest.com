export interface PublicRuntimeConfig {
  SITE_URL: string;
  GITHUB_APP_URL: string;
  DEFAULT_VERCEL_TEAM_ID: string;
  DEFAULT_SUPABASE_REGION: string;
  VERCEL_ALLOW_TOKEN_FALLBACK: boolean;
  KUEST_CHAIN_MODE: "amoy" | "polygon";
  REOWN_APPKIT_PROJECT_ID: string;
  CLOB_URL: string;
  RELAYER_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export const PUBLIC_RUNTIME_DEFAULTS: PublicRuntimeConfig = {
  SITE_URL: "https://kuest.com",
  GITHUB_APP_URL: "https://github-app.kuest.com",
  DEFAULT_VERCEL_TEAM_ID: "",
  DEFAULT_SUPABASE_REGION: "us-east-1",
  VERCEL_ALLOW_TOKEN_FALLBACK: true,
  KUEST_CHAIN_MODE: "amoy",
  REOWN_APPKIT_PROJECT_ID: "",
  CLOB_URL: "https://clob.kuest.com",
  RELAYER_URL: "https://relayer.kuest.com",
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
};
