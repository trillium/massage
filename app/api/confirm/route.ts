import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { z } from 'zod'

import createCalendarAppointment from 'lib/availability/createCalendarAppointment'
import { getHash } from 'lib/hash'

import eventSummary from 'lib/messaging/templates/events/eventSummary'
import { AdminAuthManager } from '@/lib/adminAuth'
import siteMetadata from '@/data/siteMetadata'
import { AppointmentRequestSchema } from 'lib/schema'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const data = searchParams.get('data')
  const key = searchParams.get('key')

  if (!data) {
    return NextResponse.json({ error: 'Data is missing' }, { status: 400 })
  }
  // Make sure the hash matches before doing anything
  const hash = getHash(decodeURIComponent(data as string))

  if (hash !== key) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
  }

  const object = JSON.parse(decodeURIComponent(data as string))

  // ...and validate it using Zod's safeParse method
  const validationResult = AppointmentRequestSchema.safeParse(object)

  if (!validationResult.success) {
    return NextResponse.json({ error: 'Malformed request in data validation' }, { status: 400 })
  }

  const validObject = validationResult.data

  // Check if start and end dates are valid
  if (Number.isNaN(Date.parse(validObject.start)) || Number.isNaN(Date.parse(validObject.end))) {
    return NextResponse.json({ error: 'Malformed request in date parsing' }, { status: 400 })
  }

  // Convert location to LocationObject for the appointment function
  let locationObject
  if (typeof validObject.location === 'string') {
    // Legacy handling: location is a string
    locationObject = {
      street: '', // We don't have street info from the string, so default to empty
      city: validObject.location, // Use the location string as the city
      zip: '', // We don't have zip info from the string, so default to empty
    }
  } else {
    // New handling: location is already a LocationObject
    locationObject = validObject.location
  }

  // Create the confirmed appointment
  const response = await createCalendarAppointment({
    ...validObject,
    location: locationObject,
    requestId: hash,
    summary:
      eventSummary({
        duration: validObject.duration,
        clientName: `${validObject.firstName} ${validObject.lastName}`,
      }) || 'Error in createEventSummary()',
  })

  const details = await response.json()

  const htmlLink = details.htmlLink
  const regex = /eid=([^&]+)/
  const match = htmlLink.match(regex)

  // If we have a link to the event, take us there.
  if (match && match[1]) {
    // Construct the proper data structure expected by the /booked page
    const bookedData = {
      ...validObject,
      attendees: details.attendees
        ? details.attendees.map(
            (attendee: { email: string; displayName?: string; name?: string }) => ({
              email: attendee.email,
              name: attendee.displayName || attendee.name,
            })
          )
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

    // Generate admin authentication parameters for seamless admin identification
    const adminEmail = siteMetadata.email
    const adminLink = AdminAuthManager.generateAdminLink(adminEmail)
    const url = new URL(adminLink)
    const adminToken = url.searchParams.get('token')

    return NextResponse.redirect(
      `/admin/booked?data=${encodedDetails}&url=${encodeURIComponent(match[1])}&email=${encodeURIComponent(adminEmail)}&token=${adminToken}`
    )
  }

  // Otherwise, something's wrong.
  return NextResponse.json({ error: 'Error trying to create an appointment' }, { status: 500 })
}
