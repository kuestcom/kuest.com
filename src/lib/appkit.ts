import type { AppKitNetwork } from "@reown/appkit/networks";
import { polygon, polygonAmoy } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

export const projectId = process.env.NEXT_PUBLIC_REOWN_APPKIT_PROJECT_ID?.trim() ?? "";

const fallbackProjectId = "missing-reown-project-id";
const resolvedProjectId = projectId || fallbackProjectId;
const defaultAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://launch.kuest.com";
const appIconUrl = process.env.NEXT_PUBLIC_APP_ICON ?? `${defaultAppUrl}/kuest-logo.svg`;
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Kuest";
const metamaskWalletId = "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96";

export const networks = [polygon, polygonAmoy] as [AppKitNetwork, ...AppKitNetwork[]];

export const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  projectId: resolvedProjectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

export const appKitMetadata = {
  name: `${siteName} Launchpad`,
  description: `Launch your ${siteName} market with guided setup.`,
  url: defaultAppUrl,
  icons: [appIconUrl],
};

export const appKitThemeVariables = {
  "--w3m-font-family": "var(--font-sans)",
  "--w3m-border-radius-master": "2px",
  "--w3m-accent": "var(--primary)",
} as const;

export const appKitFeatures = {
  analytics: process.env.NODE_ENV === "production",
  history: false,
  onramp: false,
  swaps: false,
  receive: false,
  send: false,
};

export const featuredWalletIds = [metamaskWalletId];
