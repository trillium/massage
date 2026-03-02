import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import deleteCalendarEvent from 'lib/availability/deleteCalendarEvent'
import { verifyHashedData, NO_STORE_HEADERS } from '@/lib/api/confirmHelpers'
import { getAppointmentByCalendarEventId } from '@/lib/appointments/getAppointmentByCalendarEventId'
import { updateAppointmentStatus } from '@/lib/appointments/updateAppointmentStatus'

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

  const existing = await getAppointmentByCalendarEventId(calendarEventId as string)

  if (existing?.status === 'cancelled') {
    return NextResponse.json(
      { success: true, message: 'Appointment already declined' },
      { headers: NO_STORE_HEADERS }
    )
  }

  if (existing?.status === 'confirmed') {
    return NextResponse.json(
      { error: 'This appointment has already been confirmed.' },
      { status: 409, headers: NO_STORE_HEADERS }
    )
  }

  try {
    await deleteCalendarEvent(calendarEventId as string)
    updateAppointmentStatus(calendarEventId as string, 'cancelled').catch(() => {})
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
