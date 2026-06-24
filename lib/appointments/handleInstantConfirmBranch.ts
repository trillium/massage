import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { AppointmentRequestSchema } from '../schema'
import type sendMail from '../email'
import type ClientConfirmEmail from '../messaging/email/client/ClientConfirmEmail'
import type { getHash } from '../hash'
import type { reserveAppointmentSlot as reserveAppointmentSlotFn } from './reserveAppointmentSlot'
import type { linkAppointmentToCalendarEvent as linkAppointmentToCalendarEventFn } from './linkAppointmentToCalendarEvent'
import createCalendarAppointment from '../availability/createCalendarAppointment'
import eventSummary from '../messaging/templates/events/eventSummary'
import { intervalToHumanString } from '../intervalToHumanString'
import { flattenLocation } from '../helpers/locationHelpers'
import { createEventPageUrl } from '../eventToken'
import { releaseSlotHold } from '../holds/releaseSlotHold'
import { pushoverSendMessage } from '../messaging/push/admin/pushover'
import { AppointmentPushoverInstantConfirm } from '../messaging/push/admin/AppointmentPushoverInstantConfirm'
import type { SafeAppointmentData } from './sanitizeRequestData'

type AppointmentRequestData = z.output<typeof AppointmentRequestSchema>

export async function handleInstantConfirmBranch({
  data,
  safeData,
  safeLocation,
  origin,
  ownerTimeZone,
  sendMailFn,
  clientConfirmEmailFn,
  getHashFn,
  reserveAppointmentSlot,
  linkAppointmentToCalendarEvent,
}: {
  data: AppointmentRequestData
  safeData: SafeAppointmentData
  safeLocation: string
  origin: string
  ownerTimeZone: string
  sendMailFn: typeof sendMail
  clientConfirmEmailFn: typeof ClientConfirmEmail
  getHashFn: typeof getHash
  reserveAppointmentSlot: typeof reserveAppointmentSlotFn
  linkAppointmentToCalendarEvent: typeof linkAppointmentToCalendarEventFn
}): Promise<NextResponse> {
  const start = new Date(data.start)
  const end = new Date(data.end)

  const locationString = flattenLocation(data.locationObject || data.locationString || '')
  const reservation = await reserveAppointmentSlot({
    start: data.start,
    end: data.end,
    clientEmail: data.email,
    clientPhone: data.phone,
    clientTelegramHandle: data.telegramHandle,
    clientFirstName: data.firstName,
    clientLastName: data.lastName,
    durationMinutes: Number.parseInt(data.duration, 10),
    timezone: data.timeZone,
    location: locationString,
    price: data.price ? Number.parseInt(data.price, 10) : null,
    status: 'confirmed',
    promo: data.promo || null,
    bookingUrl: data.bookingUrl || null,
    slugConfig: data.slugConfiguration || null,
    instantConfirm: true,
    confirmedAt: new Date().toISOString(),
  })

  if (!reservation.success) {
    const body: Record<string, unknown> = {
      error: 'slot_unavailable',
      bookingUrl: data.bookingUrl,
    }
    if (process.env.NODE_ENV !== 'production') {
      body.reason = reservation.reason
      body.source = 'reserveAppointmentSlot'
    }
    return NextResponse.json(body, { status: 409 })
  }

  const location = data.locationObject || { street: '', city: data.locationString || '', zip: '' }
  const requestId = getHashFn(JSON.stringify(data))

  const calendarResponse = await createCalendarAppointment({
    ...data,
    location,
    requestId,
    summary:
      eventSummary({
        duration: data.duration,
        clientName: `${data.firstName} ${data.lastName}`,
      }) || 'Instant Confirm Appointment',
  })

  if (!calendarResponse.ok) {
    return NextResponse.json({ error: 'Failed to create calendar appointment' }, { status: 502 })
  }

  const pushover = AppointmentPushoverInstantConfirm(data, ownerTimeZone)

  pushoverSendMessage({
    message: pushover.message,
    title: pushover.title,
    priority: 0,
  })

  const calendarData = await calendarResponse.json()
  linkAppointmentToCalendarEvent(reservation.appointmentId, calendarData.id).catch(() => {})
  if (data.sessionId) releaseSlotHold(data.sessionId).catch(() => {})
  const eventPageUrl = createEventPageUrl(origin, calendarData.id, data.email, data.end)

  const isEdgeBooking = (data.slugConfiguration?.eventContainer ?? '').startsWith('edge')
  const ownerTelegram = isEdgeBooking ? (process.env.OWNER_TELEGRAM ?? undefined) : undefined

  const confirmationEmail = clientConfirmEmailFn({
    ...data,
    ...safeData,
    location: safeLocation,
    eventPageUrl,
    ownerTelegram,
    dateSummary: intervalToHumanString({
      start,
      end,
      timeZone: data.timeZone,
    }),
  })
  sendMailFn({
    to: data.email,
    subject: confirmationEmail.subject,
    body: confirmationEmail.body,
    template: 'ClientConfirmEmail',
    variables: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      start: data.start,
      end: data.end,
    },
  }).catch((err: unknown) => console.error('Failed to send instant confirm email:', err))

  return NextResponse.json({ success: true, instantConfirm: true, eventPageUrl }, { status: 200 })
}
