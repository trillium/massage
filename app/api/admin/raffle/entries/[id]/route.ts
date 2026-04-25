import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

const PatchSchema = z.object({
  excluded: z.boolean(),
})

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
