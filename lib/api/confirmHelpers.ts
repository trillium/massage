import { NextRequest, NextResponse } from 'next/server'
import { getHash } from 'lib/hash'
import type { LocationObject } from '@/lib/locationTypes'

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

type VerifyResult =
  | { success: true; data: Record<string, unknown>; hash: string }
  | { success: false; response: NextResponse }

export function verifyHashedData(req: NextRequest): VerifyResult {
  const searchParams = req.nextUrl.searchParams
  const data = searchParams.get('data')
  const key = searchParams.get('key')

  if (!data) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Data is missing' },
        { status: 400, headers: NO_STORE_HEADERS }
      ),
    }
  }

  const decoded = decodeURIComponent(data)
  const hash = getHash(decoded)

  if (hash !== key) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid key' },
        { status: 403, headers: NO_STORE_HEADERS }
      ),
    }
  }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(decoded)
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Malformed data payload' },
        { status: 400, headers: NO_STORE_HEADERS }
      ),
    }
  }

  return { success: true, data: parsed, hash }
}

export function parseLocation(validObject: Record<string, unknown>): LocationObject | NextResponse {
  if (validObject.locationString) {
    const parts = (validObject.locationString as string).split(',').map((part) => part.trim())
    return {
      street: parts[0] || '',
      city: parts[1] || '',
      zip: parts[2] || '',
    }
  }

  if (validObject.locationObject) {
    return validObject.locationObject as LocationObject
  }

  return NextResponse.json(
    { error: 'Location information is required' },
    { status: 400, headers: NO_STORE_HEADERS }
  )
}

interface BookedRedirectParams {
  req: NextRequest
  validObject: Record<string, unknown>
  locationObject: LocationObject
  details: { htmlLink?: string; attendees?: Array<Record<string, unknown>> }
}

export function buildBookedRedirect({
  req,
  validObject,
  locationObject,
  details,
}: BookedRedirectParams): NextResponse | null {
  const regex = /eid=([^&]+)/
  const match = details.htmlLink?.match(regex)

  if (!match?.[1]) return null

  const locationString =
    (validObject.locationString as string) ||
    [locationObject.street, locationObject.city, locationObject.zip].filter(Boolean).join(', ')

  const attendees =
    details.attendees && Array.isArray(details.attendees)
      ? details.attendees
          .filter((a) => a && typeof a === 'object' && 'email' in a && typeof a.email === 'string')
          .map((a) => ({
            email: a.email as string,
            name: (a.displayName as string) || (a.name as string),
          }))
      : [
          {
            email: validObject.email as string,
            name: validObject.firstName as string,
          },
        ]

  const bookedData = {
    ...validObject,
    locationObject,
    locationString,
    attendees,
    timeZone: validObject.timeZone,
    dateTime: validObject.start,
    start: { dateTime: validObject.start, timeZone: validObject.timeZone },
    end: { dateTime: validObject.end, timeZone: validObject.timeZone },
  }

  const encodedDetails = encodeURIComponent(JSON.stringify(bookedData))

  return NextResponse.redirect(
    `${new URL(req.url).origin}/admin/booked?data=${encodedDetails}&url=${encodeURIComponent(match[1])}`
  )
}

export { NO_STORE_HEADERS }
