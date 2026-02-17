import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

vi.mock('@/lib/adminAuthBridge', () => ({
  requireAdminWithFlag: vi.fn().mockResolvedValue({ email: 'admin@test.com' }),
}))

vi.mock('lib/fetch/fetchSingleEvent', () => ({
  fetchSingleEvent: vi.fn(),
}))

import { fetchSingleEvent } from 'lib/fetch/fetchSingleEvent'

describe('/api/events/[event_id]', () => {
  it('returns event for valid ID', async () => {
    const mockEvent = { id: 'evt-1', summary: 'Massage' }
    vi.mocked(fetchSingleEvent).mockResolvedValue(mockEvent as never)

    const req = new NextRequest('http://localhost/api/events/evt-1')
    const res = await GET(req, { params: Promise.resolve({ event_id: 'evt-1' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.event.id).toBe('evt-1')
  })

  it('returns 400 when event_id is empty', async () => {
    const req = new NextRequest('http://localhost/api/events/')
    const res = await GET(req, { params: Promise.resolve({ event_id: '' }) })
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Event ID is required')
  })

  it('returns 404 when event not found', async () => {
    vi.mocked(fetchSingleEvent).mockResolvedValue(null as never)

    const req = new NextRequest('http://localhost/api/events/missing')
    const res = await GET(req, { params: Promise.resolve({ event_id: 'missing' }) })
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.error).toBe('Event not found')
  })

  it('returns 500 on fetch error', async () => {
    vi.mocked(fetchSingleEvent).mockRejectedValue(new Error('network'))

    const req = new NextRequest('http://localhost/api/events/evt-1')
    const res = await GET(req, { params: Promise.resolve({ event_id: 'evt-1' }) })
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Failed to fetch calendar event')
  })
})
