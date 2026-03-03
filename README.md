# Kuest Launch

Open-source launch flow for Kuest white-label prediction markets.

Public demo domain: `https://launch.kuest.com`

Main goal of this repo:

- Let people review and audit the full launch code
- Keep a guided path for non-developers when needed
- Support OAuth-first auth with token fallback

## User flow

1. Set market site name and connect wallet
2. Connect Vercel + set Reown project id + choose/create Supabase database
3. Deploy and track timeline logs

## Vercel auth modes

- `OAuth` is the default UX
- `Access Token` is available as fallback

Configure in `.env.local`:

- `NEXT_PUBLIC_VERCEL_AUTH_MODE=oauth` or `token`
- `NEXT_PUBLIC_VERCEL_ALLOW_TOKEN_FALLBACK=true|false`

If OAuth is enabled, set:

- `VERCEL_OAUTH_CLIENT_ID`
- `VERCEL_OAUTH_CLIENT_SECRET`

## Local setup

1. Copy `.env.example` to `.env.local`
2. Fill `NEXT_PUBLIC_REOWN_APPKIT_PROJECT_ID`
3. If using OAuth mode, fill Vercel OAuth client id/secret
4. Run:

```bash
npm install
npm run dev
```

Local URL: `http://localhost:3000`

## Production notes

- Set `NEXT_PUBLIC_APP_URL` to your deployed domain (for example `https://launch.kuest.com`)
- OAuth callbacks are generated from request origin:
  - `/api/oauth/vercel/callback`
  - `/api/oauth/supabase/callback`
- For Vercel project/deploy automation, Access Token mode is the stable path until broader OAuth API permissions are available

## What the API launch does

- Validates Supabase integration availability in Vercel
- Reuses existing Vercel project when slug already exists
- Imports repository/branch into Vercel
- Attaches existing Supabase or creates a new one via Vercel integration
- Sets environment variables and triggers deployment
- Returns deployment URL and timeline logs

## Main route

- `POST /api/launch`
