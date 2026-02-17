import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import deleteCalendarEvent from 'lib/availability/deleteCalendarEvent'
import { verifyHashedData, NO_STORE_HEADERS } from '@/lib/api/confirmHelpers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const verified = verifyHashedData(req)
  if (!verified.success) return verified.response

  const { calendarEventId } = verified.data

  if (!calendarEventId) {
    return NextResponse.json(
      { error: 'Missing calendarEventId' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  try {
    await deleteCalendarEvent(calendarEventId as string)
    return NextResponse.json(
      { success: true, message: 'Appointment declined' },
      { headers: NO_STORE_HEADERS }
    )
  } catch (error) {
    console.error('Error declining appointment:', error)
    return NextResponse.json(
      { error: 'Failed to decline appointment' },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }
}
