import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

vi.mock('lib/hash', () => ({
  getHash: vi.fn(),
}))

vi.mock('lib/availability/deleteCalendarEvent', () => ({
  default: vi.fn(),
}))

vi.mock('@/lib/appointments/getAppointmentByCalendarEventId', () => ({
  getAppointmentByCalendarEventId: vi.fn(),
}))

vi.mock('@/lib/appointments/updateAppointmentStatus', () => ({
  updateAppointmentStatus: vi.fn(() => Promise.resolve()),
}))

import { getHash } from 'lib/hash'
import deleteCalendarEvent from 'lib/availability/deleteCalendarEvent'
import { getAppointmentByCalendarEventId } from '@/lib/appointments/getAppointmentByCalendarEventId'

function declineUrl(data: Record<string, unknown>, key: string) {
  const encoded = encodeURIComponent(JSON.stringify(data))
  const url = new URL('http://localhost/api/decline')
  url.searchParams.set('data', encoded)
  url.searchParams.set('key', key)
  return new NextRequest(url)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getHash).mockReturnValue('valid-hash')
})

describe('/api/decline', () => {
  it('deletes calendar event on valid request', async () => {
    vi.mocked(deleteCalendarEvent).mockResolvedValue({ success: true })

    const res = await GET(declineUrl({ calendarEventId: 'cal-123' }, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(deleteCalendarEvent).toHaveBeenCalledWith('cal-123')
  })

  it('returns 400 when data param is missing', async () => {
    const req = new NextRequest('http://localhost/api/decline')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Data is missing')
  })

  it('returns 403 when hash does not match', async () => {
    const res = await GET(declineUrl({ calendarEventId: 'cal-123' }, 'wrong-hash'))
    const json = await res.json()

    expect(res.status).toBe(403)
    expect(json.error).toBe('Invalid key')
  })

  it('returns 400 when calendarEventId is missing', async () => {
    const res = await GET(declineUrl({ foo: 'bar' }, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Missing calendarEventId')
  })

  it('returns 500 when deleteCalendarEvent fails', async () => {
    vi.mocked(deleteCalendarEvent).mockRejectedValue(new Error('calendar error'))

    const res = await GET(declineUrl({ calendarEventId: 'cal-123' }, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Failed to decline appointment')
  })

  it('returns 200 noop when appointment already cancelled', async () => {
    vi.mocked(getAppointmentByCalendarEventId).mockResolvedValue({
      id: 'appt-1',
      calendar_event_id: 'cal-123',
      status: 'cancelled',
      client_email: 'jane@example.com',
      client_phone: '555-1234',
      client_first_name: 'Jane',
      client_last_name: 'Doe',
      location: '123 Main St',
      timezone: 'America/Los_Angeles',
      start_time: '2026-03-15T10:00:00-07:00',
      end_time: '2026-03-15T11:00:00-07:00',
      duration_minutes: 60,
      price: null,
      promo: null,
      booking_url: null,
      slug_config: null,
      source: null,
      instant_confirm: false,
      created_at: '2026-03-01T00:00:00Z',
      updated_at: '2026-03-01T00:00:00Z',
      confirmed_at: null,
      cancelled_at: '2026-03-01T01:00:00Z',
    })

    const res = await GET(declineUrl({ calendarEventId: 'cal-123' }, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(deleteCalendarEvent).not.toHaveBeenCalled()
  })

  it('returns 409 when appointment already confirmed', async () => {
    vi.mocked(getAppointmentByCalendarEventId).mockResolvedValue({
      id: 'appt-2',
      calendar_event_id: 'cal-123',
      status: 'confirmed',
      client_email: 'jane@example.com',
      client_phone: '555-1234',
      client_first_name: 'Jane',
      client_last_name: 'Doe',
      location: '123 Main St',
      timezone: 'America/Los_Angeles',
      start_time: '2026-03-15T10:00:00-07:00',
      end_time: '2026-03-15T11:00:00-07:00',
      duration_minutes: 60,
      price: null,
      promo: null,
      booking_url: null,
      slug_config: null,
      source: null,
      instant_confirm: false,
      created_at: '2026-03-01T00:00:00Z',
      updated_at: '2026-03-01T01:00:00Z',
      confirmed_at: '2026-03-01T01:00:00Z',
      cancelled_at: null,
    })

    const res = await GET(declineUrl({ calendarEventId: 'cal-123' }, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(409)
    expect(json.error).toContain('confirmed')
  })
})
