import { NextResponse } from 'next/server'
import getBusyTimes from 'lib/availability/getBusyTimes'
import { getDateRangeInterval, mapDatesToStrings } from 'lib/availability/helpers'
import Day from 'lib/day'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Day.todayWithOffset(0)
  const end = Day.todayWithOffset(1)

  const dateRangeInterval = getDateRangeInterval({ start, end })
  const busy = await getBusyTimes(dateRangeInterval)
  const mappedBusy = mapDatesToStrings(busy)

  return NextResponse.json(
    { start: start.toString(), end: end.toString(), busy: mappedBusy },
    { headers: { 'Cache-Control': 'private, max-age=5' } }
  )
}
