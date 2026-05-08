import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

type FeedtackDB = {
  from: (table: string) => {
    insert: (data: object) => Promise<{ error: { message: string } | null }>
  }
}

async function authorizeAndGetDB(request: NextRequest) {
  const authResult = await requireAdminWithFlag(request)
  if (authResult instanceof NextResponse) return { error: authResult }

  const supabase = getSupabaseAdminClient()
  if (!supabase) return { error: NextResponse.json({ error: 'DB unavailable' }, { status: 503 }) }

  return { supabase }
}

export async function POST(request: NextRequest) {
  const { error: authError, supabase } = await authorizeAndGetDB(request)
  if (authError) return authError

  const db = supabase as never as FeedtackDB
  const body = await request.json()
  const { type, feedbackId, payload, reply, resolution, userId } = body

  let error: { message: string } | null = null

  if (type === 'submit') {
    ;({ error } = await db.from('feedtack_submissions').insert({ id: payload.id, data: payload }))
  } else if (type === 'reply') {
    ;({ error } = await db.from('feedtack_replies').insert({ feedback_id: feedbackId, ...reply }))
  } else if (type === 'resolve') {
    ;({ error } = await db
      .from('feedtack_resolutions')
      .insert({ feedback_id: feedbackId, ...resolution }))
  } else if (type === 'archive') {
    ;({ error } = await db
      .from('feedtack_archives')
      .insert({ feedback_id: feedbackId, user_id: userId }))
  } else {
    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET(request: NextRequest) {
  const { error: authError, supabase } = await authorizeAndGetDB(request)
  if (authError) return authError

  const pathname = request.nextUrl.searchParams.get('pathname')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('feedtack_submissions')
    .select('*, feedtack_replies(*), feedtack_resolutions(*), feedtack_archives(*)')
    .order('created_at', { ascending: false })

  if (pathname) query = query.eq('data->>page->>pathname', pathname)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const items = (data ?? []).map((row: Record<string, unknown>) => ({
    payload: row.data,
    replies: row.feedtack_replies ?? [],
    resolutions: row.feedtack_resolutions ?? [],
    archives: row.feedtack_archives ?? [],
  }))

  return NextResponse.json(items)
}
