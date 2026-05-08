import { NextRequest, NextResponse } from 'next/server'
import { LRUCache } from 'lru-cache'

type RateLimitConfig = {
  max?: number
  ttlMs?: number
  limit?: number
}

export function createRateLimiter({ max = 500, ttlMs = 60_000, limit = 5 }: RateLimitConfig = {}) {
  const cache = new LRUCache<string, number[]>({ max, ttl: ttlMs })

  return function checkRateLimit(req: NextRequest, headers: Headers): boolean {
    const forwarded = headers.get('x-forwarded-for')
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded) ??
      req.headers.get('x-real-ip') ??
      '127.0.0.1'

    const tokenCount = (cache.get(ip) as number[]) || [0]
    if (tokenCount[0] === 0) {
      cache.set(ip, tokenCount)
    }
    tokenCount[0] += 1
    return tokenCount[0] >= limit
  }
}

export function rateLimitResponse() {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
