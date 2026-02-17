import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('posthog-server', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  describe('when PostHog is disabled', () => {
    it('getPostHogServer returns null', async () => {
      vi.stubEnv('NEXT_PUBLIC_DISABLE_POSTHOG', 'true')
      const { getPostHogServer } = await import('@/lib/posthog-server')
      expect(getPostHogServer()).toBeNull()
      vi.unstubAllEnvs()
    })

    it('isFeatureEnabled returns false', async () => {
      vi.stubEnv('NEXT_PUBLIC_DISABLE_POSTHOG', 'true')
      const { isFeatureEnabled } = await import('@/lib/posthog-server')
      expect(await isFeatureEnabled('flag', 'user')).toBe(false)
      vi.unstubAllEnvs()
    })

    it('getFeatureFlag returns undefined', async () => {
      vi.stubEnv('NEXT_PUBLIC_DISABLE_POSTHOG', 'true')
      const { getFeatureFlag } = await import('@/lib/posthog-server')
      expect(await getFeatureFlag('flag', 'user')).toBeUndefined()
      vi.unstubAllEnvs()
    })
  })

  describe('when no API key is set', () => {
    it('getPostHogServer returns null', async () => {
      vi.stubEnv('NEXT_PUBLIC_DISABLE_POSTHOG', '')
      vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY_PROD', '')
      vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY_DEV', '')
      const { getPostHogServer } = await import('@/lib/posthog-server')
      expect(getPostHogServer()).toBeNull()
      vi.unstubAllEnvs()
    })
  })
})
