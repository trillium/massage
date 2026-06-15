import { NextRequest, NextResponse } from 'next/server'
import { LRUCache } from 'lru-cache'
import { checkRateLimitFactory } from '@/lib/checkRateLimitFactory'
import { getEntryByEmail } from '@/lib/raffle'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

const rateLimitLRU = new LRUCache({
  max: 500,
  ttl: 60_000,
})
const REQUESTS_PER_IP_PER_MINUTE_LIMIT = 10

const checkRateLimit = checkRateLimitFactory(rateLimitLRU, REQUESTS_PER_IP_PER_MINUTE_LIMIT)

export async function GET(request: NextRequest) {
  try {
    if (checkRateLimit(request, request.headers)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const raffleId = searchParams.get('raffle_id')

    if (!email || !raffleId) {
      return NextResponse.json({ error: 'Missing email or raffle_id' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const entry = await getEntryByEmail(supabase, email, raffleId)

    if (!entry) {
      return NextResponse.json({ entry: null })
    }

    return NextResponse.json({
      entry: {
        name: entry.name,
        email: entry.email,
        phone: entry.phone,
        zip_code: entry.zip_code,
        interested_in: entry.interested_in,
      },
    })
  } catch (error) {
    console.error('Error in raffle lookup API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
