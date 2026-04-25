import { NextRequest, NextResponse } from 'next/server'
import { LRUCache } from 'lru-cache'
import { checkRateLimitFactory } from '@/lib/checkRateLimitFactory'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

const rateLimitLRU = new LRUCache({
  max: 500,
  ttl: 60_000,
})
const REQUESTS_PER_IP_PER_MINUTE_LIMIT = 10

const checkRateLimit = checkRateLimitFactory(rateLimitLRU, REQUESTS_PER_IP_PER_MINUTE_LIMIT)

interface RaffleEntryRow {
  name: string
  email: string
  phone: string
  zip_code: string | null
  interested_in: string[]
}

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

    const { data, error } = await supabase
      .from('raffle_entries' as never)
      .select('name, email, phone, zip_code, interested_in')
      .eq('email', email)
      .eq('raffle_id', raffleId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json({ entry: null })
    }

    const entry = data as unknown as RaffleEntryRow

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
