import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  adapter: cloudflare(),
  integrations: [react(), mdx()],
  env: {
    schema: {
      SITE_URL: envField.string({ context: 'client', access: 'public', default: 'https://kuest.com', url: true }),
      GITHUB_APP_URL: envField.string({ context: 'client', access: 'public', default: 'https://github-app.kuest.com', url: true }),
      DEFAULT_VERCEL_TEAM_ID: envField.string({ context: 'client', access: 'public', default: '' }),
      DEFAULT_SUPABASE_REGION: envField.string({ context: 'client', access: 'public', default: 'us-east-1' }),
      VERCEL_ALLOW_TOKEN_FALLBACK: envField.boolean({ context: 'client', access: 'public', default: true }),
      KUEST_CHAIN_MODE: envField.enum({ context: 'client', access: 'public', values: ['amoy', 'polygon'], default: 'amoy' }),
      REOWN_APPKIT_PROJECT_ID: envField.string({ context: 'client', access: 'public', default: '' }),
      CLOB_URL: envField.string({ context: 'client', access: 'public', default: 'https://clob.kuest.com', url: true }),
      RELAYER_URL: envField.string({ context: 'client', access: 'public', default: 'https://relayer.kuest.com', url: true }),
      SUPABASE_URL: envField.string({ context: 'client', access: 'public', optional: true, url: true }),
      SUPABASE_ANON_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      VERCEL_OAUTH_CLIENT_ID: envField.string({ context: 'server', access: 'public', optional: true }),
      VERCEL_OAUTH_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      VERCEL_TEAM_ID: envField.string({ context: 'server', access: 'public', optional: true }),
      SUPABASE_OAUTH_CLIENT_ID: envField.string({ context: 'server', access: 'public', optional: true }),
      SUPABASE_OAUTH_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      SUPABASE_OAUTH_SCOPES: envField.string({ context: 'server', access: 'public', default: 'openid offline_access' }),
      SUPABASE_OAUTH_ORGANIZATION_NAME: envField.string({ context: 'server', access: 'public', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_FROM_EMAIL: envField.string({ context: 'server', access: 'public', default: 'Kuest <hello@kuest.com>' }),
      PROTOCOL_PITCH_DECK_TO_EMAIL: envField.string({ context: 'server', access: 'public', default: 'hello@kuest.com' }),
      VERCEL_SUPABASE_REGION: envField.string({ context: 'server', access: 'public', optional: true }),
      VERCEL_SUPABASE_ENV_VAR_PREFIX: envField.string({ context: 'server', access: 'public', default: 'PUBLIC_' }),
      RATE_LIMIT_WINDOW_MS: envField.number({ context: 'server', access: 'public', default: 600000, int: true, min: 1 }),
      RATE_LIMIT_LAUNCH_MAX: envField.number({ context: 'server', access: 'public', default: 30, int: true, min: 1 }),
      RATE_LIMIT_SUPABASE_RESOURCES_MAX: envField.number({ context: 'server', access: 'public', default: 240, int: true, min: 1 }),
      RATE_LIMIT_DOMAIN_MAX: envField.number({ context: 'server', access: 'public', default: 90, int: true, min: 1 }),
      RATE_LIMIT_DOMAIN_REGISTER_MAX: envField.number({ context: 'server', access: 'public', default: 600, int: true, min: 1 }),
      RATE_LIMIT_PROTOCOL_DECK_MAX: envField.number({ context: 'server', access: 'public', default: 12, int: true, min: 1 }),
      RATE_LIMIT_REOWN_CONNECTION_MAX: envField.number({ context: 'server', access: 'public', default: 240, int: true, min: 1 }),
      RATE_LIMIT_VERCEL_CONNECTION_MAX: envField.number({ context: 'server', access: 'public', default: 240, int: true, min: 1 }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
