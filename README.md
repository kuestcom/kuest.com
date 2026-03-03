# Kuest Launchpad

Three-step guided flow for fork owners:

1. Connect wallet and sign to generate `KUEST_*`
2. Connect Vercel OAuth (default) or use Access Token fallback, then select Supabase database
3. Launch and follow timeline until success

## Vercel auth mode

`launch` now supports both:

- `OAuth` as default (recommended UX for end users)
- `Access Token` as fallback

Control it in `.env.local`:

- `NEXT_PUBLIC_VERCEL_AUTH_MODE=oauth` (default) or `token`
- `NEXT_PUBLIC_VERCEL_ALLOW_TOKEN_FALLBACK=true|false`

If you use OAuth mode, also set:

- `VERCEL_OAUTH_CLIENT_ID`
- `VERCEL_OAUTH_CLIENT_SECRET`

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill `NEXT_PUBLIC_REOWN_APPKIT_PROJECT_ID` in `.env.local`
3. If OAuth mode is enabled, fill `VERCEL_OAUTH_CLIENT_ID` and `VERCEL_OAUTH_CLIENT_SECRET`
4. Run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## What launch does

- Validates Supabase integration in Vercel
- Reuses project when slug already exists
- Imports configured repo to Vercel
- Connects existing Supabase or creates new database
- Sets env vars and triggers deployment
- Returns final URL and full logs

## Route

- `POST /api/launch`
