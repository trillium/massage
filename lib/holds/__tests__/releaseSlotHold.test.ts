import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdminClient: () => ({
    rpc: mockRpc,
  }),
}))

import { releaseSlotHold } from '../releaseSlotHold'

beforeEach(() => {
  vi.clearAllMocks()
})

const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000'

describe('releaseSlotHold', () => {
  it('calls release_slot_hold RPC with session_id', async () => {
    mockRpc.mockResolvedValue({ error: null })

    await releaseSlotHold(SESSION_ID)

    expect(mockRpc).toHaveBeenCalledWith('release_slot_hold', {
      p_session_id: SESSION_ID,
    })
  })

  it('logs error but does not throw on failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockRpc.mockResolvedValue({ error: { message: 'DB error' } })

    await expect(releaseSlotHold(SESSION_ID)).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalled()
  })
})
