import { NextRequest, NextResponse } from 'next/server'
import { approveEvent, addEmail, validateSessionId } from '../sandboxStore'
import ClientConfirmEmail from '@/lib/messaging/email/client/ClientConfirmEmail'
import { intervalToHumanString } from '@/lib/intervalToHumanString'
import { flattenLocation } from '@/lib/helpers/locationHelpers'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { sessionId, calendarEventId } = await req.json()

  if (!sessionId || !validateSessionId(sessionId)) {
    return NextResponse.json({ error: 'Invalid or missing sessionId' }, { status: 400 })
  }
  if (!calendarEventId || typeof calendarEventId !== 'string') {
    return NextResponse.json({ error: 'Missing calendarEventId' }, { status: 400 })
  }

  const event = await approveEvent(sessionId, calendarEventId)
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const { data } = event
  const location = flattenLocation(data.locationObject || data.locationString || '')
  const dateSummary = intervalToHumanString({
    start: new Date(data.start),
    end: new Date(data.end),
    timeZone: data.timeZone,
  })

  const confirmEmail = ClientConfirmEmail({
    duration: data.duration,
    price: data.price,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    timeZone: data.timeZone,
    dateSummary,
    location,
    bookingUrl: data.bookingUrl,
    promo: data.promo,
  })

  await addEmail(sessionId, {
    to: data.email,
    subject: confirmEmail.subject,
    body: confirmEmail.body,
    timestamp: Date.now(),
    type: 'client-confirm',
  })

  return NextResponse.json({ success: true })
}
