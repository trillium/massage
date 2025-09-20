import { z } from 'zod'
import { AppointmentRequestSchema } from '../schema'
import { getHash } from '../hash'

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
