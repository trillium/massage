import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

import createOnsiteAppointment from 'lib/availability/createOnsiteAppointment'
import onsiteEventSummary from 'lib/messaging/templates/events/onsiteEventSummary'
import { OnSiteRequestSchema } from 'lib/schema'
import {
  verifyHashedData,
  parseLocation,
  buildBookedRedirect,
  NO_STORE_HEADERS,
} from '@/lib/api/confirmHelpers'
import { createAppointmentRecord } from '@/lib/appointments/createAppointmentRecord'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const verified = verifyHashedData(req)
  if (!verified.success) return verified.response

  const validationResult = OnSiteRequestSchema.safeParse(verified.data)

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

  const transformedPricing = validObject.pricing
    ? Object.fromEntries(
        Object.entries(validObject.pricing).map(([key, value]) => [Number(key), Number(value)])
      )
    : undefined

  const response = await createOnsiteAppointment({
    ...validObject,
    location: locationObject,
    pricing: transformedPricing,
    requestId: verified.hash,
    summary: onsiteEventSummary(validObject) || 'Error in createEventSummary()',
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to create calendar appointment' },
      { status: 502, headers: NO_STORE_HEADERS }
    )
  }

  const details = await response.json()
  createAppointmentRecord(details.id, validObject, 'confirmed').catch(() => {})

  const redirect = buildBookedRedirect({ req, validObject, locationObject, details })
  if (redirect) return redirect

  return NextResponse.json(
    { error: 'Error trying to create an appointment' },
    { status: 500, headers: NO_STORE_HEADERS }
  )
}
