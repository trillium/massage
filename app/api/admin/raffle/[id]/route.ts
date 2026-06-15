import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { clearWinnersForRaffle, setActiveRaffle, updateRaffle } from '@/lib/raffle'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

const UpdateRaffleSchema = z.object({
  is_active: z.boolean().optional(),
  status: z.string().optional(),
  clear_winner: z.boolean().optional(),
  sms_template_winner: z.string().nullable().optional(),
  sms_template_non_winner: z.string().nullable().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdminWithFlag(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  const body = await request.json()
  const parsed = UpdateRaffleSchema.safeParse(body)

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
    if (parsed.data.is_active) {
      await setActiveRaffle(supabase, id)
    }

    if (parsed.data.clear_winner) {
      await clearWinnersForRaffle(supabase, id)
    }

    const updateFields: Record<string, unknown> = {}
    if (parsed.data.is_active !== undefined) updateFields.is_active = parsed.data.is_active
    if (parsed.data.status !== undefined) updateFields.status = parsed.data.status
    if (parsed.data.clear_winner) {
      updateFields.status = 'open'
      updateFields.drawn_at = null
    }
    if (parsed.data.sms_template_winner !== undefined)
      updateFields.sms_template_winner = parsed.data.sms_template_winner
    if (parsed.data.sms_template_non_winner !== undefined)
      updateFields.sms_template_non_winner = parsed.data.sms_template_non_winner

    const raffle = await updateRaffle(supabase, id, updateFields)
    return NextResponse.json({ raffle })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update raffle'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
