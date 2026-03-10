import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSelect = vi.fn()
const mockGt = vi.fn()
const mockLt = vi.fn()
const mockNeq = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdminClient: () => ({
    from: () => ({
      select: (...args: unknown[]) => {
        mockSelect(...args)
        return { gt: mockGt }
      },
    }),
  }),
}))

import { getActiveHolds } from '../getActiveHolds'

beforeEach(() => {
  vi.clearAllMocks()

  mockGt.mockReturnValue({ lt: mockLt })
  mockLt.mockReturnValue({ gt: mockGt })
  mockGt.mockReturnValueOnce({ lt: mockLt }).mockReturnValue({
    data: [{ start_time: '2026-03-15T10:00:00Z', end_time: '2026-03-15T11:00:00Z' }],
    error: null,
  })
  mockLt.mockReturnValue({ gt: mockGt })
})

describe('getActiveHolds', () => {
  it('returns DateTimeIntervals from query results', async () => {
    const chainEnd = {
      data: [{ start_time: '2026-03-15T10:00:00Z', end_time: '2026-03-15T11:00:00Z' }],
      error: null,
    }
    mockGt.mockReset()
    mockLt.mockReset()

    mockGt.mockReturnValueOnce({ lt: mockLt })
    mockLt.mockReturnValueOnce({ gt: mockGt })
    mockGt.mockReturnValueOnce(chainEnd)

    const result = await getActiveHolds('2026-03-15T09:00:00Z', '2026-03-15T12:00:00Z')

    expect(result).toEqual([
      {
        start: new Date('2026-03-15T10:00:00Z'),
        end: new Date('2026-03-15T11:00:00Z'),
      },
    ])
  })

  it('returns empty array on error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGt.mockReset()
    mockLt.mockReset()

    mockGt.mockReturnValueOnce({ lt: mockLt })
    mockLt.mockReturnValueOnce({ gt: mockGt })
    mockGt.mockReturnValueOnce({ data: null, error: { message: 'query failed' } })

    const result = await getActiveHolds('2026-03-15T09:00:00Z', '2026-03-15T12:00:00Z')

    expect(result).toEqual([])
    expect(console.error).toHaveBeenCalled()
  })

  it('adds neq filter when excludeSessionId provided', async () => {
    mockGt.mockReset()
    mockLt.mockReset()

    mockGt.mockReturnValueOnce({ lt: mockLt })
    mockLt.mockReturnValueOnce({ gt: mockGt })
    mockGt.mockReturnValueOnce({ neq: mockNeq })
    mockNeq.mockReturnValueOnce({ data: [], error: null })

    const result = await getActiveHolds(
      '2026-03-15T09:00:00Z',
      '2026-03-15T12:00:00Z',
      'session-abc'
    )

    expect(mockNeq).toHaveBeenCalledWith('session_id', 'session-abc')
    expect(result).toEqual([])
  })
})
