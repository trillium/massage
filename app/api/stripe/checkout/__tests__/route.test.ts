import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

const single = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdminClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ single }) }) }),
  }),
}))

const createCheckoutSession = vi.fn()
vi.mock('@/lib/stripe/checkout', () => ({
  createCheckoutSession: (...args: unknown[]) => createCheckoutSession(...args),
}))

const bookingId = '11111111-1111-4111-8111-111111111111'

const request = (body: unknown) =>
  new NextRequest('http://localhost:9876/api/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
  })

const booking = (overrides = {}) => ({
  id: bookingId,
  client_email: 'a@b.com',
  price: 12000,
  duration_minutes: 60,
  slug_config: null,
  status: 'confirmed',
  paid_at: null,
  ...overrides,
})

describe('POST /api/stripe/checkout', () => {
  beforeEach(() => {
    single.mockReset()
    createCheckoutSession.mockReset()
  })

  it('rejects an invalid body', async () => {
    const res = await POST(request({ bookingId: 'nope' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 for an unknown booking', async () => {
    single.mockResolvedValue({ data: null })
    const res = await POST(request({ bookingId }))
    expect(res.status).toBe(404)
  })

  it('refuses unconfirmed bookings', async () => {
    single.mockResolvedValue({ data: booking({ status: 'pending' }) })
    const res = await POST(request({ bookingId }))
    expect(res.status).toBe(409)
  })

  it('refuses already paid bookings', async () => {
    single.mockResolvedValue({ data: booking({ paid_at: '2026-01-01T00:00:00Z' }) })
    const res = await POST(request({ bookingId }))
    expect(res.status).toBe(409)
  })

  it('skips payment for $0 bookings', async () => {
    single.mockResolvedValue({ data: booking({ price: 0 }) })
    const res = await POST(request({ bookingId }))
    expect(res.status).toBe(400)
    expect(createCheckoutSession).not.toHaveBeenCalled()
  })

  it('returns the checkout url for a confirmed priced booking', async () => {
    single.mockResolvedValue({ data: booking() })
    createCheckoutSession.mockResolvedValue({
      id: 'cs_test_1',
      url: 'https://checkout.stripe.com/x',
    })
    const res = await POST(request({ bookingId }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      url: 'https://checkout.stripe.com/x',
      sessionId: 'cs_test_1',
    })
  })
})
