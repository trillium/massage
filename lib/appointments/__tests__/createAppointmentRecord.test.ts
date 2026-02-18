import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdminClient: () => ({
    from: () => ({
      insert: (data: unknown) => mockInsert(data),
    }),
  }),
}))

import { createAppointmentRecord } from '../createAppointmentRecord'

beforeEach(() => {
  vi.clearAllMocks()
  mockInsert.mockReturnValue({ error: null })
})

const bookingData = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '555-1234',
  start: '2026-03-01T10:00:00-08:00',
  end: '2026-03-01T11:30:00-08:00',
  duration: '90',
  timeZone: 'America/Los_Angeles',
  locationString: '123 Main St, Portland',
  price: '150',
  promo: 'SPRING10',
  bookingUrl: '/book/90',
}

describe('createAppointmentRecord', () => {
  it('maps booking data to appointment row', async () => {
    await createAppointmentRecord('cal-123', bookingData, 'confirmed')

    expect(mockInsert).toHaveBeenCalledOnce()
    const record = mockInsert.mock.calls[0][0]
    expect(record.calendar_event_id).toBe('cal-123')
    expect(record.client_email).toBe('jane@example.com')
    expect(record.client_first_name).toBe('Jane')
    expect(record.client_last_name).toBe('Doe')
    expect(record.duration_minutes).toBe(90)
    expect(record.price).toBe(150)
    expect(record.status).toBe('confirmed')
    expect(record.promo).toBe('SPRING10')
    expect(record.confirmed_at).toBeTruthy()
  })

  it('defaults to pending status', async () => {
    await createAppointmentRecord('cal-456', bookingData)

    const record = mockInsert.mock.calls[0][0]
    expect(record.status).toBe('pending')
    expect(record.confirmed_at).toBeNull()
  })

  it('handles locationObject', async () => {
    const data = {
      ...bookingData,
      locationObject: { street: '456 Oak Ave', city: 'Portland', zip: '97201' },
      locationString: undefined,
    }
    await createAppointmentRecord('cal-789', data, 'pending')

    const record = mockInsert.mock.calls[0][0]
    expect(record.location).toBe('456 Oak Ave, Portland 97201')
  })

  it('logs error but does not throw', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockInsert.mockImplementationOnce(() => ({ error: { message: 'DB error' } }))

    await expect(createAppointmentRecord('cal-err', bookingData)).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalled()
  })
})
