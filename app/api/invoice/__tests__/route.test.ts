import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/adminAuthBridge', () => ({ requireAdminWithFlag: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ getSupabaseAdminClient: vi.fn() }))
vi.mock('@/lib/square/client', () => ({ getSquareClient: vi.fn() }))
vi.mock('@/lib/square/invoice', () => ({
  createAndPublishInvoice: vi.fn(),
  writeInvoiceRecord: vi.fn(),
  writeAuditLog: vi.fn(),
}))

import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { createAndPublishInvoice, writeInvoiceRecord } from '@/lib/square/invoice'
import { POST } from '../route'
import { PATCH } from '../[invoiceId]/update-email/route'

const bookingId = '11111111-1111-4111-8111-111111111111'
const deny = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

function makeSupabase(price: number | null) {
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () =>
            table === 'appointments'
              ? {
                  data: {
                    id: bookingId,
                    price,
                    client_email: 'a@b.co',
                    client_first_name: 'A',
                    client_last_name: 'B',
                    duration_minutes: 60,
                    start_time: '2026-03-15T10:00:00Z',
                    slug_config: null,
                  },
                  error: null,
                }
              : { data: null, error: null },
        }),
      }),
    }),
  }
}

const postReq = () =>
  new NextRequest('http://localhost/api/invoice', {
    method: 'POST',
    body: JSON.stringify({ bookingId, idempotencyKey: 'k' }),
  })

describe('invoice auth gate', () => {
  beforeEach(() => vi.clearAllMocks())

  it('POST /api/invoice rejects unauthenticated requests', async () => {
    vi.mocked(requireAdminWithFlag).mockResolvedValue(deny())
    const res = await POST(postReq())
    expect(res.status).toBe(401)
    expect(getSupabaseAdminClient).not.toHaveBeenCalled()
    expect(createAndPublishInvoice).not.toHaveBeenCalled()
  })

  it('PATCH update-email rejects unauthenticated requests', async () => {
    vi.mocked(requireAdminWithFlag).mockResolvedValue(deny())
    const req = new NextRequest('http://localhost/api/invoice/inv/update-email', {
      method: 'PATCH',
      body: JSON.stringify({ newEmail: 'x@y.co', bookingId }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ invoiceId: 'inv' }) })
    expect(res.status).toBe(401)
    expect(getSupabaseAdminClient).not.toHaveBeenCalled()
  })
})

describe('invoice amount conversion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAdminWithFlag).mockResolvedValue({ email: 'admin@x.co' })
    vi.mocked(createAndPublishInvoice).mockResolvedValue({
      invoiceId: 'i',
      invoiceUrl: 'u',
      invoiceNumber: '1',
      status: 'UNPAID',
      orderId: 'o',
    } as never)
  })

  it('converts whole-dollar price to cents', async () => {
    vi.mocked(getSupabaseAdminClient).mockReturnValue(makeSupabase(120) as never)
    const res = await POST(postReq())
    expect(res.status).toBe(200)
    expect(vi.mocked(createAndPublishInvoice).mock.calls[0][0].amountCents).toBe(12000)
    expect(vi.mocked(writeInvoiceRecord).mock.calls[0][3]).toBe(12000)
  })

  it('rejects missing/zero price', async () => {
    vi.mocked(getSupabaseAdminClient).mockReturnValue(makeSupabase(null) as never)
    const res = await POST(postReq())
    expect(res.status).toBe(400)
    expect(createAndPublishInvoice).not.toHaveBeenCalled()
  })
})
