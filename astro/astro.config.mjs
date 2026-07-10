import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL || 'https://kuest.com',
  adapter: cloudflare(),
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.NEXT_PUBLIC_REOWN_APPKIT_PROJECT_ID': JSON.stringify(process.env.NEXT_PUBLIC_REOWN_APPKIT_PROJECT_ID || ''),
      'process.env.NEXT_PUBLIC_KUEST_CHAIN_MODE': JSON.stringify(process.env.NEXT_PUBLIC_KUEST_CHAIN_MODE || 'amoy'),
      'process.env.NEXT_PUBLIC_DEFAULT_SUPABASE_REGION': JSON.stringify(process.env.NEXT_PUBLIC_DEFAULT_SUPABASE_REGION || 'us-east-1'),
      'process.env.NEXT_PUBLIC_DEFAULT_VERCEL_TEAM_ID': JSON.stringify(process.env.NEXT_PUBLIC_DEFAULT_VERCEL_TEAM_ID || ''),
      'process.env.NEXT_PUBLIC_GITHUB_APP_URL': JSON.stringify(process.env.NEXT_PUBLIC_GITHUB_APP_URL || 'https://github-app.kuest.com'),
      'process.env.NEXT_PUBLIC_VERCEL_ALLOW_TOKEN_FALLBACK': JSON.stringify(process.env.NEXT_PUBLIC_VERCEL_ALLOW_TOKEN_FALLBACK || 'true'),
      'process.env.CLOB_URL': JSON.stringify(process.env.CLOB_URL || 'https://clob.kuest.com'),
      'process.env.RELAYER_URL': JSON.stringify(process.env.RELAYER_URL || 'https://relayer.kuest.com'),
    },
  },
});
