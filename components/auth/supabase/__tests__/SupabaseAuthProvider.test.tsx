import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import type { Session } from '@supabase/supabase-js'
import { SupabaseAuthProvider } from '@/components/auth/supabase/SupabaseAuthProvider'
import { Box } from '@/components/ui/box'

const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockSingle = vi.fn()
const mockUnsubscribe = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: vi.fn(() => ({
    auth: {
      getSession: (...args: unknown[]) =>
        mockGetSession(...args) ?? Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (...args: unknown[]) =>
        mockOnAuthStateChange(...args) ?? {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        },
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: (...args: unknown[]) =>
            mockSingle(...args) ?? Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  })),
}))

const fakeSession = (userId = 'user-1', email = 'test@example.com'): Session =>
  ({ user: { id: userId, email } }) as Session

const flushAsync = () =>
  act(async () => {
    await vi.runAllTimersAsync()
  })

describe('SupabaseAuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })
    mockSingle.mockResolvedValue({ data: { id: 'user-1', role: 'user' }, error: null })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls getSession on mount', async () => {
    render(
      <SupabaseAuthProvider>
        <Box />
      </SupabaseAuthProvider>
    )

    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalledTimes(1)
    })
  })

  it('registers onAuthStateChange listener on mount', async () => {
    render(
      <SupabaseAuthProvider>
        <Box />
      </SupabaseAuthProvider>
    )

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1)
    })
  })

  it('debounces rapid auth state changes — fetchProfile called once', async () => {
    vi.useFakeTimers()

    let capturedCallback: ((event: string, session: Session | null) => void) | null = null
    mockOnAuthStateChange.mockImplementation((cb) => {
      capturedCallback = cb
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
    })

    render(
      <SupabaseAuthProvider>
        <Box />
      </SupabaseAuthProvider>
    )

    await flushAsync()

    const session = fakeSession()
    await act(async () => {
      capturedCallback!('SIGNED_IN', session)
      capturedCallback!('TOKEN_REFRESHED', session)
      capturedCallback!('SIGNED_IN', session)
      await vi.runAllTimersAsync()
    })

    expect(mockSingle).toHaveBeenCalledTimes(1)
  })

  it('fires fetchProfile for each spaced auth event', async () => {
    vi.useFakeTimers()

    let capturedCallback: ((event: string, session: Session | null) => void) | null = null
    mockOnAuthStateChange.mockImplementation((cb) => {
      capturedCallback = cb
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
    })

    render(
      <SupabaseAuthProvider>
        <Box />
      </SupabaseAuthProvider>
    )

    await flushAsync()

    await act(async () => {
      capturedCallback!('SIGNED_IN', fakeSession())
      await vi.runAllTimersAsync()
    })
    expect(mockSingle).toHaveBeenCalledTimes(1)

    await act(async () => {
      capturedCallback!('TOKEN_REFRESHED', fakeSession())
      await vi.runAllTimersAsync()
    })
    expect(mockSingle).toHaveBeenCalledTimes(2)
  })

  it('unsubscribes and clears debounce timer on unmount', async () => {
    vi.useFakeTimers()

    let capturedCallback: ((event: string, session: Session | null) => void) | null = null
    mockOnAuthStateChange.mockImplementation((cb) => {
      capturedCallback = cb
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
    })

    const { unmount } = render(
      <SupabaseAuthProvider>
        <Box />
      </SupabaseAuthProvider>
    )

    await flushAsync()

    act(() => {
      capturedCallback!('TOKEN_REFRESHED', fakeSession())
    })
    unmount()

    await flushAsync()

    expect(mockSingle).not.toHaveBeenCalled()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
