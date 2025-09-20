import { getHash } from '@/lib/hash'
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'
import { OnSiteRequestType } from '@/lib/types'
import { z } from 'zod'
import { AppointmentRequestSchema } from '@/lib/schema'

type ApprovalUrl = {
  headers: ReadonlyHeaders
  data: OnSiteRequestType
}

export function createApprovalUrl({ headers, data }: ApprovalUrl) {
  return `${headers.get('origin') ?? '?'}/api/onsite/confirm/?data=${encodeURIComponent(
    JSON.stringify(data)
  )}&key=${getHash(JSON.stringify(data))}`
}

/**
 * Generates an approval URL for appointment confirmation
 */
export function generateApproveUrl(
  headers: Headers,
  data: z.output<typeof AppointmentRequestSchema>,
  getHashFn: typeof getHash
): string {
  return `${headers.get('origin') ?? '?'}\/api/confirm/?data=${encodeURIComponent(JSON.stringify(data))}&key=${getHashFn(JSON.stringify(data))}`
}
