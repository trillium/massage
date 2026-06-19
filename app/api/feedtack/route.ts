import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

type FeedtackDB = {
  from: (table: string) => {
    insert: (data: object) => Promise<{ error: { message: string } | null }>
  }
}

const ADMIN_ONLY_TYPES = new Set(['reply', 'resolve', 'archive'])

function getDB() {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return null
  return supabase as never as FeedtackDB
}

function isDevHost(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  return /^(dev|test)\./.test(host) || host.startsWith('localhost')
}

export async function POST(request: NextRequest) {
  if (!isDevHost(request)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const { type, feedbackId, payload, reply, resolution, userId } = body

  // WebhookAdapter.submit() sends the payload directly without a type field
  if (!type) {
    const db = getDB()
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })
    const { error } = await db.from('feedtack_submissions').insert({ id: body.id, data: body })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (ADMIN_ONLY_TYPES.has(type)) {
    const authResult = await requireAdminWithFlag(request)
    if (authResult instanceof NextResponse) return authResult
  }

  const db = getDB()
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const dispatchers: Record<string, () => Promise<{ error: { message: string } | null }>> = {
    reply: () => db.from('feedtack_replies').insert({ feedback_id: feedbackId, ...reply }),
    resolve: () =>
      db.from('feedtack_resolutions').insert({ feedback_id: feedbackId, ...resolution }),
    archive: () =>
      db.from('feedtack_archives').insert({ feedback_id: feedbackId, user_id: userId }),
    approve: () => {
      throw new Error('approve not implemented')
    },
    revoke: () => {
      throw new Error('revoke not implemented')
    },
    'save-field': () => {
      throw new Error('save-field not implemented')
    },
  }

  const dispatch = dispatchers[type]
  if (!dispatch) return NextResponse.json({ error: 'Unknown type' }, { status: 400 })

  const { error } = await dispatch()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET(request: NextRequest) {
  if (!isDevHost(request)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const authResult = await requireAdminWithFlag(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = getSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const pathname = request.nextUrl.searchParams.get('pathname')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('feedtack_submissions')
    .select('*, feedtack_replies(*), feedtack_resolutions(*), feedtack_archives(*)')
    .order('created_at', { ascending: false })

  if (pathname) query = query.eq('data->page->>pathname', pathname)

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
