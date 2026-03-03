'use server'

import { getHash } from '@/lib/hash'

export async function getHashAction(data: string): Promise<string> {
  return getHash(data)
}
