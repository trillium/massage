import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

vi.mock('lib/availability/updateCalendarEvent', () => ({
  default: vi.fn(),
}))

vi.mock('lib/hash', () => ({
  getHash: vi.fn(),
}))

vi.mock('lib/messaging/templates/events/eventSummary', () => ({
  default: vi.fn(() => '60 minute massage with Jane Doe - TrilliumMassage'),
}))

vi.mock('lib/messaging/templates/events/eventDescription', () => ({
  default: vi.fn(async () => '<p>Event description HTML</p>'),
}))

vi.mock('@/lib/adminAuth', () => ({
  AdminAuthManager: {
    generateAdminLink: vi.fn(
      () => 'http://localhost/admin?email=admin%40test.com&token=admin-token-123'
    ),
  },
}))

vi.mock('@/data/siteMetadata', () => ({
  default: { email: 'admin@test.com' },
}))

import updateCalendarEvent from 'lib/availability/updateCalendarEvent'
import { getHash } from 'lib/hash'

const validAppointment = {
  calendarEventId: 'cal-event-123',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  start: '2026-03-15T10:00:00-07:00',
  end: '2026-03-15T11:00:00-07:00',
  timeZone: 'America/Los_Angeles',
  locationString: '123 Main St, Los Angeles, 90001',
  duration: '60',
  phone: '555-1234',
  eventBaseString: '__EVENT__',
}

function confirmUrl(data: Record<string, unknown>, key: string, mock = false) {
  const encoded = encodeURIComponent(JSON.stringify(data))
  const url = new URL('http://localhost/api/confirm')
  url.searchParams.set('data', encoded)
  url.searchParams.set('key', key)
  if (mock) url.searchParams.set('mock', 'true')
  return new NextRequest(url)
}

beforeEach(() => {
  vi.mocked(getHash).mockReturnValue('valid-hash')
})

describe('/api/confirm', () => {
  it('redirects to /admin/booked on success with locationString', async () => {
    vi.mocked(updateCalendarEvent).mockResolvedValue({
      htmlLink: 'https://calendar.google.com/calendar/event?eid=abc123',
      attendees: [{ email: 'jane@example.com', displayName: 'Jane' }],
    })

    const res = await GET(confirmUrl(validAppointment, 'valid-hash'))

    expect(res.status).toBe(307)
    const location = res.headers.get('location')!
    expect(location).toContain('/admin/booked')
    expect(location).toContain('data=')
    expect(location).toContain('url=')
    expect(updateCalendarEvent).toHaveBeenCalledWith('cal-event-123', expect.any(Object))
  })

  it('redirects on success with locationObject', async () => {
    const data = {
      ...validAppointment,
      locationString: undefined,
      locationObject: { street: '123 Main St', city: 'Los Angeles', zip: '90001' },
    }
    delete (data as Record<string, unknown>).locationString

    vi.mocked(updateCalendarEvent).mockResolvedValue({
      htmlLink: 'https://calendar.google.com/calendar/event?eid=xyz789',
      attendees: [{ email: 'jane@example.com', displayName: 'Jane' }],
    })

    const res = await GET(confirmUrl(data, 'valid-hash'))

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/admin/booked')
  })

  it('skips calendar update in mock mode', async () => {
    const res = await GET(confirmUrl(validAppointment, 'valid-hash', true))

    expect(res.status).toBe(307)
    expect(updateCalendarEvent).not.toHaveBeenCalled()
  })

  it('returns 400 when data param is missing', async () => {
    const req = new NextRequest('http://localhost/api/confirm')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Data is missing')
  })

  it('returns 403 when hash does not match', async () => {
    const res = await GET(confirmUrl(validAppointment, 'wrong-hash'))
    const json = await res.json()

    expect(res.status).toBe(403)
    expect(json.error).toBe('Invalid key')
  })

  it('returns 400 when calendarEventId is missing', async () => {
    const { calendarEventId: _, ...noCalId } = validAppointment
    const res = await GET(confirmUrl(noCalId, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Missing calendarEventId')
  })

  it('returns 400 on Zod validation failure', async () => {
    const badData = {
      calendarEventId: 'cal-123',
      firstName: 'Jane',
    }

    const res = await GET(confirmUrl(badData, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Malformed request')
  })

  it('returns 400 on invalid date format', async () => {
    const badDates = {
      ...validAppointment,
      start: 'not-a-date',
      end: 'also-not-a-date',
    }

    const res = await GET(confirmUrl(badDates, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(400)
  })

  it('returns 400 when location info is missing', async () => {
    const noLocation = { ...validAppointment }
    delete (noLocation as Record<string, unknown>).locationString

    const res = await GET(confirmUrl(noLocation, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(400)
  })

  it('returns 404 when calendar update fails', async () => {
    vi.mocked(updateCalendarEvent).mockRejectedValue(new Error('calendar error'))

    const res = await GET(confirmUrl(validAppointment, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.error).toContain('already been declined or cancelled')
  })

  it('returns 500 when htmlLink has no eid match', async () => {
    vi.mocked(updateCalendarEvent).mockResolvedValue({
      htmlLink: 'https://calendar.google.com/calendar/event?nope=nothing',
      attendees: [],
    })

    const res = await GET(confirmUrl(validAppointment, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toContain('Error trying to confirm')
  })
})
