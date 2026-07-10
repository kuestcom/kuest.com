import type { ReactNode } from 'react'
import { AppProviders } from '@/providers/AppProviders'
import '@/app/styles.css'

interface AppRouteLayoutProps {
  children: ReactNode
}

export default function AppRouteLayout({ children }: AppRouteLayoutProps) {
  return (
    <div
      data-theme-mode="dark"
      className="min-h-screen bg-background text-foreground"
      style={{ colorScheme: 'dark' }}
    >
      <AppProviders>{children}</AppProviders>
    </div>
  )
}
