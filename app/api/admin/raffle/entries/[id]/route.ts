import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { deleteEntry, getEntryById, pickEntryAsWinner, updateEntry } from '@/lib/raffle'
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
    const entry = await getEntryById(supabase, id)
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    try {
      await pickEntryAsWinner(supabase, id, entry.raffle_id)
      return NextResponse.json({ success: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to pick winner'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  if ('sms_sent_at' in parsed.data) {
    try {
      await updateEntry(supabase, id, { sms_sent_at: parsed.data.sms_sent_at })
      return NextResponse.json({ success: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update entry'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  const entry = await getEntryById(supabase, id)
  if (entry?.is_winner) {
    return NextResponse.json({ error: 'Cannot modify a winning entry' }, { status: 400 })
  }

  try {
    await updateEntry(supabase, id, { excluded: parsed.data.excluded })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update entry'
    return NextResponse.json({ error: message }, { status: 500 })
  }
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

  const entry = await getEntryById(supabase, id)
  if (entry?.is_winner) {
    return NextResponse.json({ error: 'Cannot delete a winning entry' }, { status: 400 })
  }

  try {
    await deleteEntry(supabase, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete entry'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
