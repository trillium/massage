import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const ShooHoldSchema = z.object({
  start: z.string().datetime({ offset: true }),
  end: z.string().datetime({ offset: true }),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ShooHoldSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'supabase_unavailable' }, { status: 500 })
  }

  const { data, error } = await supabase.rpc('shoo_slot_hold', {
    p_start: parsed.data.start,
    p_end: parsed.data.end,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result = data as { shoo_count: number; deleted: boolean }

  return NextResponse.json({
    shooCount: result.shoo_count,
    deleted: result.deleted,
  })
}
