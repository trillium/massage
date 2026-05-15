import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabase = getSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'db client unavailable' }, { status: 503 })
  }

  const slugPath = slug.startsWith('/') ? slug : `/${slug}`

  const { data, error } = await supabase
    .from('appointments')
    .select('id, status, instant_confirm, created_at, start_time, booking_url')
    .or(`booking_url.eq.${slugPath},booking_url.eq.${slug}`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 503 })
  }

  const rows = data ?? []

  const counts = rows.reduce(
    (acc, row) => {
      const s = row.status as string
      acc[s] = (acc[s] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const mostRecent = rows[0]
    ? {
        created_at: rows[0].created_at,
        start_time: rows[0].start_time,
        status: rows[0].status,
        instant_confirm: rows[0].instant_confirm,
      }
    : null

  return NextResponse.json({
    ok: true,
    slug,
    total: rows.length,
    counts,
    most_recent: mostRecent,
    schema: process.env.TENANT_SLUG ?? 'public',
  })
}
