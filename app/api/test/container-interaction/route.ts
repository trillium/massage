import { NextRequest, NextResponse } from 'next/server'
import { checkSlotAvailability } from '@/lib/availability/checkSlotAvailability'
import type { GoogleCalendarV3Event } from '@/lib/calendarTypes'

const DEFAULT_SLOT_START = '2026-09-15T11:00:00-07:00'
const DEFAULT_SLOT_END = '2026-09-15T11:30:00-07:00'

function makeMemberEvent(container: string, start: string, end: string): GoogleCalendarV3Event {
  return {
    id: `probe-${container}-${Date.now()}`,
    summary: `Probe member event for ${container}`,
    description: `${container}__EVENT__MEMBER__`,
    start: { dateTime: start },
    end: { dateTime: end },
    kind: 'calendar#event',
    etag: '',
    status: 'confirmed',
    htmlLink: '',
    created: '',
    updated: '',
    iCalUID: '',
    sequence: 0,
    reminders: {},
  }
}

type Cell = { booked: string; tested: string; blocked: boolean }

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const containers = (params.get('containers') ?? 'edge_office,edge_comes_to_you')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
  const blockingContainers = (params.get('blockingContainers') ?? containers.join(','))
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
  const start = params.get('start') ?? DEFAULT_SLOT_START
  const end = params.get('end') ?? DEFAULT_SLOT_END

  const matrix: Cell[] = []
  for (const booked of containers) {
    const events: GoogleCalendarV3Event[] = [makeMemberEvent(booked, start, end)]
    const mockGetEvents = async () => events
    const mockGetBusy = async () => []

    for (const tested of containers) {
      const result = await checkSlotAvailability({
        start,
        end,
        padding: 0,
        blockingScope: 'containers',
        blockingContainers,
        eventBaseString: `${tested}__EVENT__`,
        getBusyTimesFn: mockGetBusy,
        getEventsBySearchQueryFn: mockGetEvents,
      })
      matrix.push({ booked, tested, blocked: !result.available })
    }
  }

  const summary = matrix.map((c) => `${c.booked} → ${c.tested}: ${c.blocked ? 'BLOCKED' : 'free'}`)

  return NextResponse.json({
    slot: { start, end },
    containers,
    blockingContainers,
    matrix,
    summary,
  })
}
