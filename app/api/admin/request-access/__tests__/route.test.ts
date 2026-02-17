import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

vi.mock('@/lib/email', () => ({
  default: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/adminAuth', () => ({
  AdminAuthManager: {
    generateAdminLink: vi.fn(() => 'http://localhost/admin?token=abc'),
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: (key: string) => {
      if (key === 'x-forwarded-for')
        return `10.2.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      if (key === 'origin') return 'http://localhost'
      return null
    },
  })),
}))

import sendMail from '@/lib/email'

const originalEnv = process.env

beforeEach(() => {
  vi.clearAllMocks()
  process.env = { ...originalEnv, ADMIN_EMAILS: 'admin@test.com,admin2@test.com' }
})

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/admin/request-access', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('/api/admin/request-access', () => {
  it('sends admin link for authorized email', async () => {
    const res = await POST(
      makeRequest({ email: 'admin@test.com', requestReason: 'Need to manage appointments' })
    )
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.message).toContain('sent to your email')
    expect(sendMail).toHaveBeenCalledTimes(1)
  })

  it('returns 200 for unauthorized email without revealing status', async () => {
    const res = await POST(
      makeRequest({ email: 'hacker@evil.com', requestReason: 'Want admin access please' })
    )
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid data', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Invalid request data')
  })

  it('returns 400 when reason is too short', async () => {
    const res = await POST(makeRequest({ email: 'admin@test.com', requestReason: 'short' }))
    const json = await res.json()

    expect(res.status).toBe(400)
  })
})
