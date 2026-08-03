'use client'

import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import type { PublicRuntimeConfig } from '@/lib/runtime-config'

import AppKitProvider from '@/providers/AppKitProvider'

interface AppProvidersProps {
  children: ReactNode
  runtimeConfig: PublicRuntimeConfig
}

export function AppProviders({ children, runtimeConfig }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <AppKitProvider runtimeConfig={runtimeConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppKitProvider>
  )
}
