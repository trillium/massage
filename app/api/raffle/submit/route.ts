import { NextRequest, NextResponse } from 'next/server'
import { LRUCache } from 'lru-cache'
import { checkRateLimitFactory } from '@/lib/checkRateLimitFactory'
import { RaffleEntrySchema } from '@/lib/schema'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

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

    const { data: raffleData, error: raffleError } = await supabase
      .from('raffles' as never)
      .select('id')
      .eq('status', 'open')
      .limit(1)
      .single()

    const raffle = raffleData as { id: string } | null

    if (raffleError || !raffle) {
      return NextResponse.json({ error: 'No active raffle' }, { status: 400 })
    }

    const { data: existingData } = await supabase
      .from('raffle_entries' as never)
      .select('id, is_winner')
      .eq('email', parsed.data.email)
      .eq('raffle_id', raffle.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const existing = existingData as { id: string; is_winner: boolean } | null

    if (existing?.is_winner) {
      return NextResponse.json({ error: 'Cannot edit a winning entry' }, { status: 400 })
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('raffle_entries' as never)
        .update({
          name: parsed.data.name,
          phone: parsed.data.phone,
          is_local: parsed.data.is_local,
          zip_code: parsed.data.zip_code,
          interested_in: parsed.data.interested_in,
        } as never)
        .eq('id', existing.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, entryId: existing.id })
    }

    const { data: entryData, error } = await supabase
      .from('raffle_entries' as never)
      .insert({
        raffle_id: raffle.id,
        ...parsed.data,
      } as never)
      .select('id')
      .single()

    const entry = entryData as { id: string } | null

    if (error || !entry) {
      return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, entryId: entry.id })
  } catch (error) {
    console.error('Error in raffle submit API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
