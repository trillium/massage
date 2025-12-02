declare module 'posthog-js' {
  export interface PostHog {
    __loaded: boolean
    _isIdentified(): boolean
    get_distinct_id(): string
    identify(
      distinctId: string,
      properties?: Record<string, unknown>,
      options?: { send_instantly?: boolean }
    ): void
    reset(resetDeviceId?: boolean): void
    capture(eventName: string, properties?: Record<string, unknown>): void
    init(
      apiKey: string,
      options?: {
        api_host?: string
        ui_host?: string
        person_profiles?: 'always' | 'identified_only' | 'never'
        custom_campaign_params?: string[]
        debug?: boolean
        capture_pageview?: boolean
        capture_pageleave?: boolean
      }
    ): void
  }

  const posthog: PostHog
  export default posthog
}

declare module 'posthog-js/react' {
  import { PostHog } from 'posthog-js'
  import { ReactNode } from 'react'

  export function PostHogProvider(props: { client: PostHog; children: ReactNode }): JSX.Element

  export function usePostHog(): PostHog
}
