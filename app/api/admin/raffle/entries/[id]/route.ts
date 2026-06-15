import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

const PatchSchema = z.union([
  z.object({ excluded: z.boolean() }),
  z.object({ pick_as_winner: z.literal(true) }),
  z.object({ sms_sent_at: z.string().nullable() }),
])

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdminWithFlag(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  const body = await request.json()
  const parsed = PatchSchema.safeParse(body)

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

  if ('pick_as_winner' in parsed.data) {
    const { data: entry } = await supabase
      .from('raffle_entries' as never)
      .select('raffle_id')
      .eq('id', id)
      .single()

    const raffleId = (entry as { raffle_id: string } | null)?.raffle_id
    if (!raffleId) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const { error: clearError } = await supabase
      .from('raffle_entries' as never)
      .update({ is_winner: false } as never)
      .eq('raffle_id', raffleId)

    if (clearError) {
      return NextResponse.json({ error: clearError.message }, { status: 500 })
    }

    const { error: pickError } = await supabase
      .from('raffle_entries' as never)
      .update({ is_winner: true } as never)
      .eq('id', id)

    if (pickError) {
      return NextResponse.json({ error: pickError.message }, { status: 500 })
    }

    const { error: raffleError } = await supabase
      .from('raffles' as never)
      .update({ status: 'drawn', drawn_at: new Date().toISOString() } as never)
      .eq('id', raffleId)

    if (raffleError) {
      return NextResponse.json({ error: raffleError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  if ('sms_sent_at' in parsed.data) {
    const { error } = await supabase
      .from('raffle_entries' as never)
      .update({ sms_sent_at: parsed.data.sms_sent_at } as never)
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  const { data: entry } = await supabase
    .from('raffle_entries' as never)
    .select('is_winner')
    .eq('id', id)
    .single()

  if ((entry as { is_winner: boolean } | null)?.is_winner) {
    return NextResponse.json({ error: 'Cannot modify a winning entry' }, { status: 400 })
  }

  const { error } = await supabase
    .from('raffle_entries' as never)
    .update({ excluded: parsed.data.excluded } as never)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminWithFlag(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  const supabase = getSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data: entry } = await supabase
    .from('raffle_entries' as never)
    .select('is_winner')
    .eq('id', id)
    .single()

  if ((entry as { is_winner: boolean } | null)?.is_winner) {
    return NextResponse.json({ error: 'Cannot delete a winning entry' }, { status: 400 })
  }

  const { error } = await supabase
    .from('raffle_entries' as never)
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
