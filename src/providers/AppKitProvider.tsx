"use client";

import type { AppKit } from "@reown/appkit";
import type { ReactNode } from "react";
import { createAppKit, useAppKitTheme } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { AppKitContext, defaultAppKitValue } from "@/hooks/useAppKit";
import { createAppKitRuntime } from "@/lib/appkit";
import { IS_BROWSER } from "@/lib/constants";
import type { PublicRuntimeConfig } from "@/lib/runtime-config";

let hasInitializedAppKit = false;
let appKitInstance: AppKit | null = null;

function initializeAppKitSingleton(
  themeMode: "light" | "dark",
  site: { name: string; description: string },
  runtime: ReturnType<typeof createAppKitRuntime>,
) {
  if (hasInitializedAppKit || !IS_BROWSER) {
    return appKitInstance;
  }

  try {
    if (!runtime.projectId) {
      return null;
    }
    const siteOrigin = window.location.origin;
    appKitInstance = createAppKit({
      projectId: runtime.projectId,
      adapters: [runtime.wagmiAdapter],
      themeMode,
      defaultAccountTypes: { eip155: "eoa" },
      metadata: {
        name: site.name,
        description: site.description,
        url: siteOrigin,
        icons: [`${siteOrigin}/assets/images/kuest-logo.svg`],
      },
      themeVariables: {
        "--w3m-font-family": "var(--font-sans)",
        "--w3m-border-radius-master": "2px",
        "--w3m-accent": "var(--primary)",
      },
      networks: runtime.networks,
      featuredWalletIds: ["c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96"],
      features: {
        analytics: import.meta.env.PROD,
      },
    });

    hasInitializedAppKit = true;
    return appKitInstance;
  } catch (error) {
    console.warn("Wallet initialization failed. Using local/default values.", error);
    return null;
  }
}

function AppKitThemeSynchronizer({ themeMode }: { themeMode: "light" | "dark" }) {
  const { setThemeMode } = useAppKitTheme();

  useEffect(() => {
    setThemeMode(themeMode);
  }, [setThemeMode, themeMode]);

  return null;
}

export default function AppKitProvider({
  children,
  runtimeConfig,
}: {
  children: ReactNode;
  runtimeConfig: PublicRuntimeConfig;
}) {
  const [appKitRuntime] = useState(() => createAppKitRuntime(runtimeConfig));
  const [appKitThemeMode, setAppKitThemeMode] = useState<"light" | "dark">("light");
  const [canSyncTheme, setCanSyncTheme] = useState(false);
  const [AppKitValue, setAppKitValue] = useState(defaultAppKitValue);

  useEffect(() => {
    if (!IS_BROWSER) {
      return;
    }

    const instance = initializeAppKitSingleton(
      "dark",
      {
        name: `Kuest Launchpad`,
        description: `Launch your prediction market with guided setup.`,
      },
      appKitRuntime,
    );

    if (instance) {
      queueMicrotask(() => {
        setAppKitThemeMode("dark");
        setCanSyncTheme(true);
        setAppKitValue({
          open: async (options) => {
            await instance.open(options);
          },
          close: async () => {
            await instance.close();
          },
          isReady: true,
          error: null,
        });
      });
    } else if (!appKitRuntime.projectId) {
      queueMicrotask(() => {
        setAppKitValue({
          ...defaultAppKitValue,
          error: "Missing REOWN_APPKIT_PROJECT_ID in Cloudflare Variables and Secrets.",
        });
      });
    }
  }, [appKitRuntime]);

  return (
    <WagmiProvider config={appKitRuntime.wagmiConfig}>
      <AppKitContext value={AppKitValue}>
        {children}
        {canSyncTheme && <AppKitThemeSynchronizer themeMode={appKitThemeMode} />}
      </AppKitContext>
    </WagmiProvider>
  );
}
