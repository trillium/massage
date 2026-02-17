import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'

vi.mock('@/lib/adminAuth', () => ({
  AdminAuthManager: {
    requireAdmin: vi.fn(),
  },
}))

vi.mock('@/lib/gmail/searchSootheEmails', () => ({
  searchSootheEmails: vi.fn(),
}))

import { AdminAuthManager } from '@/lib/adminAuth'
import { searchSootheEmails } from '@/lib/gmail/searchSootheEmails'

const validAdmin = { email: 'admin@test.com' }

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/admin/gmail/soothe-bookings')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return new Request(url.toString())
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(AdminAuthManager.requireAdmin).mockReturnValue(validAdmin)
})

describe('/api/admin/gmail/soothe-bookings', () => {
  it('returns bookings for authenticated admin', async () => {
    vi.mocked(searchSootheEmails).mockResolvedValue({
      bookings: [
        {
          clientName: 'Jane',
          sessionType: 'Swedish',
          duration: 60,
          isCouples: false,
          location: '123 Main St',
          payout: 100,
          tip: 20,
          notes: '',
          extraServices: [],
          rawMessage: {
            id: 'msg-1',
            internalDate: String(Date.now()),
            payload: { headers: [{ name: 'Subject', value: 'Booking' }] },
          },
        },
      ] as never,
      failedMessageIds: [],
    })

    const res = await GET(makeRequest())
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.count).toBe(1)
  })

  it('returns 401 when not admin', async () => {
    const { NextResponse } = await import('next/server')
    vi.mocked(AdminAuthManager.requireAdmin).mockReturnValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )

    const res = await GET(makeRequest())
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 500 on search error', async () => {
    vi.mocked(searchSootheEmails).mockRejectedValue(new Error('Gmail API error'))

    const res = await GET(makeRequest())
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.success).toBe(false)
  })
})
