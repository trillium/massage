import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

const UpdateRaffleSchema = z.object({
  is_active: z.boolean().optional(),
  status: z.string().optional(),
  clear_winner: z.boolean().optional(),
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

  if (parsed.data.is_active) {
    const { error: clearError } = await supabase
      .from('raffles' as never)
      .update({ is_active: false } as never)
      .neq('id', id)

    if (clearError) {
      return NextResponse.json({ error: clearError.message }, { status: 500 })
    }
  }

  if (parsed.data.clear_winner) {
    const { error: clearWinnerError } = await supabase
      .from('raffle_entries' as never)
      .update({ is_winner: false } as never)
      .eq('raffle_id', id)

    if (clearWinnerError) {
      return NextResponse.json({ error: clearWinnerError.message }, { status: 500 })
    }
  }

  const updateFields: Record<string, unknown> = {}
  if (parsed.data.is_active !== undefined) updateFields.is_active = parsed.data.is_active
  if (parsed.data.status !== undefined) updateFields.status = parsed.data.status
  if (parsed.data.clear_winner) {
    updateFields.status = 'open'
    updateFields.drawn_at = null
  }

  const { data, error } = await supabase
    .from('raffles' as never)
    .update(updateFields as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ raffle: data })
}
