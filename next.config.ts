import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  env: {
    CLOB_URL: process.env.CLOB_URL ?? "https://clob.kuest.com",
    RELAYER_URL: process.env.RELAYER_URL ?? "https://relayer.kuest.com",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
