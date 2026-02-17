import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

import createOnsiteAppointment from 'lib/availability/createOnsiteAppointment'
import { getHash } from 'lib/hash'

import onsiteEventSummary from 'lib/messaging/templates/events/onsiteEventSummary'
import { OnSiteRequestSchema } from 'lib/schema'
import { AdminAuthManager } from '@/lib/adminAuth'
import siteMetadata from '@/data/siteMetadata'

export const dynamic = 'force-dynamic'

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const data = searchParams.get('data')
  const key = searchParams.get('key')

  if (!data) {
    return NextResponse.json(
      { error: 'Data is missing' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }
  // Make sure the hash matches before doing anything
  const hash = getHash(decodeURIComponent(data as string))

  if (hash !== key) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 403, headers: NO_STORE_HEADERS })
  }

  const object = JSON.parse(decodeURIComponent(data as string))

  // ...and validate it using Zod's safeParse method
  const validationResult = OnSiteRequestSchema.safeParse(object)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Malformed request in data validation' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  const validObject = validationResult.data

  // Check if start and end dates are valid
  if (Number.isNaN(Date.parse(validObject.start)) || Number.isNaN(Date.parse(validObject.end))) {
    return NextResponse.json(
      { error: 'Malformed request in date parsing' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  // Convert locationString to LocationObject for internal use
  let locationObject
  if (validObject.locationString) {
    // Parse locationString (expected format: "street, city, zip")
    const parts = validObject.locationString.split(',').map((part: string) => part.trim())
    locationObject = {
      street: parts[0] || '',
      city: parts[1] || '',
      zip: parts[2] || '',
    }
  } else if (validObject.locationObject) {
    // Use provided locationObject directly
    locationObject = validObject.locationObject
  } else {
    return NextResponse.json(
      { error: 'Location information is required' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  const transformedPricing = validObject.pricing
    ? Object.fromEntries(
        Object.entries(validObject.pricing).map(([key, value]) => [Number(key), Number(value)])
      )
    : undefined

  const response = await createOnsiteAppointment({
    ...validObject,
    location: locationObject,
    pricing: transformedPricing,
    requestId: hash,
    summary: onsiteEventSummary(validObject) || 'Error in createEventSummary()',
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to create calendar appointment' },
      { status: 502, headers: NO_STORE_HEADERS }
    )
  }

  const details = await response.json()

  const htmlLink = details.htmlLink
  const regex = /eid=([^&]+)/
  const match = htmlLink?.match(regex)

  // If we have a link to the event, take us there.
  if (match && match[1]) {
    // Construct the proper data structure expected by the /booked page
    const bookedData = {
      ...validObject,
      locationObject, // Include the parsed location object
      locationString:
        validObject.locationString ||
        `${locationObject.street}, ${locationObject.city}, ${locationObject.zip}`.replace(
          /^, |, $/,
          ''
        ), // Include location string for API responses
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
    const url = new URL(adminLink, req.url)
    const adminToken = url.searchParams.get('token')

    return NextResponse.redirect(
      `${new URL(req.url).origin}/admin/booked?data=${encodedDetails}&url=${encodeURIComponent(match[1])}&email=${encodeURIComponent(adminEmail)}&token=${adminToken}`
    )
  }

  // Otherwise, something's wrong.
  return NextResponse.json(
    { error: 'Error trying to create an appointment' },
    { status: 500, headers: NO_STORE_HEADERS }
  )
}
