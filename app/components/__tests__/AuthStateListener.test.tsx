import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import type { Session } from '@supabase/supabase-js'
import { AuthStateListener } from '@/app/components/AuthStateListener'

const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockUnsubscribe = vi.fn()
const mockIdentify = vi.fn()
const mockReset = vi.fn()
const mockIsIdentified = vi.fn().mockReturnValue(false)

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: vi.fn(() => ({
    auth: {
      getSession: (...args: unknown[]) =>
        mockGetSession(...args) ?? Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (...args: unknown[]) =>
        mockOnAuthStateChange(...args) ?? {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        },
    },
  })),
}))

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    identify: mockIdentify,
    reset: mockReset,
    _isIdentified: mockIsIdentified,
  }),
}))

const fakeSession = (email = 'test@example.com', userId = 'user-1'): Session =>
  ({
    user: { id: userId, email, app_metadata: { provider: 'email' } },
  }) as Session

describe('AuthStateListener', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })
    mockIsIdentified.mockReturnValue(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls getSession on mount', async () => {
    render(<AuthStateListener />)

    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalledTimes(1)
    })
  })

  it('identifies user via PostHog when session exists on mount', async () => {
    mockGetSession.mockResolvedValue({ data: { session: fakeSession() }, error: null })

    render(<AuthStateListener />)

    await waitFor(() => {
      expect(mockIdentify).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({ email: 'test@example.com', user_id: 'user-1' })
      )
    })
  })

  it('debounces rapid SIGNED_IN events — identify called once', async () => {
    vi.useFakeTimers()

    let capturedCallback: ((event: string, session: Session | null) => void) | null = null
    mockOnAuthStateChange.mockImplementation((cb) => {
      capturedCallback = cb
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
    })

    render(<AuthStateListener />)
    await vi.runAllTimersAsync()

    capturedCallback!('SIGNED_IN', fakeSession())
    capturedCallback!('SIGNED_IN', fakeSession())
    capturedCallback!('SIGNED_IN', fakeSession())

    await vi.advanceTimersByTimeAsync(300)

    expect(mockIdentify).toHaveBeenCalledTimes(1)
  })

  it('calls posthog.reset on SIGNED_OUT when identified', async () => {
    vi.useFakeTimers()
    mockIsIdentified.mockReturnValue(true)

    let capturedCallback: ((event: string, session: Session | null) => void) | null = null
    mockOnAuthStateChange.mockImplementation((cb) => {
      capturedCallback = cb
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
    })

    render(<AuthStateListener />)
    await vi.runAllTimersAsync()

    capturedCallback!('SIGNED_OUT', null)
    await vi.advanceTimersByTimeAsync(300)

    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('unsubscribes and clears debounce timer on unmount', async () => {
    vi.useFakeTimers()

    let capturedCallback: ((event: string, session: Session | null) => void) | null = null
    mockOnAuthStateChange.mockImplementation((cb) => {
      capturedCallback = cb
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
    })

    const { unmount } = render(<AuthStateListener />)
    await vi.runAllTimersAsync()

    capturedCallback!('SIGNED_IN', fakeSession())
    unmount()

    await vi.advanceTimersByTimeAsync(300)

    expect(mockIdentify).not.toHaveBeenCalled()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
