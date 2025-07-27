import { LRUCache } from 'lru-cache'
import { NextRequest } from 'next/server'
import { IncomingMessage } from 'http'

export function checkRateLimitFactory(lru: InstanceType<typeof LRUCache>, limit: number) {
  return (req: NextRequest & IncomingMessage, headers: Headers) => {
    const forwarded = headers.get('x-forwarded-for')
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded) ??
      req.socket.remoteAddress ??
      '127.0.0.1'
    const tokenCount = (lru.get(ip) as number[]) || [0]
    if (tokenCount[0] === 0) {
      lru.set(ip, tokenCount)
    }
    tokenCount[0] += 1
    const currentUsage = tokenCount[0]
    return currentUsage >= limit
  }
}
