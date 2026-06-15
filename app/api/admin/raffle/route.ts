import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { createRaffle } from '@/lib/raffle'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

const CreateRaffleSchema = z.object({
  name: z.string().min(1).max(200),
})

export async function POST(request: NextRequest) {
  const authResult = await requireAdminWithFlag(request)
  if (authResult instanceof NextResponse) return authResult

  const body = await request.json()
  const parsed = CreateRaffleSchema.safeParse(body)

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

  try {
    const raffle = await createRaffle(supabase, parsed.data.name)
    return NextResponse.json({ raffle }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create raffle'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
