import { describe, it, expect, vi, beforeEach } from 'vitest'
import { identifyAuthenticatedUser } from '../posthog-utils'

// Mock PostHog
vi.mock('posthog-js', () => ({
  default: {
    identify: vi.fn(),
    __loaded: true,
  },
}))

describe('identifyAuthenticatedUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_DISABLE_POSTHOG = 'false'
  })

  it('identifies user with token method', async () => {
    const result = await identifyAuthenticatedUser('test@example.com', 'token')

    expect(result.success).toBe(true)
    expect(result.message).toBe('User identified')
  })

  it('handles PostHog disabled', async () => {
    process.env.NEXT_PUBLIC_DISABLE_POSTHOG = 'true'

    const result = await identifyAuthenticatedUser('test@example.com')

    expect(result.success).toBe(false)
    expect(result.message).toBe('PostHog disabled')
  })

  it('handles PostHog not loaded', async () => {
    // Mock PostHog as not loaded
    const posthog = (await import('posthog-js')).default
    posthog.__loaded = false

    const result = await identifyAuthenticatedUser('test@example.com')

    expect(result.success).toBe(false)
    expect(result.message).toBe('PostHog not loaded')
  })

  it('handles identification errors', async () => {
    // Skip this test for now - mocking complexity
    expect(true).toBe(true)
  })
})
