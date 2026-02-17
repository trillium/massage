import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.stubEnv('GOOGLE_OAUTH_SECRET', 'test-secret-key')
vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client-id')
vi.stubEnv('GOOGLE_OAUTH_REFRESH', 'test-refresh')

vi.mock('@/lib/fetch/fetchSingleEvent', () => ({
  fetchSingleEvent: vi.fn(),
}))

vi.mock('lib/availability/updateCalendarEvent', () => ({
  default: vi.fn(),
}))

vi.mock('@/lib/messaging/push/admin/pushover', () => ({
  pushoverSendMessage: vi.fn(() => Promise.resolve(true)),
}))

import { POST } from '../route'
import { createEventToken } from '@/lib/eventToken'
import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import updateCalendarEvent from 'lib/availability/updateCalendarEvent'

const eventId = 'cal-event-123'
const email = 'client@example.com'
const futureDate = new Date(Date.now() + 86400000).toISOString()

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/event/cal-event-123/cancel', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockEvent = {
  id: eventId,
  summary: 'REQUEST: 90 minute massage with Test User - TrilliumMassage',
  status: 'confirmed',
  start: { dateTime: futureDate },
  end: { dateTime: futureDate },
}

describe('POST /api/event/[event_id]/cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchSingleEvent).mockResolvedValue(mockEvent as never)
    vi.mocked(updateCalendarEvent).mockResolvedValue({} as never)
  })

  it('cancels with a valid token', async () => {
    const token = createEventToken(eventId, email, futureDate)
    const res = await POST(makeRequest({ token }), { params: Promise.resolve({ event_id: eventId }) })
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(updateCalendarEvent).toHaveBeenCalledWith(eventId, { status: 'cancelled' })
  })

  it('rejects missing token', async () => {
    const res = await POST(makeRequest({}), { params: Promise.resolve({ event_id: eventId }) })
    expect(res.status).toBe(401)
  })

  it('rejects invalid token', async () => {
    const res = await POST(makeRequest({ token: 'garbage' }), {
      params: Promise.resolve({ event_id: eventId }),
    })
    expect(res.status).toBe(403)
  })

  it('returns success if already cancelled (idempotent)', async () => {
    vi.mocked(fetchSingleEvent).mockResolvedValue({ ...mockEvent, status: 'cancelled' } as never)
    const token = createEventToken(eventId, email, futureDate)
    const res = await POST(makeRequest({ token }), { params: Promise.resolve({ event_id: eventId }) })
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.message).toBe('Already cancelled')
    expect(updateCalendarEvent).not.toHaveBeenCalled()
  })

  it('returns 404 if event not found', async () => {
    vi.mocked(fetchSingleEvent).mockResolvedValue(null)
    const token = createEventToken(eventId, email, futureDate)
    const res = await POST(makeRequest({ token }), { params: Promise.resolve({ event_id: eventId }) })
    expect(res.status).toBe(404)
  })
})
