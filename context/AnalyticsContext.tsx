'use client'
import { ReactNode } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { siteConfig } from '@/lib/siteConfig'

if (typeof window !== 'undefined') {
  const hostname = window.location.hostname
  const baseDomain = new URL(siteConfig.domain.siteUrl).hostname
  const isDevSubdomain =
    hostname === `test.${baseDomain}` ||
    hostname === `admin.${baseDomain}` ||
    hostname === `dev.${baseDomain}`
  const isProdDomain = hostname.endsWith(baseDomain) && !isDevSubdomain

  const posthogKey = isProdDomain
    ? process.env.NEXT_PUBLIC_POSTHOG_KEY_PROD
    : process.env.NEXT_PUBLIC_POSTHOG_KEY_DEV

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: '/hostpog',
      ui_host: 'https://us.posthog.com',
      person_profiles: 'always',
      custom_campaign_params: ['ref'],
      capture_performance: true,
      defaults: '2026-01-30',
      debug: false,
    })
  }
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
