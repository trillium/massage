import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

import updateCalendarEvent from 'lib/availability/updateCalendarEvent'
import { getHash } from 'lib/hash'

import eventSummary from 'lib/messaging/templates/events/eventSummary'
import eventDescription from 'lib/messaging/templates/events/eventDescription'
import { AdminAuthManager } from '@/lib/adminAuth'
import siteMetadata from '@/data/siteMetadata'
import { AppointmentRequestSchema } from 'lib/schema'
import { flattenLocation } from '@/lib/helpers/locationHelpers'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const data = searchParams.get('data')
  const key = searchParams.get('key')
  const mock = searchParams.get('mock') === 'true'

  if (!data) {
    return NextResponse.json({ error: 'Data is missing' }, { status: 400 })
  }
  // Make sure the hash matches before doing anything
  const hash = getHash(decodeURIComponent(data as string))

  if (hash !== key) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
  }

  const object = JSON.parse(decodeURIComponent(data as string))

  // Extract calendarEventId before Zod validation (schema is .strict())
  const { calendarEventId, ...appointmentData } = object

  if (!calendarEventId) {
    return NextResponse.json({ error: 'Missing calendarEventId' }, { status: 400 })
  }

  // Validate appointment data using Zod
  const validationResult = AppointmentRequestSchema.safeParse(appointmentData)

  if (!validationResult.success) {
    return NextResponse.json({ error: 'Malformed request in data validation' }, { status: 400 })
  }

  const validObject = validationResult.data

  // Check if start and end dates are valid
  if (Number.isNaN(Date.parse(validObject.start)) || Number.isNaN(Date.parse(validObject.end))) {
    return NextResponse.json({ error: 'Malformed request in date parsing' }, { status: 400 })
  }

  // Convert locationString to LocationObject for internal use
  let locationObject
  if (validObject.locationString) {
    const parts = validObject.locationString.split(',').map((part: string) => part.trim())
    locationObject = {
      street: parts[0] || '',
      city: parts[1] || '',
      zip: parts[2] || '',
    }
  } else if (validObject.locationObject) {
    locationObject = validObject.locationObject
  } else {
    return NextResponse.json({ error: 'Location information is required' }, { status: 400 })
  }

  const clientName = `${validObject.firstName} ${validObject.lastName}`
  const confirmedSummary =
    eventSummary({ duration: validObject.duration, clientName }) || 'Error in createEventSummary()'

  const confirmedDescription = await eventDescription({
    ...validObject,
    location: locationObject,
    summary: confirmedSummary,
  })

  // Update the existing REQUEST event → confirmed event
  let details
  if (mock) {
    details = {
      htmlLink: `https://calendar.google.com/calendar/event?eid=${calendarEventId}`,
      attendees: [{ email: validObject.email, displayName: validObject.firstName }],
    }
    console.log('Mock, skipping calendar update 🗓️')
  } else {
    try {
      details = await updateCalendarEvent(calendarEventId, {
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
        { status: 404 }
      )
    }
  }

  const htmlLink = details.htmlLink
  const regex = /eid=([^&]+)/
  const match = htmlLink?.match(regex)

  // If we have a link to the event, take us there.
  if (match && match[1]) {
    const bookedData = {
      ...validObject,
      locationObject,
      locationString:
        validObject.locationString ||
        `${locationObject.street}, ${locationObject.city}, ${locationObject.zip}`.replace(
          /^, |, $/,
          ''
        ),
      attendees:
        details.attendees && Array.isArray(details.attendees)
          ? details.attendees
              .filter(
                (attendee: Record<string, unknown>) =>
                  attendee &&
                  typeof attendee === 'object' &&
                  'email' in attendee &&
                  typeof attendee.email === 'string'
              )
              .map((attendee: { email: string; displayName?: string; name?: string }) => ({
                email: attendee.email,
                name: attendee.displayName || attendee.name,
              }))
          : [{ email: validObject.email, name: validObject.firstName }],
      timeZone: validObject.timeZone,
      dateTime: validObject.start,
      start: {
        dateTime: validObject.start,
        timeZone: validObject.timeZone,
      },
      end: {
        dateTime: validObject.end,
        timeZone: validObject.timeZone,
      },
    }

    const encodedDetails = encodeURIComponent(JSON.stringify(bookedData))

    const adminEmail = siteMetadata.email
    const adminLink = AdminAuthManager.generateAdminLink(adminEmail)
    const url = new URL(adminLink, req.url)
    const adminToken = url.searchParams.get('token')

    return NextResponse.redirect(
      `${new URL(req.url).origin}/admin/booked?data=${encodedDetails}&url=${encodeURIComponent(match[1])}&email=${encodeURIComponent(adminEmail)}&token=${adminToken}`
    )
  }

  // Otherwise, something's wrong.
  return NextResponse.json({ error: 'Error trying to confirm the appointment' }, { status: 500 })
}
