import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createFakeSupabase } from './fakeSupabase'

let fake = createFakeSupabase()
vi.mock('@/lib/supabase/server', () => ({ getSupabaseAdminClient: () => fake.client }))
vi.mock('../client', () => ({ getSquareClient: vi.fn(), getSquareLocationId: vi.fn() }))

import { resolveCreateIdempotencyKey, writeInvoiceRecord, writeAuditLog } from '../invoice'

const result = {
  invoiceId: 'inv_sq',
  invoiceUrl: 'https://sq/x',
  invoiceNumber: '1',
  status: 'UNPAID',
  version: 1,
  orderId: 'o1',
  customerId: 'c1',
}

beforeEach(() => {
  fake = createFakeSupabase({}, { uniqueKeys: { invoices: 'booking_id' } })
})

describe('resolveCreateIdempotencyKey', () => {
  it('persists the first key and reuses it on retry with a new key', async () => {
    expect(await resolveCreateIdempotencyKey('b1', 'key-A')).toBe('key-A')
    expect(await resolveCreateIdempotencyKey('b1', 'key-B')).toBe('key-A')
  })

  it('keeps keys separate per booking', async () => {
    await resolveCreateIdempotencyKey('b1', 'key-A')
    expect(await resolveCreateIdempotencyKey('b2', 'key-B')).toBe('key-B')
  })
})

describe('writeInvoiceRecord', () => {
  it('is a no-op success when the same Square invoice is already stored (retry)', async () => {
    await writeInvoiceRecord('b1', result, 'a@b.c', 1000, 'USD')
    await expect(writeInvoiceRecord('b1', result, 'a@b.c', 1000, 'USD')).resolves.toBeUndefined()
    expect(fake.tables.invoices).toHaveLength(1)
    expect(fake.tables.invoices[0].square_version).toBe(1)
  })

  it('throws when a different Square invoice already exists for the booking', async () => {
    await writeInvoiceRecord('b1', result, 'a@b.c', 1000, 'USD')
    await expect(
      writeInvoiceRecord('b1', { ...result, invoiceId: 'other' }, 'a@b.c', 1000, 'USD')
    ).rejects.toThrow(/Failed to write invoice record/)
  })
})

describe('writeAuditLog', () => {
  it('swallows duplicate idempotency keys', async () => {
    const entry = { bookingId: 'b1', eventType: 'x', eventSource: 'api', idempotencyKey: 'k' }
    await writeAuditLog(entry)
    await writeAuditLog(entry)
    expect(fake.tables.invoice_audit_log).toHaveLength(1)
  })
})
