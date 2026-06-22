import { NextResponse } from 'next/server'
import getAccessToken, { clearTokenCache } from '@/lib/availability/getAccessToken'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const bust = url.searchParams.get('bust') === '1'
  if (bust) clearTokenCache()

  const probe: Record<string, unknown> = { ok: false }

  let accessToken: string | null = null
  try {
    accessToken = await getAccessToken()
    probe.tokenAcquired = !!accessToken
    probe.tokenPrefix = accessToken ? accessToken.slice(0, 12) + '…' : null
  } catch (err) {
    probe.tokenExchangeError = err instanceof Error ? err.message : String(err)
    return NextResponse.json(probe, { status: 500 })
  }

  if (!accessToken) {
    probe.tokenExchangeError = 'getAccessToken returned empty'
    return NextResponse.json(probe, { status: 500 })
  }

  try {
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=1',
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
    )
    probe.calendarStatus = res.status
    probe.calendarStatusText = res.statusText
    const body = await res.text()
    try {
      probe.calendarBody = JSON.parse(body)
    } catch {
      probe.calendarBody = body
    }
    probe.ok = res.ok
    return NextResponse.json(probe, { status: res.ok ? 200 : 500 })
  } catch (err) {
    probe.calendarFetchError = err instanceof Error ? err.message : String(err)
    return NextResponse.json(probe, { status: 500 })
  }
}
