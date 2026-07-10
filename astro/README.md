# Kuest.com — Astro + Cloudflare

This is the Astro migration of the Kuest marketing site and launchpad. It includes 11 locales, 143 localized MDX posts, the launch wizard, OAuth callbacks, deployment APIs, sitemap/robots metadata, and a Cloudflare Workers deployment.

## Local development

Requires Node 24+ and pnpm.

```sh
pnpm install
cp .env.example .dev.vars
pnpm astro dev --background
```

Use `pnpm astro dev status`, `pnpm astro dev logs`, and `pnpm astro dev stop` to manage the background server.

## Verification

```sh
pnpm check
pnpm build
pnpm preview
```

`pnpm preview` runs the built application through Cloudflare's local `workerd` runtime.

## Cloudflare deployment

The Worker configuration is in `wrangler.jsonc`. Public settings can be added under `vars`; secrets should be uploaded without committing them:

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
