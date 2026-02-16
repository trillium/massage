import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { getHash } from 'lib/hash'
import deleteCalendarEvent from 'lib/availability/deleteCalendarEvent'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const data = searchParams.get('data')
  const key = searchParams.get('key')

  if (!data) {
    return NextResponse.json({ error: 'Data is missing' }, { status: 400 })
  }

  const hash = getHash(decodeURIComponent(data))
  if (hash !== key) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
  }

  const payload = JSON.parse(decodeURIComponent(data))
  const { calendarEventId } = payload

  if (!calendarEventId) {
    return NextResponse.json({ error: 'Missing calendarEventId' }, { status: 400 })
  }

  try {
    await deleteCalendarEvent(calendarEventId)
    return NextResponse.json({ success: true, message: 'Appointment declined' })
  } catch (error) {
    console.error('Error declining appointment:', error)
    return NextResponse.json({ error: 'Failed to decline appointment' }, { status: 500 })
  }
}
