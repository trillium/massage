import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

const constructEvent = vi.fn()
vi.mock('@/lib/stripe/client', () => ({
  getStripeClient: () => ({ webhooks: { constructEvent } }),
  getStripeWebhookSecret: () => 'whsec_test',
}))

const isNull = vi.fn()
const eq = vi.fn(() => ({ is: isNull }))
const update = vi.fn(() => ({ eq }))
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdminClient: () => ({ from: () => ({ update }) }),
}))

const request = (signature?: string) =>
  new NextRequest('http://localhost:9876/api/webhooks/stripe', {
    method: 'POST',
    body: '{}',
    headers: signature ? { 'stripe-signature': signature } : {},
  })

const completedEvent = (overrides = {}) => ({
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_1',
      client_reference_id: 'appt-1',
      payment_status: 'paid',
      ...overrides,
    },
  },
})

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    constructEvent.mockReset()
    update.mockClear()
    eq.mockClear()
    isNull.mockReset()
    isNull.mockResolvedValue({ error: null })
  })

  it('rejects requests without a signature', async () => {
    const res = await POST(request())
    expect(res.status).toBe(401)
  })

  it('rejects an invalid signature without touching the database', async () => {
    constructEvent.mockImplementation(() => {
      throw new Error('bad signature')
    })
    const res = await POST(request('sig'))
    expect(res.status).toBe(400)
    expect(update).not.toHaveBeenCalled()
  })

  it('marks the appointment paid on a paid checkout session', async () => {
    constructEvent.mockReturnValue(completedEvent())
    const res = await POST(request('sig'))
    expect(res.status).toBe(200)
    expect(eq).toHaveBeenCalledWith('id', 'appt-1')
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ stripe_checkout_session_id: 'cs_test_1' })
    )
  })

  it('ignores unpaid sessions', async () => {
    constructEvent.mockReturnValue(completedEvent({ payment_status: 'unpaid' }))
    const res = await POST(request('sig'))
    expect(res.status).toBe(200)
    expect(update).not.toHaveBeenCalled()
  })

  it('ignores unrelated events', async () => {
    constructEvent.mockReturnValue({ type: 'charge.refunded', data: { object: {} } })
    const res = await POST(request('sig'))
    expect(res.status).toBe(200)
    expect(update).not.toHaveBeenCalled()
  })

  it('returns 500 when the database update fails so Stripe retries', async () => {
    constructEvent.mockReturnValue(completedEvent())
    isNull.mockResolvedValue({ error: { message: 'boom' } })
    const res = await POST(request('sig'))
    expect(res.status).toBe(500)
  })
})
