import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createFakeSupabase } from '@/lib/square/__tests__/fakeSupabase'

const verifySignature = vi.fn()
vi.mock('square', () => ({
  WebhooksHelper: { verifySignature: (a: unknown) => verifySignature(a) },
}))

let fake = createFakeSupabase()
vi.mock('@/lib/supabase/server', () => ({ getSupabaseAdminClient: () => fake.client }))

const writeAuditLog = vi.fn()
vi.mock('@/lib/square/invoiceRecords', () => ({ writeAuditLog: (e: unknown) => writeAuditLog(e) }))

import { POST } from '../route'

function req(body: string, signature: string | null = 'sig') {
  const headers: Record<string, string> = {}
  if (signature) headers['x-square-hmacsha256-signature'] = signature
  return new NextRequest('http://localhost/api/webhooks/square', { method: 'POST', body, headers })
}

function evt(eventId: string, status: string, version: number) {
  return JSON.stringify({
    type: 'invoice.updated',
    event_id: eventId,
    data: {
      type: 'invoice',
      id: 'inv_sq',
      object: { invoice: { id: 'inv_sq', order_id: 'o1', status, version } },
    },
  })
}

function seedInvoice(extra: Record<string, unknown> = {}) {
  return {
    invoices: [
      {
        id: 'inv1',
        booking_id: 'b1',
        square_invoice_id: 'inv_sq',
        status: 'UNPAID',
        square_version: 1,
        ...extra,
      },
    ],
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = 'key'
  process.env.SQUARE_WEBHOOK_URL = 'https://example.com/api/webhooks/square'
  verifySignature.mockResolvedValue(true)
  fake = createFakeSupabase(seedInvoice())
})

describe('square webhook', () => {
  it('rejects a missing signature', async () => {
    expect((await POST(req(evt('e1', 'PAID', 2), null))).status).toBe(401)
  })

  it('rejects an invalid signature without touching the db', async () => {
    verifySignature.mockResolvedValue(false)
    expect((await POST(req(evt('e1', 'PAID', 2)))).status).toBe(401)
    expect(fake.tables.square_webhook_events ?? []).toHaveLength(0)
  })

  it('returns 400 on malformed JSON', async () => {
    expect((await POST(req('{not json'))).status).toBe(400)
  })

  it('returns 400 when event_id is missing', async () => {
    expect((await POST(req('{"type":"invoice.updated"}'))).status).toBe(400)
  })

  it('applies a newer event and records it in the inbox', async () => {
    const res = await POST(req(evt('e1', 'PAID', 2)))
    expect(res.status).toBe(200)
    expect(fake.tables.invoices[0]).toMatchObject({ status: 'PAID', square_version: 2 })
    expect(fake.tables.invoices[0].paid_at).toBeTruthy()
    expect(fake.tables.square_webhook_events[0].processed_at).toBeTruthy()
  })

  it('acks a duplicate event without re-applying it', async () => {
    await POST(req(evt('e1', 'PAID', 2)))
    fake.tables.invoices[0].status = 'REFUNDED' // sentinel: a re-apply would overwrite this
    writeAuditLog.mockClear()
    const res = await POST(req(evt('e1', 'PAID', 2)))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Duplicate')
    expect(fake.tables.invoices[0].status).toBe('REFUNDED')
    expect(writeAuditLog).not.toHaveBeenCalled()
  })

  it('ignores an out-of-order older event', async () => {
    await POST(req(evt('e2', 'PAID', 3)))
    const res = await POST(req(evt('e1', 'UNPAID', 2)))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Stale')
    expect(fake.tables.invoices[0]).toMatchObject({ status: 'PAID', square_version: 3 })
  })

  it('applies to a row with no stored version', async () => {
    fake = createFakeSupabase(seedInvoice({ square_version: null }))
    await POST(req(evt('e1', 'PAID', 1)))
    expect(fake.tables.invoices[0].status).toBe('PAID')
  })

  it('surfaces update errors as 500 and leaves the event unprocessed for retry', async () => {
    fake = createFakeSupabase(seedInvoice(), { failUpdates: ['invoices'] })
    const res = await POST(req(evt('e1', 'PAID', 2)))
    expect(res.status).toBe(500)
    expect(fake.tables.square_webhook_events[0].processed_at).toBeUndefined()
  })

  it('retries an unprocessed event on redelivery', async () => {
    fake.tables.square_webhook_events = [{ event_id: 'e1', event_type: 'invoice.updated' }]
    const res = await POST(req(evt('e1', 'PAID', 2)))
    expect(res.status).toBe(200)
    expect(fake.tables.invoices[0].status).toBe('PAID')
  })

  it('returns 500 for an unknown invoice so Square redelivers', async () => {
    fake = createFakeSupabase({ invoices: [] })
    expect((await POST(req(evt('e1', 'PAID', 2)))).status).toBe(500)
  })
})
