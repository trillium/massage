// @vitest-environment happy-dom
import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// ─── Mock state ────────────────────────────────────────────────────────────────
// Rebuilt fresh each test in beforeEach so there are no cross-test leaks.

type PostgresHandler = (payload: unknown) => void
type PresenceHandler = () => void
type PresenceLeaveHandler = (payload: { key: string }) => void
type SubscribeCallback = (status: string, err?: Error) => void

let postgresHandler: PostgresHandler | null = null
let syncHandler: PresenceHandler | null = null
let leaveHandler: PresenceLeaveHandler | null = null
let subscribeCallback: SubscribeCallback | null = null
let mockGt: ReturnType<typeof vi.fn>
let mockFrom: ReturnType<typeof vi.fn>
let mockChannelFn: ReturnType<typeof vi.fn>
let mockUnsubscribe: ReturnType<typeof vi.fn>
let mockTrack: ReturnType<typeof vi.fn>
let mockChannel: {
  on: ReturnType<typeof vi.fn>
  subscribe: ReturnType<typeof vi.fn>
  unsubscribe: ReturnType<typeof vi.fn>
  presenceState: ReturnType<typeof vi.fn>
  track: ReturnType<typeof vi.fn>
}

function buildMocks(initialData: unknown[] = []) {
  postgresHandler = null
  syncHandler = null
  leaveHandler = null
  subscribeCallback = null

  mockGt = vi.fn().mockResolvedValue({ data: initialData, error: null })
  const mockSelect = vi.fn().mockReturnValue({ gt: mockGt })
  mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
  mockUnsubscribe = vi.fn()
  mockTrack = vi.fn().mockResolvedValue(undefined)

  // Build channel before assigning to mockChannel so the closure reference is safe
  const channel = {
    on: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: mockUnsubscribe,
    presenceState: vi.fn().mockReturnValue({}),
    track: mockTrack,
  }

  channel.on.mockImplementation((type: string, arg: { event?: string }, handler: unknown) => {
    if (type === 'postgres_changes') postgresHandler = handler as PostgresHandler
    if (type === 'presence' && arg?.event === 'sync') syncHandler = handler as PresenceHandler
    if (type === 'presence' && arg?.event === 'leave')
      leaveHandler = handler as PresenceLeaveHandler
    return channel
  })

  channel.subscribe.mockImplementation((cb: SubscribeCallback) => {
    subscribeCallback = cb
    return channel
  })

  mockChannel = channel
  mockChannelFn = vi.fn().mockReturnValue(channel)
}

// ─── Supabase client mock ─────────────────────────────────────────────────────
// The factory is hoisted, but reads mockFrom/mockChannelFn at call time,
// so rebuilding them in beforeEach is enough.

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    get from() {
      return mockFrom
    },
    get channel() {
      return mockChannelFn
    },
  }),
}))

const SESSION_A = 'aaaaaaaa-0000-0000-0000-000000000000'

