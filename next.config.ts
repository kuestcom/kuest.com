import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    CLOB_URL: process.env.CLOB_URL ?? "https://clob.kuest.com",
    RELAYER_URL: process.env.RELAYER_URL ?? "https://relayer.kuest.com",
  },
};

export default nextConfig;
