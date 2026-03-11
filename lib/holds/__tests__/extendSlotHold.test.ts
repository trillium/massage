import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdminClient: () => ({
    rpc: mockRpc,
  }),
}))

import { extendSlotHold } from '../extendSlotHold'

beforeEach(() => {
  vi.clearAllMocks()
})

const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000'

describe('extendSlotHold', () => {
  it('returns extended: true on success', async () => {
    mockRpc.mockResolvedValue({
      data: { extended: true },
      error: null,
    })

    const result = await extendSlotHold(SESSION_ID)

    expect(result).toEqual({ extended: true })
    expect(mockRpc).toHaveBeenCalledWith('extend_slot_hold', {
      p_session_id: SESSION_ID,
    })
  })

  it('returns hold_expired when hold has expired', async () => {
    mockRpc.mockResolvedValue({
      data: { extended: false, reason: 'hold_expired' },
      error: null,
    })

    const result = await extendSlotHold(SESSION_ID)

    expect(result).toEqual({ extended: false, reason: 'hold_expired' })
  })

  it('returns rpc_error on Supabase error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'connection failed' },
    })

    const result = await extendSlotHold(SESSION_ID)

    expect(result).toEqual({ extended: false, reason: 'rpc_error' })
    expect(console.error).toHaveBeenCalled()
  })

  it('returns unknown reason when server returns no reason', async () => {
    mockRpc.mockResolvedValue({
      data: { extended: false },
      error: null,
    })

    const result = await extendSlotHold(SESSION_ID)

    expect(result).toEqual({ extended: false, reason: 'unknown' })
  })
})
