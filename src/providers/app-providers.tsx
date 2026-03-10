"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LaunchI18nProvider } from "@/i18n/launch";
import AppKitProvider from "@/providers/app-kit-provider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AppKitProvider>
      <QueryClientProvider client={queryClient}>
        <LaunchI18nProvider>
          <div className="min-h-screen bg-background text-foreground">{children}</div>
        </LaunchI18nProvider>
      </QueryClientProvider>
    </AppKitProvider>
  );
}
