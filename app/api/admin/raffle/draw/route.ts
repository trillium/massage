import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { drawRandomWinner, getRaffleById, updateRaffle } from '@/lib/raffle'
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

  const raffle = await getRaffleById(supabase, parsed.data.raffle_id)

  if (!raffle) {
    return NextResponse.json({ error: 'Raffle not found' }, { status: 404 })
  }

  if (raffle.status !== 'open' && raffle.status !== 'drawn') {
    return NextResponse.json(
      { error: `Cannot draw raffle with status: ${raffle.status}` },
      { status: 400 }
    )
  }

  try {
    const winner = await drawRandomWinner(supabase, parsed.data.raffle_id)
    await updateRaffle(supabase, parsed.data.raffle_id, {
      status: 'drawn',
      drawn_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      winner: { name: winner.name, email: winner.email },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Draw failed'
    const status = message === 'No entries to draw from' ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
