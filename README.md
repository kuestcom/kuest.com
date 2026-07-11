# Kuest Launch

Open-source launch flow for Kuest white-label prediction markets.

- Landing: `https://kuest.com`
- Launch: `https://kuest.com/launch`
- The Protocol: `https://kuest.com/protocol`
- Demo: `https://demo.kuest.com`

Main goal of this repo:

- Let people review and audit the full launch code
- Keep a guided path for non-developers when needed
- Support OAuth-first auth with token fallback

## Local development

Requires Node 24+ and pnpm.

```sh
pnpm install
cp .env.example .dev.vars
pnpm astro dev --background
```

Use `pnpm astro dev status`, `pnpm astro dev logs`, and `pnpm astro dev stop` to manage the background server.

Environment variables are declared and validated in `astro.config.mjs`. Browser-safe values are imported from `astro:env/client`; server settings and secrets are imported from `astro:env/server`. The names in `.env.example` are the complete application-facing names and do not require a framework-specific prefix.

## Verification

```sh
pnpm check
pnpm build
pnpm preview
```

`pnpm preview` runs the built application through Cloudflare's local `workerd` runtime.

## Cloudflare deployment

1. Under Settings → Build → Variables and Secrets, add browser/public and build-time
   configuration such as:
   - SITE_URL
   - GITHUB_APP_URL
   - REOWN_APPKIT_PROJECT_ID
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - OAuth client IDs
   - rate-limit settings

2. Under Settings → Variables and Secrets, add runtime secrets as type Secret:
   - VERCEL_OAUTH_CLIENT_SECRET
   - SUPABASE_OAUTH_CLIENT_SECRET
   - SUPABASE_SERVICE_ROLE_KEY
   - RESEND_API_KEY

The Worker configuration is in `wrangler.jsonc`. Client settings must be available to the build. Runtime server settings can be added under `vars`, while secrets should be uploaded without committing them:

```sh
pnpm wrangler secret put RESEND_API_KEY
pnpm wrangler secret put VERCEL_OAUTH_CLIENT_SECRET
pnpm wrangler secret put SUPABASE_OAUTH_CLIENT_SECRET
pnpm wrangler secret put SUPABASE_SERVICE_ROLE_KEY
pnpm deploy
```

For Cloudflare Workers Builds, use:

- Root directory: `astro`
- Build command: `pnpm build`
- Deploy command: `pnpm wrangler deploy`

OAuth callback URLs must be configured as `https://<domain>/api/oauth/vercel/callback` and `https://<domain>/api/oauth/supabase/callback`.

## Source layout

- `src/pages/` — Astro pages and live API endpoints
- `src/views/` — shared localized page compositions
- `src/components/` — migrated React UI and MDX blocks
- `content/blog/<locale>/` — localized MDX posts
- `src/i18n/messages/` — existing translated message catalogs
- `public/` — fonts, images, flags, and blog covers
