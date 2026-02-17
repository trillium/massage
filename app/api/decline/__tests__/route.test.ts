import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

vi.mock('lib/hash', () => ({
  getHash: vi.fn(),
}))

vi.mock('lib/availability/deleteCalendarEvent', () => ({
  default: vi.fn(),
}))

import { getHash } from 'lib/hash'
import deleteCalendarEvent from 'lib/availability/deleteCalendarEvent'

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
    vi.mocked(deleteCalendarEvent).mockResolvedValue(undefined)

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
})
