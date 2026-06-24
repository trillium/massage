import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { AppointmentRequestSchema } from '../schema'
import type sendMail from '../email'
import type { ApprovalEmail } from '../messaging/email/admin/Approval'
import type ClientRequestEmail from '../messaging/email/client/ClientRequestEmail'
import type { getHash } from '../hash'
import type createRequestCalendarEventFn from '../availability/createRequestCalendarEvent'
import type updateCalendarEventFn from '../availability/updateCalendarEvent'
import type { reserveAppointmentSlot as reserveAppointmentSlotFn } from './reserveAppointmentSlot'
import type { linkAppointmentToCalendarEvent as linkAppointmentToCalendarEventFn } from './linkAppointmentToCalendarEvent'
import requestEventSummary from '../messaging/templates/events/requestEventSummary'
import requestEventDescription from '../messaging/templates/events/requestEventDescription'
import { createConfirmUrl, createDeclineUrl } from '../messaging/utilities/createApprovalUrl'
import { intervalToHumanString } from '../intervalToHumanString'
import { flattenLocation } from '../helpers/locationHelpers'
import { createEventPageUrl } from '../eventToken'
import { releaseSlotHold } from '../holds/releaseSlotHold'
import { pushoverSendMessage } from '../messaging/push/admin/pushover'
import { AppointmentPushover } from '../messaging/push/admin/AppointmentPushover'
import type { SafeAppointmentData, SafeExtraFields } from './sanitizeRequestData'

type AppointmentRequestData = z.output<typeof AppointmentRequestSchema>

export async function handleStandardRequestBranch({
  data,
  safeData,
  safeLocation,
  safeExtraFields,
  origin,
  ownerTimeZone,
  siteMetadata,
  sendMailFn,
  approvalEmailFn,
  clientRequestEmailFn,
  getHashFn,
  createRequestCalendarEvent,
  updateCalendarEvent,
  reserveAppointmentSlot,
  linkAppointmentToCalendarEvent,
}: {
  data: AppointmentRequestData
  safeData: SafeAppointmentData
  safeLocation: string
  safeExtraFields: SafeExtraFields
  origin: string
  ownerTimeZone: string
  siteMetadata: { email?: string }
  sendMailFn: typeof sendMail
  approvalEmailFn: typeof ApprovalEmail
  clientRequestEmailFn: typeof ClientRequestEmail
  getHashFn: typeof getHash
  createRequestCalendarEvent: typeof createRequestCalendarEventFn
  updateCalendarEvent: typeof updateCalendarEventFn
  reserveAppointmentSlot: typeof reserveAppointmentSlotFn
  linkAppointmentToCalendarEvent: typeof linkAppointmentToCalendarEventFn
}): Promise<NextResponse> {
  const start = new Date(data.start)
  const end = new Date(data.end)
  const clientName = `${data.firstName} ${data.lastName}`

  const locationForReservation = flattenLocation(data.locationObject || data.locationString || '')
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
    location: locationForReservation,
    price: data.price ? Number.parseInt(data.price, 10) : null,
    status: 'pending',
    promo: data.promo || null,
    bookingUrl: data.bookingUrl || null,
    slugConfig: data.slugConfiguration || null,
    instantConfirm: false,
  })

  if (!reservation.success) {
    const body: Record<string, unknown> = { error: 'slot_unavailable', bookingUrl: data.bookingUrl }
    if (process.env.NODE_ENV !== 'production') {
      body.reason = reservation.reason
      body.source = 'reserveAppointmentSlot'
    }
    return NextResponse.json(body, { status: 409 })
  }

  const calendarResponse = await createRequestCalendarEvent({
    start: data.start,
    end: data.end,
    summary: requestEventSummary({ clientName, duration: data.duration }),
    description: 'Pending — links loading...',
    location: flattenLocation(data.locationObject || data.locationString || ''),
  })
  const calendarEventId = calendarResponse.id
  linkAppointmentToCalendarEvent(reservation.appointmentId, calendarEventId).catch(() => {})
  if (data.sessionId) releaseSlotHold(data.sessionId).catch(() => {})

  const acceptUrl = createConfirmUrl(origin, calendarEventId, data, getHashFn)
  const declineUrl = createDeclineUrl(origin, calendarEventId, getHashFn)

  await updateCalendarEvent(calendarEventId, {
    description: requestEventDescription({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      telegramHandle: data.telegramHandle,
      start: data.start,
      end: data.end,
      duration: data.duration,
      location: flattenLocation(data.locationObject || data.locationString || ''),
      price: data.price,
      promo: data.promo,
      additionalNotes: data.additionalNotes,
      edgeMemberType: data.edgeMemberType,
      timeZone: data.timeZone,
      ownerTimeZone,
      acceptUrl,
      declineUrl,
    }),
  })

  const approveEmail = approvalEmailFn({
    ...data,
    ...safeData,
    ...safeExtraFields,
    location: safeLocation,
    approveUrl: acceptUrl,
    declineUrl,
    dateSummary: intervalToHumanString({
      start,
      end,
      timeZone: ownerTimeZone,
    }),
    data: {
      ...data,
      ...safeData,
      ...safeExtraFields,
    },
  })

  const pushover = AppointmentPushover(data, ownerTimeZone, acceptUrl, declineUrl)

  pushoverSendMessage({
    message: pushover.message,
    title: pushover.title,
    priority: 0,
  })

  const eventPageUrl = createEventPageUrl(origin, calendarEventId, data.email, data.end)

  try {
    await sendMailFn({
      to: siteMetadata.email ?? '',
      subject: approveEmail.subject,
      body: approveEmail.body,
      template: 'ApprovalEmail',
      variables: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        start: data.start,
        end: data.end,
      },
    })

    const isEdgeBooking = (data.slugConfiguration?.eventContainer ?? '').startsWith('edge')
    const ownerTelegram = isEdgeBooking ? (process.env.OWNER_TELEGRAM ?? undefined) : undefined

    const confirmationEmail = await clientRequestEmailFn({
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
    await sendMailFn({
      to: data.email,
      subject: confirmationEmail.subject,
      body: confirmationEmail.body,
      template: 'ClientRequestEmail',
      variables: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        start: data.start,
        end: data.end,
      },
    })
  } catch (emailError) {
    console.error('Email send failed after calendar event created:', emailError)
    return NextResponse.json(
      {
        success: false,
        error: 'Calendar event created but email notification failed',
        calendarEventId,
      },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true, eventPageUrl }, { status: 200 })
}
