import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockReminders = [
  {
    id: 'rem-1',
    appointment_id: 'appt-1',
    channel: 'email',
    reminder_type: '24h_before',
    status: 'scheduled',
    scheduled_for: '2026-02-17T10:00:00Z',
    sent_at: null,
    created_at: '2026-02-16T10:00:00Z',
    updated_at: '2026-02-16T10:00:00Z',
  },
]

const mockAppointment = {
  id: 'appt-1',
  calendar_event_id: 'cal-1',
  client_email: 'jane@example.com',
  client_first_name: 'Jane',
  client_last_name: 'Doe',
  start_time: '2026-02-18T10:00:00-08:00',
  end_time: '2026-02-18T11:30:00-08:00',
  duration_minutes: 90,
  timezone: 'America/Los_Angeles',
  status: 'confirmed',
}

const mockReminderUpdate = vi.fn()
const mockLogInsert = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdminClient: () => ({
    from: (table: string) => {
      if (table === 'reminders') {
        return {
          select: () => ({
            eq: () => ({
              lte: () => ({
                limit: () => ({ data: mockReminders, error: null }),
              }),
            }),
          }),
          update: mockReminderUpdate,
        }
      }
      if (table === 'appointments') {
        return {
          select: () => ({
            eq: () => ({
              single: () => ({ data: mockAppointment, error: null }),
            }),
          }),
        }
      }
      if (table === 'reminder_logs') {
        return { insert: mockLogInsert }
      }
      return {}
    },
  }),
}))

const mockSend = vi.fn().mockResolvedValue({ success: true })

vi.mock('../channels/registry', () => ({
  getAdapter: () => ({ channel: 'email', send: mockSend }),
}))

import { processReminders } from '../processReminders'

beforeEach(() => {
  vi.clearAllMocks()
  mockReminderUpdate.mockImplementation(() => ({
    eq: vi.fn(() => ({ error: null })),
  }))
  mockLogInsert.mockImplementation(() => ({ error: null }))
})

describe('processReminders', () => {
  it('processes due reminders and logs results', async () => {
    const result = await processReminders()

    expect(result.processed).toBe(1)
    expect(result.sent).toBe(1)
    expect(result.failed).toBe(0)
    expect(mockSend).toHaveBeenCalledOnce()
    expect(mockReminderUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'sent' }))
    expect(mockLogInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        reminder_id: 'rem-1',
        channel: 'email',
        recipient: 'jane@example.com',
        status: 'delivered',
      })
    )
  })

  it('marks as failed when adapter errors', async () => {
    mockSend.mockResolvedValueOnce({ success: false, error: 'SMTP timeout' })

    const result = await processReminders()

    expect(result.failed).toBe(1)
    expect(result.errors).toContain('Reminder rem-1: SMTP timeout')
    expect(mockLogInsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'failed', error_message: 'SMTP timeout' })
    )
  })
})
