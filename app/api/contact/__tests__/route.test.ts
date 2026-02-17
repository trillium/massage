import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

vi.mock('@/lib/email', () => ({
  default: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/data/siteMetadata', () => ({
  default: { email: 'admin@test.com' },
}))

vi.mock('@/lib/messaging/push/admin/pushover', () => ({
  pushoverSendMessage: vi.fn(),
}))

vi.mock('@/lib/posthog-utils', () => ({
  identifyAuthenticatedUser: vi.fn(),
}))

import sendMail from '@/lib/email'

const validContact = {
  subject: 'Inquiry',
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '555-1234',
  message: 'I have a question about your services.',
}

let testIp = 0

function makeRequest(body: Record<string, unknown>) {
  testIp++
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': `10.0.0.${testIp}`,
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('/api/contact', () => {
  it('sends emails and returns success for valid data', async () => {
    const res = await POST(makeRequest(validContact))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(sendMail).toHaveBeenCalledTimes(2)
  })

  it('returns 400 for invalid data', async () => {
    const res = await POST(makeRequest({ subject: '' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Invalid form data')
  })

  it('returns 500 when sendMail throws', async () => {
    vi.mocked(sendMail).mockRejectedValueOnce(new Error('SMTP error'))

    const res = await POST(makeRequest(validContact))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Internal server error')
  })
})
