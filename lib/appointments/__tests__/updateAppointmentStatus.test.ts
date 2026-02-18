import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdate = vi.fn()
const mockEq = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdminClient: () => ({
    from: () => ({
      update: (data: unknown) => {
        mockUpdate(data)
        return { eq: mockEq }
      },
    }),
  }),
}))

import { updateAppointmentStatus } from '../updateAppointmentStatus'

beforeEach(() => {
  vi.clearAllMocks()
  mockEq.mockReturnValue({ error: null })
})

describe('updateAppointmentStatus', () => {
  it('updates to confirmed with confirmed_at timestamp', async () => {
    await updateAppointmentStatus('cal-123', 'confirmed')

    const data = mockUpdate.mock.calls[0][0]
    expect(data.status).toBe('confirmed')
    expect(data.confirmed_at).toBeTruthy()
    expect(data.cancelled_at).toBeUndefined()
    expect(mockEq).toHaveBeenCalledWith('calendar_event_id', 'cal-123')
  })

  it('updates to cancelled with cancelled_at timestamp', async () => {
    await updateAppointmentStatus('cal-456', 'cancelled')

    const data = mockUpdate.mock.calls[0][0]
    expect(data.status).toBe('cancelled')
    expect(data.cancelled_at).toBeTruthy()
    expect(data.confirmed_at).toBeUndefined()
  })

  it('updates to completed without extra timestamps', async () => {
    await updateAppointmentStatus('cal-789', 'completed')

    const data = mockUpdate.mock.calls[0][0]
    expect(data.status).toBe('completed')
    expect(data.confirmed_at).toBeUndefined()
    expect(data.cancelled_at).toBeUndefined()
  })

  it('logs error but does not throw', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockEq.mockReturnValueOnce({ error: { message: 'DB error' } })

    await expect(updateAppointmentStatus('cal-err', 'confirmed')).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalled()
  })
})
