import { NextRequest, NextResponse } from 'next/server'
import { LRUCache } from 'lru-cache'
import { checkRateLimitFactory } from '@/lib/checkRateLimitFactory'
import { getEntryByEmail, getOpenRaffle, insertEntry, updateEntry } from '@/lib/raffle'
import { RaffleEntrySchema } from '@/lib/schema'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { distanceFromWestchester } from '@/lib/zipDistance'

const rateLimitLRU = new LRUCache({
  max: 500,
  ttl: 60_000,
})
const REQUESTS_PER_IP_PER_MINUTE_LIMIT = 5

const checkRateLimit = checkRateLimitFactory(rateLimitLRU, REQUESTS_PER_IP_PER_MINUTE_LIMIT)

export async function POST(request: NextRequest) {
  try {
    if (checkRateLimit(request, request.headers)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = RaffleEntrySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const raffle = await getOpenRaffle(supabase)
    if (!raffle) {
      return NextResponse.json({ error: 'No active raffle' }, { status: 400 })
    }

    const existing = await getEntryByEmail(supabase, parsed.data.email, raffle.id)

    if (existing?.is_winner) {
      return NextResponse.json({ error: 'Cannot edit a winning entry' }, { status: 400 })
    }

    if (existing) {
      try {
        await updateEntry(supabase, existing.id, {
          name: parsed.data.name,
          phone: parsed.data.phone,
          is_local: parsed.data.is_local,
          zip_code: parsed.data.zip_code,
          interested_in: parsed.data.interested_in,
          distance_from_90045_mi: distanceFromWestchester(parsed.data.zip_code),
        })
        return NextResponse.json({ success: true, entryId: existing.id })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Update failed'
        return NextResponse.json({ error: message }, { status: 500 })
      }
    }

    try {
      const entry = await insertEntry(supabase, {
        raffle_id: raffle.id,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        is_local: parsed.data.is_local,
        zip_code: parsed.data.zip_code,
        interested_in: parsed.data.interested_in,
        distance_from_90045_mi: distanceFromWestchester(parsed.data.zip_code),
      })
      return NextResponse.json({ success: true, entryId: entry.id })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Insert failed'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in raffle submit API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
