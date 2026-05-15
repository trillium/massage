import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Public (no auth) health endpoint to check if appointments are landing for a given slug.
 *
 * GET /api/booking/health?slug=nerdstage
 *
 * Returns aggregate counts only — no PII.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'slug query param required' }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'db client unavailable' }, { status: 503 })
  }

  // booking_url is stored as the path e.g. "/nerdstage" or the slug itself.
  // Match either form.
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
