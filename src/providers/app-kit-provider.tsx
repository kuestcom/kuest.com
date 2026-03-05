"use client";

import type { AppKit } from "@reown/appkit/react";
import type { ReactNode } from "react";
import { createAppKit } from "@reown/appkit/react";
import { useMemo, useSyncExternalStore } from "react";
import { WagmiProvider } from "wagmi";
import { AppKitContext, defaultAppKitValue } from "@/hooks/use-app-kit";
import {
  appKitFeatures,
  appKitMetadata,
  appKitThemeVariables,
  featuredWalletIds,
  networks,
  projectId,
  wagmiAdapter,
  wagmiConfig,
} from "@/lib/appkit";

let appKitInstance: AppKit | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

function getOrCreateAppKit() {
  if (!isBrowser()) {
    return null;
  }
  if (!projectId) {
    return null;
  }
  if (appKitInstance) {
    return appKitInstance;
  }

  appKitInstance = createAppKit({
    projectId,
    adapters: [wagmiAdapter],
    networks,
    metadata: appKitMetadata,
    themeMode: "dark",
    themeVariables: appKitThemeVariables,
    features: appKitFeatures,
    featuredWalletIds,
    defaultAccountTypes: { eip155: "eoa" },
  });
  return appKitInstance;
}

const noopSubscribe = () => () => {};

export default function AppKitProvider({ children }: { children: ReactNode }) {
  // Hydration-safe: false on server and first hydration pass, true right after client mounts.
  const isHydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const appKitValue = useMemo(() => {
    if (!isHydrated) {
      return defaultAppKitValue;
    }

    if (!projectId) {
      return {
        ...defaultAppKitValue,
        error:
          "NEXT_PUBLIC_REOWN_APPKIT_PROJECT_ID is missing. Add it to .env.local to enable wallet modal.",
      };
    }

    try {
      const instance = getOrCreateAppKit();
      if (!instance) {
        return defaultAppKitValue;
      }

      return {
        open: async (options: Parameters<AppKit["open"]>[0]) => {
          await instance.open(options);
        },
        close: async () => {
          await instance.close();
        },
        isReady: true,
        error: null,
      };
    } catch (error) {
      return {
        ...defaultAppKitValue,
        error: error instanceof Error ? error.message : "Failed to initialize wallet modal.",
      };
    }
  }, [isHydrated]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <AppKitContext value={appKitValue}>{children}</AppKitContext>
    </WagmiProvider>
  );
}
