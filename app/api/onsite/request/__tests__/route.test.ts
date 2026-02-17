import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

vi.mock('lib/email', () => ({
  default: vi.fn(() => Promise.resolve()),
}))

vi.mock('lib/hash', () => ({
  getHash: vi.fn(() => 'mock-hash'),
}))

vi.mock('@/data/siteMetadata', () => ({
  default: { email: 'admin@test.com' },
}))

let testIp = 0

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: (key: string) => {
      if (key === 'x-forwarded-for') return `10.1.${Math.floor(testIp / 255)}.${testIp % 255}`
      if (key === 'origin') return 'http://localhost'
      return null
    },
  })),
}))

vi.mock('lib/messaging/push/admin/pushover', () => ({
  pushoverSendMessage: vi.fn(),
}))

import sendMail from 'lib/email'

const validOnsiteRequest = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '555-1234',
  start: '2026-03-15T10:00:00-07:00',
  end: '2026-03-15T11:00:00-07:00',
  timeZone: 'America/Los_Angeles',
  locationString: '123 Main St, Los Angeles, 90001',
  duration: '60',
  price: '100',
  eventBaseString: 'base',
  eventMemberString: 'member',
  paymentMethod: 'cash',
  eventContainerString: 'container',
  allowedDurations: [60, 90, 120],
  eventName: 'Chair Massage',
  paymentOptions: 'cash',
  leadTime: 180,
}

function makeRequest(body: Record<string, unknown>) {
  testIp++
  return new NextRequest('http://localhost/api/onsite/request', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('/api/onsite/request', () => {
  it('sends admin and client emails for valid request', async () => {
    const res = await POST(makeRequest(validOnsiteRequest))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(sendMail).toHaveBeenCalledTimes(2)
  })

  it('returns 400 for invalid data', async () => {
    const res = await POST(makeRequest({ firstName: 'Jane' }))

    expect(res.status).toBe(400)
  })
})
