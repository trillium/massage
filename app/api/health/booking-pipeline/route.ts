import { NextResponse } from 'next/server'
import getAccessToken, { clearTokenCache } from '@/lib/availability/getAccessToken'
import { getEventsBySearchQuery } from '@/lib/availability/getEventsBySearchQuery'
import { getActiveHolds } from '@/lib/holds/getActiveHolds'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type CheckResult = { name: string; ok: boolean; detail?: unknown; latencyMs: number }

async function timed<T>(name: string, fn: () => Promise<T>): Promise<CheckResult & { value?: T }> {
  const t0 = Date.now()
  try {
    const value = await fn()
    return { name, ok: true, value, latencyMs: Date.now() - t0 }
  } catch (err) {
    return {
      name,
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - t0,
    }
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('bust') === '1') clearTokenCache()

  const checks: CheckResult[] = []

  const token = await timed('google-oauth-token', () => getAccessToken())
  checks.push({ name: token.name, ok: token.ok, latencyMs: token.latencyMs, detail: token.detail })

  if (token.ok) {
    const cal = await timed('google-calendar-fetch', () =>
      getEventsBySearchQuery({
        query: '',
        start: new Date(),
        end: new Date(Date.now() + 60 * 60 * 1000),
        noCache: true,
      })
    )
    checks.push({
      name: cal.name,
      ok: cal.ok,
      latencyMs: cal.latencyMs,
      detail: cal.ok ? `${(cal.value as unknown[] | undefined)?.length ?? 0} events` : cal.detail,
    })
  }

  const supabase = await timed('supabase-admin-client', async () => {
    const c = getSupabaseAdminClient()
    if (!c) throw new Error('admin client unavailable')
    return c
  })
  checks.push({
    name: supabase.name,
    ok: supabase.ok,
    latencyMs: supabase.latencyMs,
    detail: supabase.detail,
  })

  if (supabase.ok) {
    const holds = await timed('slot-holds-query', () =>
      getActiveHolds(
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() + 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString()
      )
    )
    checks.push({
      name: holds.name,
      ok: holds.ok,
      latencyMs: holds.latencyMs,
      detail: holds.detail,
    })

    const apt = await timed('appointments-query', async () => {
      const c = supabase.value!
      const { error } = await c.from('appointments').select('id').limit(1)
      if (error) throw new Error(error.message)
      return true
    })
    checks.push({ name: apt.name, ok: apt.ok, latencyMs: apt.latencyMs, detail: apt.detail })
  }

  const ok = checks.every((c) => c.ok)
  const totalLatencyMs = checks.reduce((sum, c) => sum + c.latencyMs, 0)

  return NextResponse.json({ ok, totalLatencyMs, checks }, { status: ok ? 200 : 503 })
}
