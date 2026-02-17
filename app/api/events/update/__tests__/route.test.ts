import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { PATCH, POST } from '../route'

vi.mock('@/lib/adminAuthBridge', () => ({
  requireAdminWithFlag: vi.fn(),
}))

vi.mock('lib/availability/getAccessToken', () => ({
  default: vi.fn(() => 'mock-access-token'),
}))

import { requireAdminWithFlag } from '@/lib/adminAuthBridge'

const validAdmin = { email: 'admin@test.com' }

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/events/update', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requireAdminWithFlag).mockResolvedValue(validAdmin)
})

describe('/api/events/update', () => {
  it('returns 400 when eventId is missing', async () => {
    const res = await PATCH(makeRequest({ updateData: { summary: 'New' } }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Event ID is required')
  })

  it('returns 400 when updateData is empty', async () => {
    const res = await PATCH(makeRequest({ eventId: 'evt-1', updateData: {} }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Update data is required')
  })

  it('returns 401 when not admin', async () => {
    const { NextResponse } = await import('next/server')
    vi.mocked(requireAdminWithFlag).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )

    const res = await PATCH(makeRequest({ eventId: 'evt-1', updateData: { summary: 'New' } }))
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
  })

  it('calls Google Calendar API on valid request', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ id: 'evt-1', summary: 'Updated' }),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const res = await PATCH(makeRequest({ eventId: 'evt-1', updateData: { summary: 'Updated' } }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('evt-1'),
      expect.objectContaining({ method: 'PATCH' })
    )
  })

  it('POST aliases to PATCH', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ id: 'evt-1', summary: 'Updated' }),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const req = new NextRequest('http://localhost/api/events/update', {
      method: 'POST',
      body: JSON.stringify({ eventId: 'evt-1', updateData: { summary: 'Updated' } }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
