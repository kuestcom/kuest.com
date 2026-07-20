'use client'

import { Analytics as DubAnalyticsClient } from '@dub/analytics/react'

export default function DubAnalytics() {
  return (
    <DubAnalyticsClient
      attributionModel="first-click"
      cookieOptions={{ expiresInDays: 90, path: '/', sameSite: 'lax', secure: true }}
      domainsConfig={{ refer: 'go.kuest.com' }}
    />
  )
}
