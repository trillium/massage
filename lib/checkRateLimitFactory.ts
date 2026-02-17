import { LRUCache } from 'lru-cache'
import { NextRequest } from 'next/server'

export function checkRateLimitFactory(lru: InstanceType<typeof LRUCache>, limit: number) {
  return (req: NextRequest, headers: Headers) => {
    const forwarded = headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? '127.0.0.1'
    const tokenCount = (lru.get(ip) as number[]) || [0]
    if (tokenCount[0] === 0) {
      lru.set(ip, tokenCount)
    }
    tokenCount[0] += 1
    const currentUsage = tokenCount[0]
    return currentUsage >= limit
  }
}
