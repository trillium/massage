import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdminClient: () => ({
    rpc: mockRpc,
  }),
}))

import { claimSlotHold } from '../claimSlotHold'

beforeEach(() => {
  vi.clearAllMocks()
})

const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000'
const START = '2026-03-15T10:00:00Z'
const END = '2026-03-15T11:00:00Z'

describe('claimSlotHold', () => {
  it('returns success with holdId on successful claim', async () => {
    mockRpc.mockResolvedValue({
      data: { success: true, hold_id: 'hold-abc' },
      error: null,
    })

    const result = await claimSlotHold(SESSION_ID, START, END)

    expect(result).toEqual({ success: true, holdId: 'hold-abc' })
    expect(mockRpc).toHaveBeenCalledWith('claim_slot_hold', {
      p_session_id: SESSION_ID,
      p_start: START,
      p_end: END,
    })
  })

  it('returns failure with reason when slot is already held', async () => {
    mockRpc.mockResolvedValue({
      data: { success: false, reason: 'slot_held' },
      error: null,
    })

    const result = await claimSlotHold(SESSION_ID, START, END)

    expect(result).toEqual({ success: false, reason: 'slot_held' })
  })

  it('returns rpc_error on Supabase error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'connection failed' },
    })

    const result = await claimSlotHold(SESSION_ID, START, END)

    expect(result).toEqual({ success: false, reason: 'rpc_error' })
    expect(console.error).toHaveBeenCalled()
  })

  it('returns unknown reason when server returns no reason', async () => {
    mockRpc.mockResolvedValue({
      data: { success: false },
      error: null,
    })

    const result = await claimSlotHold(SESSION_ID, START, END)

    expect(result).toEqual({ success: false, reason: 'unknown' })
  })
})
