import type { AppKitNetwork } from "@reown/appkit/networks";
import { KUEST_CHAIN_MODE, REOWN_APPKIT_PROJECT_ID } from "astro:env/client";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { polygon, polygonAmoy } from "@reown/appkit/networks";

export const projectId = REOWN_APPKIT_PROJECT_ID;

export const defaultNetwork = KUEST_CHAIN_MODE === "polygon" ? polygon : polygonAmoy;
export const networks = [defaultNetwork] as [AppKitNetwork, ...AppKitNetwork[]];

export const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
