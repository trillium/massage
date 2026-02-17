import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

vi.mock('lib/email', () => ({
  default: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/data/siteMetadata', () => ({
  default: { email: 'admin@test.com' },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: (key: string) => {
      if (key === 'x-forwarded-for')
        return `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      return null
    },
  })),
}))

import sendMail from 'lib/email'

const validReview = {
  firstName: 'Jane',
  lastName: 'Doe',
  text: 'Great massage!',
  date: '2026-03-15T10:00:00-07:00',
  rating: 5,
  source: 'Trillium Massage',
  type: 'table',
}

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/review/create', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('/api/review/create', () => {
  it('sends review email and returns success for valid data', async () => {
    const res = await POST(makeRequest(validReview))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(sendMail).toHaveBeenCalledTimes(1)
  })

  it('accepts string rating', async () => {
    const res = await POST(makeRequest({ ...validReview, rating: '4' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('returns 400 for invalid data', async () => {
    const res = await POST(makeRequest({ firstName: 'Jane' }))

    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid date', async () => {
    const res = await POST(makeRequest({ ...validReview, date: 'not-a-date' }))

    expect(res.status).toBe(400)
  })

  it('returns 400 for out-of-range rating', async () => {
    const res = await POST(makeRequest({ ...validReview, rating: 6 }))

    expect(res.status).toBe(400)
  })
})
