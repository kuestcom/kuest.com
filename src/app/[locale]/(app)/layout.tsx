import type { ReactNode } from 'react'
import { AppProviders } from '@/providers/AppProviders'
import '@/app/styles.css'

interface AppRouteLayoutProps {
  children: ReactNode
}

export default function AppRouteLayout({ children }: AppRouteLayoutProps) {
  return <AppProviders>{children}</AppProviders>
}
