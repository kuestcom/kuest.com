import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  cacheComponents: false,
  typedRoutes: true,
  reactStrictMode: false,
  experimental: {
    inlineCss: true,
  },
  env: {
    SITE_URL: process.env.production ? 'https://kuest.com' : 'http://localhost:3000',
    CLOB_URL: process.env.CLOB_URL ?? 'https://clob.kuest.com',
    RELAYER_URL: process.env.RELAYER_URL ?? 'https://relayer.kuest.com',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
}

const withNextIntl = createNextIntlPlugin({
  experimental: {
    srcPath: './src',
    extract: {
      sourceLocale: 'en',
    },
    messages: {
      path: './src/i18n/messages',
      format: 'json',
      locales: 'infer',
    },
  },
})

export default withNextIntl(nextConfig)
