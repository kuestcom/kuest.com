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

Environment variables are read from the Cloudflare Worker runtime. Browser-safe values are passed from the server to the React islands; secrets remain server-only. The names in `.env.example` are the complete application-facing names and do not require a framework-specific prefix.

## Verification

```sh
pnpm check
pnpm test
pnpm build
pnpm preview
```

`pnpm preview` runs the built application through Cloudflare's local `workerd` runtime.

## Cloudflare deployment

Under **Settings → Variables and Secrets**, add browser-safe configuration as plaintext
variables:

- SITE_URL
- GITHUB_APP_URL
- DEFAULT_VERCEL_TEAM_ID
- DEFAULT_VERCEL_REGION
- DEFAULT_SUPABASE_REGION
- VERCEL_ALLOW_TOKEN_FALLBACK
- KUEST_CHAIN_MODE
- REOWN_APPKIT_PROJECT_ID
- CLOB_URL
- RELAYER_URL
- SUPABASE_URL
- SUPABASE_ANON_KEY
- VERCEL_OAUTH_CLIENT_ID
- VERCEL_TEAM_ID
- SUPABASE_OAUTH_CLIENT_ID
- SUPABASE_OAUTH_SCOPES
- SUPABASE_OAUTH_ORGANIZATION_NAME
- RESEND_FROM_EMAIL
- PROTOCOL_PITCH_DECK_TO_EMAIL
- VERCEL_SUPABASE_REGION
- VERCEL_SUPABASE_PUBLIC_ENV_VAR_PREFIX
- AFFILIATE_DATA_API_URL
- AFFILIATE_RPC_URL
- AFFILIATE_DEPOSIT_WALLET_FACTORY
- AFFILIATE_KUEST_FEE_RECEIVER
- AFFILIATE_CHAIN_ID
- AFFILIATE_CONFIRMATIONS
- AFFILIATE_TOKEN_DECIMALS
- AFFILIATE_START_BLOCK
- AFFILIATE_DRY_RUN
- AFFILIATE_BATCH_LIMIT
- AFFILIATE_MAX_ATTEMPTS
- AFFILIATE_MAX_HISTORY_PAGES
- all `RATE_LIMIT_*` settings

In that same **Settings → Variables and Secrets** section, add sensitive values with type
**Secret**:

- VERCEL_OAUTH_CLIENT_SECRET
- SUPABASE_OAUTH_CLIENT_SECRET
- SUPABASE_SERVICE_ROLE_KEY
- RESEND_API_KEY
- DUB_API_KEY

No application variable needs to be duplicated under Build Variables and Secrets. After changing
a runtime variable, deploy the new Worker configuration. The Worker configuration has
`keep_vars: true`, so Wrangler deployments preserve plaintext variables managed in the dashboard.
Secrets can also be uploaded without committing them:

```sh
pnpm wrangler secret put RESEND_API_KEY
pnpm wrangler secret put VERCEL_OAUTH_CLIENT_SECRET
pnpm wrangler secret put SUPABASE_OAUTH_CLIENT_SECRET
pnpm wrangler secret put SUPABASE_SERVICE_ROLE_KEY
pnpm wrangler secret put DUB_API_KEY
pnpm deploy
```

For Cloudflare Workers Builds, use:

- Root directory: the repository root
- Build command: `pnpm build`
- Deploy command: `pnpm wrangler deploy`

OAuth callback URLs must be configured as `https://<domain>/api/oauth/vercel/callback` and `https://<domain>/api/oauth/supabase/callback`.

## Dub affiliates

The business definition, deployment order, D1 migrations, Cron behavior, reconciliation and
failure recovery are documented in [`docs/dub-affiliates.md`](docs/dub-affiliates.md).
The checked-in production configuration is fail-closed: `AFFILIATE_START_BLOCK=0`,
`AFFILIATE_DRY_RUN=true`, and no Cron Trigger. Follow the documented cutover before enabling it.

## Source layout

- `src/pages/` — Astro pages and live API endpoints
- `src/views/` — shared localized page compositions
- `src/components/` — migrated React UI and MDX blocks
- `content/blog/<locale>/` — localized MDX posts
- `src/i18n/messages/` — existing translated message catalogs
- `public/` — fonts, images, flags, and blog covers
