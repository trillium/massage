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
import { getAppointmentByCalendarEventId } from '@/lib/appointments/getAppointmentByCalendarEventId'
import { updateAppointmentStatus } from '@/lib/appointments/updateAppointmentStatus'
import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import { parseEditableFields } from '@/lib/helpers/parseEventDescription'

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

  const existing = await getAppointmentByCalendarEventId(calendarEventId as string)

  if (existing?.status === 'confirmed') {
    const bookedData = {
      ...appointmentData,
      locationString: existing.location || '',
      timeZone: existing.timezone,
      dateTime: existing.start_time,
      start: { dateTime: existing.start_time, timeZone: existing.timezone },
      end: { dateTime: existing.end_time, timeZone: existing.timezone },
      attendees: [{ email: existing.client_email, name: existing.client_first_name }],
    }
    const encodedDetails = encodeURIComponent(JSON.stringify(bookedData))
    return NextResponse.redirect(
      `${new URL(req.url).origin}/admin/booked?data=${encodedDetails}&already_confirmed=true`
    )
  }

  if (existing?.status === 'cancelled') {
    return NextResponse.json(
      { error: 'This appointment has been cancelled.' },
      { status: 410, headers: NO_STORE_HEADERS }
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

  // If the client updated their email via the edit form, the description holds the current value.
  // Override the baked-in token email so the calendar invite and confirmation go to the right place.
  const currentEvent = await fetchSingleEvent(calendarEventId as string)
  if (currentEvent?.description) {
    const descriptionEmail = parseEditableFields(currentEvent.description).email
    if (descriptionEmail) {
      validObject.email = descriptionEmail
    }
  }

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
