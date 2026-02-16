import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

vi.mock('lib/availability/createOnsiteAppointment', () => ({
  default: vi.fn(),
}))

vi.mock('lib/hash', () => ({
  getHash: vi.fn(),
}))

vi.mock('lib/messaging/templates/events/onsiteEventSummary', () => ({
  default: vi.fn(() => 'Onsite Event Summary'),
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

import createOnsiteAppointment from 'lib/availability/createOnsiteAppointment'
import { getHash } from 'lib/hash'

const validOnsiteData = {
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
  eventContainerString: '__CONTAINER__',
  paymentMethod: 'cash',
  allowedDurations: [60, 90],
  eventName: 'Corporate Wellness',
  paymentOptions: 'cash',
  leadTime: 24,
}

function confirmUrl(data: Record<string, unknown>, key: string) {
  const encoded = encodeURIComponent(JSON.stringify(data))
  const url = new URL('http://localhost/api/onsite/confirm')
  url.searchParams.set('data', encoded)
  url.searchParams.set('key', key)
  return new NextRequest(url)
}

function mockCalendarResponse(eid: string, attendees: Record<string, string>[] = []) {
  vi.mocked(createOnsiteAppointment).mockResolvedValue({
    json: async () => ({
      htmlLink: `https://calendar.google.com/calendar/event?eid=${eid}`,
      attendees,
    }),
  } as Response)
}

beforeEach(() => {
  vi.mocked(getHash).mockReturnValue('valid-hash')
})

describe('/api/onsite/confirm', () => {
  it('redirects to /admin/booked on success with locationString', async () => {
    mockCalendarResponse('onsite123', [{ email: 'jane@example.com', displayName: 'Jane' }])

    const res = await GET(confirmUrl(validOnsiteData, 'valid-hash'))

    expect(res.status).toBe(307)
    const location = res.headers.get('location')!
    expect(location).toContain('/admin/booked')
    expect(location).toContain('data=')
    expect(createOnsiteAppointment).toHaveBeenCalled()
  })

  it('redirects on success with locationObject', async () => {
    const data = {
      ...validOnsiteData,
      locationString: undefined,
      locationObject: { street: '123 Main St', city: 'Los Angeles', zip: '90001' },
    }
    delete (data as Record<string, unknown>).locationString

    mockCalendarResponse('onsite456', [{ email: 'jane@example.com', displayName: 'Jane' }])

    const res = await GET(confirmUrl(data, 'valid-hash'))

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/admin/booked')
  })

  it('passes transformed pricing to createOnsiteAppointment', async () => {
    const dataWithPricing = {
      ...validOnsiteData,
      pricing: { '60': 120, '90': 160 },
    }

    mockCalendarResponse('price789')

    const res = await GET(confirmUrl(dataWithPricing, 'valid-hash'))

    expect(res.status).toBe(307)
    expect(createOnsiteAppointment).toHaveBeenCalledWith(
      expect.objectContaining({
        pricing: { 60: 120, 90: 160 },
      })
    )
  })

  it('returns 400 when data param is missing', async () => {
    const req = new NextRequest('http://localhost/api/onsite/confirm')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Data is missing')
  })

  it('returns 403 when hash does not match', async () => {
    const res = await GET(confirmUrl(validOnsiteData, 'wrong-hash'))
    const json = await res.json()

    expect(res.status).toBe(403)
    expect(json.error).toBe('Invalid key')
  })

  it('returns 400 on Zod validation failure', async () => {
    const badData = { firstName: 'Jane' }
    const res = await GET(confirmUrl(badData, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Malformed request')
  })

  it('returns 400 on invalid date format', async () => {
    const badDates = {
      ...validOnsiteData,
      start: 'not-a-date',
      end: 'also-not',
    }
    const res = await GET(confirmUrl(badDates, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(400)
  })

  it('returns 400 when location info is missing', async () => {
    const noLocation = { ...validOnsiteData }
    delete (noLocation as Record<string, unknown>).locationString

    const res = await GET(confirmUrl(noLocation, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(400)
  })

  it('returns 500 when htmlLink has no eid match', async () => {
    vi.mocked(createOnsiteAppointment).mockResolvedValue({
      json: async () => ({
        htmlLink: 'https://calendar.google.com/calendar/event?id=nope',
        attendees: [],
      }),
    } as Response)

    const res = await GET(confirmUrl(validOnsiteData, 'valid-hash'))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toContain('Error trying to create')
  })
})
