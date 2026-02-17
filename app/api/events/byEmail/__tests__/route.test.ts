import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

vi.mock('@/lib/adminAuth', () => ({
  AdminAuthManager: {
    requireAdmin: () => ({ email: 'admin@test.com' }),
  },
}))

vi.mock('@/lib/availability/getEventsBySearchQuery', () => ({
  getEventsBySearchQuery: vi.fn(),
}))

import { getEventsBySearchQuery } from '@/lib/availability/getEventsBySearchQuery'

describe('/api/events/byEmail', () => {
  it('returns sorted events for valid email', async () => {
    const mockEvents = [
      { start: { dateTime: '2026-01-01T10:00:00Z' } },
      { start: { dateTime: '2026-03-01T10:00:00Z' } },
    ]
    vi.mocked(getEventsBySearchQuery).mockResolvedValue(mockEvents as never)

    const req = new NextRequest('http://localhost/api/events/byEmail?email=test@example.com')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.count).toBe(2)
    expect(json.events[0].start.dateTime).toBe('2026-03-01T10:00:00Z')
  })

  it('returns 400 when email is missing', async () => {
    const req = new NextRequest('http://localhost/api/events/byEmail')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Email parameter is required')
  })

  it('returns 500 when search fails', async () => {
    vi.mocked(getEventsBySearchQuery).mockRejectedValue(new Error('API down'))

    const req = new NextRequest('http://localhost/api/events/byEmail?email=test@example.com')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.success).toBe(false)
  })
})
