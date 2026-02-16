import { getHash } from '@/lib/hash'
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'
import { OnSiteRequestType } from '@/lib/types'
import { z } from 'zod'
import { AppointmentRequestSchema } from '@/lib/schema'

function buildApprovalUrl(
  headers: Headers | ReadonlyHeaders,
  data: Record<string, unknown>,
  endpoint: string,
  getHashFn?: typeof getHash
): string {
  const hash = getHashFn ? getHashFn(JSON.stringify(data)) : getHash(JSON.stringify(data))
  return `${headers.get('origin') ?? '?'}${endpoint}?data=${encodeURIComponent(JSON.stringify(data))}&key=${hash}`
}

type ApprovalUrl = {
  headers: ReadonlyHeaders
  data: OnSiteRequestType
}

export function createOnsiteApprovalUrl({ headers, data }: ApprovalUrl) {
  return buildApprovalUrl(headers, data, '/api/onsite/confirm/')
}

/**
 * Generates an approval URL for appointment confirmation
 */
export function createGeneralApprovalUrl(
  headers: Headers,
  data: z.output<typeof AppointmentRequestSchema>,
  getHashFn: typeof getHash
): string {
  return buildApprovalUrl(headers, data, '/api/confirm/', getHashFn)
}

export function createConfirmUrl(
  origin: string,
  calendarEventId: string,
  data: z.output<typeof AppointmentRequestSchema>,
  getHashFn: typeof getHash
): string {
  const payload = { ...data, calendarEventId }
  const hash = getHashFn(JSON.stringify(payload))
  return `${origin}/api/confirm?data=${encodeURIComponent(JSON.stringify(payload))}&key=${hash}`
}

export function createDeclineUrl(
  origin: string,
  calendarEventId: string,
  getHashFn: typeof getHash
): string {
  const payload = { calendarEventId }
  const hash = getHashFn(JSON.stringify(payload))
  return `${origin}/api/decline?data=${encodeURIComponent(JSON.stringify(payload))}&key=${hash}`
}