vi.mock('../useSessionId', () => ({
  useSessionId: () => SESSION_A,
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SESSION_B = 'bbbbbbbb-0000-0000-0000-000000000000'
const SESSION_C = 'cccccccc-0000-0000-0000-000000000000'

const SLOT_1 = { start_time: '2026-06-01T10:00:00Z', end_time: '2026-06-01T11:00:00Z' }
const SLOT_2 = { start_time: '2026-06-01T11:00:00Z', end_time: '2026-06-01T12:00:00Z' }
const SLOT_3 = { start_time: '2026-06-01T12:00:00Z', end_time: '2026-06-01T13:00:00Z' }

function holdFor(session: string, slot: typeof SLOT_1, shooCount = 0) {
  return { ...slot, session_id: session, shoo_count: shooCount }
}

async function fireRealtimeEvent() {
  await act(async () => {
    postgresHandler?.({ eventType: 'INSERT', table: 'slot_holds', schema: 'your_tenant_schema' })
  })
}

// ─── Import hook after mocks ───────────────────────────────────────────────────

import { useHeldSlots } from '../useHeldSlots'

// ─── Setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  buildMocks()
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useHeldSlots', () => {
  describe('initial state', () => {
    it('fetches held slots on mount', async () => {
      buildMocks([holdFor(SESSION_B, SLOT_1)])
      const { result } = renderHook(() => useHeldSlots())

      await waitFor(() => expect(result.current.heldSlots).toHaveLength(1))
      expect(result.current.heldSlots[0].session_id).toBe(SESSION_B)
    })

    it('starts with empty holds when DB returns none', async () => {
      const { result } = renderHook(() => useHeldSlots())

      await waitFor(() => expect(result.current.debug.fetchCount).toBe(1))
      expect(result.current.heldSlots).toHaveLength(0)
    })

    it('subscribes to the realtime channel on mount', async () => {
      renderHook(() => useHeldSlots())

      await waitFor(() => expect(mockChannelFn).toHaveBeenCalledTimes(1))
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1)
    })
  })

  describe('realtime propagation', () => {
    it('refetches when a postgres_changes event fires', async () => {
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.debug.fetchCount).toBe(1))

      mockGt.mockResolvedValue({ data: [holdFor(SESSION_B, SLOT_1)], error: null })
      fireRealtimeEvent()

      await waitFor(() => expect(result.current.heldSlots).toHaveLength(1))
      expect(result.current.debug.fetchCount).toBe(2)
    })

    it('reflects hold added by user B after realtime event', async () => {
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.debug.fetchCount).toBe(1))

      mockGt.mockResolvedValue({ data: [holdFor(SESSION_B, SLOT_1)], error: null })
      fireRealtimeEvent()

      await waitFor(() => {
        expect(result.current.getHolderSessionId(SLOT_1.start_time, SLOT_1.end_time)).toBe(
          SESSION_B
        )
      })
    })

    it('reflects hold removed after realtime DELETE event', async () => {
      buildMocks([holdFor(SESSION_B, SLOT_1)])
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.heldSlots).toHaveLength(1))

      mockGt.mockResolvedValue({ data: [], error: null })
      fireRealtimeEvent()

      await waitFor(() => expect(result.current.heldSlots).toHaveLength(0))
    })
  })

  describe('multi-user rotation — A, B, C each hold a slot', () => {
    it('user A sees holds from B and C after each claims', async () => {
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.debug.fetchCount).toBe(1))

      // B claims slot 1
      mockGt.mockResolvedValue({ data: [holdFor(SESSION_B, SLOT_1)], error: null })
      fireRealtimeEvent()
      await waitFor(() => expect(result.current.heldSlots).toHaveLength(1))

      // C claims slot 2
      mockGt.mockResolvedValue({
        data: [holdFor(SESSION_B, SLOT_1), holdFor(SESSION_C, SLOT_2)],
        error: null,
      })
      fireRealtimeEvent()
      await waitFor(() => expect(result.current.heldSlots).toHaveLength(2))

      expect(result.current.getHolderSessionId(SLOT_1.start_time, SLOT_1.end_time)).toBe(SESSION_B)
      expect(result.current.getHolderSessionId(SLOT_2.start_time, SLOT_2.end_time)).toBe(SESSION_C)
    })

    it('user A does not see their own hold as held by another', async () => {
      buildMocks([
        holdFor(SESSION_A, SLOT_3),
        holdFor(SESSION_B, SLOT_1),
        holdFor(SESSION_C, SLOT_2),
      ])
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.heldSlots).toHaveLength(3))

      expect(result.current.getHolderSessionId(SLOT_3.start_time, SLOT_3.end_time)).toBeNull()
      expect(result.current.getHolderSessionId(SLOT_1.start_time, SLOT_1.end_time)).toBe(SESSION_B)
      expect(result.current.getHolderSessionId(SLOT_2.start_time, SLOT_2.end_time)).toBe(SESSION_C)
    })

    it('B releases, slot opens; C still held', async () => {
      buildMocks([holdFor(SESSION_B, SLOT_1), holdFor(SESSION_C, SLOT_2)])
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.heldSlots).toHaveLength(2))

      mockGt.mockResolvedValue({ data: [holdFor(SESSION_C, SLOT_2)], error: null })
      fireRealtimeEvent()

      await waitFor(() => {
        expect(result.current.getHolderSessionId(SLOT_1.start_time, SLOT_1.end_time)).toBeNull()
        expect(result.current.getHolderSessionId(SLOT_2.start_time, SLOT_2.end_time)).toBe(
          SESSION_C
        )
      })
    })
  })

  describe('getShooCount', () => {
    it('returns shoo_count for a held slot', async () => {
      buildMocks([holdFor(SESSION_B, SLOT_1, 3)])
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.heldSlots).toHaveLength(1))

      expect(result.current.getShooCount(SLOT_1.start_time, SLOT_1.end_time)).toBe(3)
    })

    it('returns 0 for a slot not held by anyone else', async () => {
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.debug.fetchCount).toBe(1))

      expect(result.current.getShooCount(SLOT_1.start_time, SLOT_1.end_time)).toBe(0)
    })

    it('shoo count updates after realtime event', async () => {
      buildMocks([holdFor(SESSION_B, SLOT_1, 1)])
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() =>
        expect(result.current.getShooCount(SLOT_1.start_time, SLOT_1.end_time)).toBe(1)
      )

      mockGt.mockResolvedValue({ data: [holdFor(SESSION_B, SLOT_1, 2)], error: null })
      fireRealtimeEvent()

      await waitFor(() =>
        expect(result.current.getShooCount(SLOT_1.start_time, SLOT_1.end_time)).toBe(2)
      )
    })
  })

  describe('channel lifecycle', () => {
    // Helper: mount hook and wait until the initial fetch has resolved,
    // at which point the channel subscribe callback is guaranteed to be set.
    async function mountAndInit() {
      const hook = renderHook(() => useHeldSlots())
      await waitFor(() => expect(hook.result.current.debug.fetchCount).toBeGreaterThanOrEqual(1))
      return hook
    }

    it('switches to polling mode on CHANNEL_ERROR', async () => {
      const { result } = await mountAndInit()

      await act(async () => subscribeCallback?.('CHANNEL_ERROR'))

      expect(result.current.debug.mode).toBe('polling')
    })

    it('switches to polling mode on TIMED_OUT', async () => {
      const { result } = await mountAndInit()

      await act(async () => subscribeCallback?.('TIMED_OUT'))

      expect(result.current.debug.mode).toBe('polling')
    })

    it('switches back to realtime mode on SUBSCRIBED', async () => {
      const { result } = await mountAndInit()

      await act(async () => subscribeCallback?.('CHANNEL_ERROR'))
      expect(result.current.debug.mode).toBe('polling')

      await act(async () => subscribeCallback?.('SUBSCRIBED'))
      expect(result.current.debug.mode).toBe('realtime')
    })

    it('polls on interval when in polling mode', async () => {
      const hook = await mountAndInit()

      // Enable fake timers before CHANNEL_ERROR so startPolling() uses the fake setInterval
      vi.useFakeTimers()
      try {
        await act(async () => subscribeCallback?.('CHANNEL_ERROR'))

        const fetchCountBefore = mockGt.mock.calls.length
        await act(async () => vi.advanceTimersByTime(5_000))
        expect(mockGt.mock.calls.length).toBeGreaterThan(fetchCountBefore)
      } finally {
        vi.useRealTimers()
      }
      hook.unmount()
    })

    it('unsubscribes and stops polling on unmount', async () => {
      const { unmount } = await mountAndInit()

      await act(async () => subscribeCallback?.('CHANNEL_ERROR'))
      unmount()

      const callsAfterUnmount = mockGt.mock.calls.length
      vi.useFakeTimers()
      try {
        act(() => vi.advanceTimersByTime(15_000))
      } finally {
        vi.useRealTimers()
      }
      expect(mockGt.mock.calls.length).toBe(callsAfterUnmount)
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
    })
  })

  describe('overlap detection', () => {
    it('detects a hold that partially overlaps a slot', async () => {
      buildMocks([
        {
          start_time: '2026-06-01T10:30:00Z',
          end_time: '2026-06-01T11:30:00Z',
          session_id: SESSION_B,
          shoo_count: 0,
        },
      ])
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.heldSlots).toHaveLength(1))

      // SLOT_1 is 10:00–11:00, hold is 10:30–11:30 — they overlap
      expect(result.current.getHolderSessionId(SLOT_1.start_time, SLOT_1.end_time)).toBe(SESSION_B)
    })

    it('does not flag a hold that ends exactly when a slot starts', async () => {
      buildMocks([
        {
          start_time: '2026-06-01T08:00:00Z',
          end_time: '2026-06-01T10:00:00Z',
          session_id: SESSION_B,
          shoo_count: 0,
        },
      ])
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.heldSlots).toHaveLength(1))

      // Hold ends at 10:00, SLOT_1 starts at 10:00 — no overlap (exclusive boundary)
      expect(result.current.getHolderSessionId(SLOT_1.start_time, SLOT_1.end_time)).toBeNull()
    })
  })

  describe('fetch error handling', () => {
    it('preserves existing holds when a subsequent fetch errors', async () => {
      buildMocks([holdFor(SESSION_B, SLOT_1)])
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.heldSlots).toHaveLength(1))

      mockGt.mockResolvedValue({ data: null, error: { message: 'DB down' } })
      await fireRealtimeEvent()

      await waitFor(() => expect(result.current.debug.fetchCount).toBe(2))
      expect(result.current.heldSlots).toHaveLength(1)
      expect(result.current.heldSlots[0].session_id).toBe(SESSION_B)
    })

    it('starts with empty holds and records error when initial fetch fails', async () => {
      mockGt.mockResolvedValue({ data: null, error: { message: 'connection refused' } })
      const { result } = renderHook(() => useHeldSlots())

      await waitFor(() => expect(result.current.debug.fetchCount).toBe(1))
      expect(result.current.heldSlots).toHaveLength(0)
      expect(result.current.debug.channelStatus).toContain('connection refused')
    })
  })

  describe('presence sync', () => {
    it('updates activeUsers when presence sync fires', async () => {
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.debug.fetchCount).toBe(1))

      mockChannel.presenceState.mockReturnValue({ a: {}, b: {}, c: {} })
      act(() => syncHandler?.())

      await waitFor(() => expect(result.current.activeUsers).toBe(3))
    })
  })

  describe('getShooCount own-session exclusion', () => {
    it('returns 0 for a hold belonging to the current session', async () => {
      buildMocks([holdFor(SESSION_A, SLOT_1, 5)])
      const { result } = renderHook(() => useHeldSlots())
      await waitFor(() => expect(result.current.heldSlots).toHaveLength(1))

      expect(result.current.getShooCount(SLOT_1.start_time, SLOT_1.end_time)).toBe(0)
    })
  })
})
