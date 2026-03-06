import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { LRUCache } from 'lru-cache'
import createRequestCalendarEvent from 'lib/availability/createRequestCalendarEvent'
import { createCheckSlotAvailability } from 'lib/availability/checkSlotAvailability'
import getBusyTimes from 'lib/availability/getBusyTimes'
import { getEventsBySearchQuery } from 'lib/availability/getEventsBySearchQuery'
import { checkRateLimitFactory } from 'lib/checkRateLimitFactory'
import { headers as nextHeaders } from 'next/headers'
import { SLOT_PADDING } from 'config'

export const dynamic = 'force-dynamic'

const EventBookingSchema = z.object({
  name: z.string().min(1),
  start: z.string().refine((v) => !Number.isNaN(Date.parse(v))),
  end: z.string().refine((v) => !Number.isNaN(Date.parse(v))),
  duration: z.number(),
})

const rateLimitLRU = new LRUCache({ max: 500, ttl: 60_000 })
const checkRateLimit = checkRateLimitFactory(rateLimitLRU, 5)

const checkSlotAvailability = createCheckSlotAvailability({
  padding: SLOT_PADDING,
  getBusyTimesFn: getBusyTimes,
  getEventsBySearchQueryFn: getEventsBySearchQuery,
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const headers = await nextHeaders()

  if (checkRateLimit(req, headers)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const body = await req.json()
  const parsed = EventBookingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { name, start, end, duration } = parsed.data

  const availability = await checkSlotAvailability({ start, end })
  if (!availability.available) {
    return NextResponse.json({ error: 'slot_unavailable' }, { status: 409 })
  }

  try {
    const result = await createRequestCalendarEvent({
      start,
      end,
      summary: `Event Booking: ${name} (${duration}min)`,
      description: `Walk-up event booking\nName: ${name}\nDuration: ${duration} minutes`,
    })

    return NextResponse.json({ success: true, eventId: result.id })
  } catch {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 502 })
  }
}
