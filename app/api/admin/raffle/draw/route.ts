import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

const DrawSchema = z.object({
  raffle_id: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const authResult = await requireAdminWithFlag(request)
  if (authResult instanceof NextResponse) return authResult

  const body = await request.json()
  const parsed = DrawSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const { data: raffleData, error: raffleError } = await supabase
    .from('raffles' as never)
    .select('*')
    .eq('id', parsed.data.raffle_id)
    .single()

  const raffle = raffleData as { id: string; status: string } | null

  if (raffleError || !raffle) {
    return NextResponse.json({ error: 'Raffle not found' }, { status: 404 })
  }

  if (raffle.status !== 'open' && raffle.status !== 'closed' && raffle.status !== 'drawn') {
    return NextResponse.json(
      { error: `Cannot draw raffle with status: ${raffle.status}` },
      { status: 400 }
    )
  }

  if (raffle.status === 'drawn') {
    const { error: clearWinnerError } = await supabase
      .from('raffle_entries' as never)
      .update({ is_winner: false } as never)
      .eq('raffle_id', parsed.data.raffle_id)

    if (clearWinnerError) {
      return NextResponse.json({ error: clearWinnerError.message }, { status: 500 })
    }
  }

  const { data: entriesData, error: entriesError } = await supabase
    .from('raffle_entries' as never)
    .select('name, email')
    .eq('raffle_id', parsed.data.raffle_id)
    .eq('excluded', false)

  const entries = entriesData as { name: string; email: string }[] | null

  if (entriesError) {
    return NextResponse.json({ error: entriesError.message }, { status: 500 })
  }

  if (!entries || entries.length === 0) {
    return NextResponse.json({ error: 'No entries to draw from' }, { status: 400 })
  }

  const uniqueByEmail = new Map<string, { name: string; email: string }>()
  for (const entry of entries) {
    if (!uniqueByEmail.has(entry.email)) {
      uniqueByEmail.set(entry.email, entry)
    }
  }

  const candidates = Array.from(uniqueByEmail.values())
  const winner = candidates[Math.floor(Math.random() * candidates.length)]

  const { error: updateEntriesError } = await supabase
    .from('raffle_entries' as never)
    .update({ is_winner: true } as never)
    .eq('raffle_id', parsed.data.raffle_id)
    .eq('email', winner.email)

  if (updateEntriesError) {
    return NextResponse.json({ error: updateEntriesError.message }, { status: 500 })
  }

  const { error: updateRaffleError } = await supabase
    .from('raffles' as never)
    .update({ status: 'drawn', drawn_at: new Date().toISOString() } as never)
    .eq('id', parsed.data.raffle_id)

  if (updateRaffleError) {
    return NextResponse.json({ error: updateRaffleError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    winner: { name: winner.name, email: winner.email },
  })
}
