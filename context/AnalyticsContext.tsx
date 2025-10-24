// app/providers.js
'use client'
import { ReactNode } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  const hostname = window.location.hostname
  const isDevSubdomain =
    hostname === 'test.trilliummassage.la' ||
    hostname === 'admin.trilliummassage.la' ||
    hostname === 'dev.trilliummassage.la'
  const isProdDomain = hostname.endsWith('.trilliummassage.la') && !isDevSubdomain

  const posthogKey = isProdDomain
    ? process.env.NEXT_PUBLIC_POSTHOG_KEY_PROD
    : process.env.NEXT_PUBLIC_POSTHOG_KEY_DEV

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: '/hostpog',
      ui_host: 'https://us.posthog.com',
      person_profiles: 'always',
      custom_campaign_params: ['ref'],
      debug: false,
    })
  }
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
