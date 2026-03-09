import { NextResponse } from 'next/server'
import { checkSlotAvailability } from '@/lib/availability/checkSlotAvailability'
import type { GoogleCalendarV3Event } from '@/lib/calendarTypes'

const SLOT_START = '2026-03-09T11:00:00-07:00'
const SLOT_END = '2026-03-09T11:30:00-07:00'
const EVENT_BASE = 'scale23x'
const MEMBER_MARKER = 'scale23x__EVENT__MEMBER__'

function makeMemberEvent(name: string, start: string, end: string): GoogleCalendarV3Event {
  return {
    id: `test-evt-${Date.now()}`,
    summary: `30 minute massage with ${name} - TrilliumMassage`,
    description: MEMBER_MARKER,
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

export async function GET() {
  const steps: { actor: string; action: string; result: string; status: number }[] = []
  const calendarEvents: GoogleCalendarV3Event[] = []

  const mockGetEvents = async () => [...calendarEvents]
  const mockGetBusy = async () => []

  // Step 1: User 1 checks availability
  const user1Check = await checkSlotAvailability({
    start: SLOT_START,
    end: SLOT_END,
    padding: 0,
    eventBaseString: EVENT_BASE,
    getBusyTimesFn: mockGetBusy,
    getEventsBySearchQueryFn: mockGetEvents,
  })

  steps.push({
    actor: 'User 1',
    action: 'Check availability for 11:00 AM',
    result: user1Check.available ? 'Slot available' : 'Slot unavailable',
    status: user1Check.available ? 200 : 409,
  })

  // Step 2: User 1 books — simulate calendar event creation
  if (user1Check.available) {
    calendarEvents.push(makeMemberEvent('User1', SLOT_START, SLOT_END))
    steps.push({
      actor: 'User 1',
      action: 'Create calendar event (confirmed)',
      result: `Event created with ${MEMBER_MARKER} marker`,
      status: 200,
    })
  }

  // Step 3: User 2 checks availability for the SAME slot
  // With noCache fix, this sees User 1's event
  const user2Check = await checkSlotAvailability({
    start: SLOT_START,
    end: SLOT_END,
    padding: 0,
    eventBaseString: EVENT_BASE,
    getBusyTimesFn: mockGetBusy,
    getEventsBySearchQueryFn: mockGetEvents,
  })

  steps.push({
    actor: 'User 2',
    action: 'Check availability for 11:00 AM',
    result: user2Check.available ? 'Slot available' : 'Slot unavailable — 409 rebook',
    status: user2Check.available ? 200 : 409,
  })

  const passed = user1Check.available && !user2Check.available

  return NextResponse.json({ passed, steps })
}
