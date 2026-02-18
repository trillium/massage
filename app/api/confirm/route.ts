import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

import updateCalendarEvent from 'lib/availability/updateCalendarEvent'
import eventSummary from 'lib/messaging/templates/events/eventSummary'
import eventDescription from 'lib/messaging/templates/events/eventDescription'
import { AppointmentRequestSchema } from 'lib/schema'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import {
  verifyHashedData,
  parseLocation,
  buildBookedRedirect,
  NO_STORE_HEADERS,
} from '@/lib/api/confirmHelpers'
import { updateAppointmentStatus } from '@/lib/appointments/updateAppointmentStatus'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const verified = verifyHashedData(req)
  if (!verified.success) return verified.response

  const searchParams = req.nextUrl.searchParams
  const mock = searchParams.get('mock') === 'true'

  const { calendarEventId, ...appointmentData } = verified.data

  if (!calendarEventId) {
    return NextResponse.json(
      { error: 'Missing calendarEventId' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  const validationResult = AppointmentRequestSchema.safeParse(appointmentData)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Malformed request in data validation' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  const validObject = validationResult.data

  if (Number.isNaN(Date.parse(validObject.start)) || Number.isNaN(Date.parse(validObject.end))) {
    return NextResponse.json(
      { error: 'Malformed request in date parsing' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  const locationResult = parseLocation(validObject)
  if (locationResult instanceof NextResponse) return locationResult
  const locationObject = locationResult

  const clientName = `${validObject.firstName} ${validObject.lastName}`
  const confirmedSummary =
    eventSummary({ duration: validObject.duration, clientName }) || 'Error in createEventSummary()'

  const confirmedDescription = await eventDescription({
    ...validObject,
    location: locationObject,
    summary: confirmedSummary,
  })

  let details
  if (mock) {
    details = {
      htmlLink: `https://calendar.google.com/calendar/event?eid=${calendarEventId}`,
      attendees: [{ email: validObject.email, displayName: validObject.firstName }],
    }
  } else {
    try {
      details = await updateCalendarEvent(calendarEventId as string, {
        summary: confirmedSummary,
        description: confirmedDescription,
        location: flattenLocation(locationObject),
        attendees: [
          {
            email: validObject.email,
            displayName: validObject.firstName,
            responseStatus: 'accepted',
          },
        ],
      })
    } catch (error) {
      console.error('Error updating calendar event:', error)
      return NextResponse.json(
        { error: 'This appointment may have already been declined or cancelled.' },
        { status: 404, headers: NO_STORE_HEADERS }
      )
    }
  }

  updateAppointmentStatus(calendarEventId as string, 'confirmed').catch(() => {})

  const redirect = buildBookedRedirect({ req, validObject, locationObject, details })
  if (redirect) return redirect

  return NextResponse.json(
    { error: 'Error trying to confirm the appointment' },
    { status: 500, headers: NO_STORE_HEADERS }
  )
}
