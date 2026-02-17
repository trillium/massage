import { NextRequest, NextResponse } from 'next/server'
import { intervalToHumanString } from './intervalToHumanString'
import sendMail from './email'
import { ApprovalEmail } from './messaging/email/admin/Approval'
import ClientRequestEmail from './messaging/email/client/ClientRequestEmail'
import ClientConfirmEmail from './messaging/email/client/ClientConfirmEmail'
import { getHash } from './hash'
import { AppointmentRequestSchema } from './schema'
import { z } from 'zod'
// Manual type for the result of schema.safeParse(jsonData) (for Zod v4)
import { pushoverSendMessage } from './messaging/push/admin/pushover'
import { AppointmentPushover } from './messaging/push/admin/AppointmentPushover'
import { AppointmentPushoverInstantConfirm } from './messaging/push/admin/AppointmentPushoverInstantConfirm'
import { createConfirmUrl, createDeclineUrl } from './messaging/utilities/createApprovalUrl'
import createCalendarAppointment from './availability/createCalendarAppointment'
import type createRequestCalendarEventFn from './availability/createRequestCalendarEvent'
import type updateCalendarEventFn from './availability/updateCalendarEvent'
import eventSummary from './messaging/templates/events/eventSummary'
import requestEventSummary from './messaging/templates/events/requestEventSummary'
import requestEventDescription from './messaging/templates/events/requestEventDescription'
import { flattenLocation } from './helpers/locationHelpers'
import { escapeHtml } from './messaging/escapeHtml'

export type AppointmentRequestValidationResult =
  | { success: true; data: z.output<typeof AppointmentRequestSchema> }
  | { success: false; error: z.ZodError<z.input<typeof AppointmentRequestSchema>> }

export async function handleAppointmentRequest({
  req,
  headers,
  sendMailFn,
  siteMetadata,
  ownerTimeZone,
  approvalEmailFn,
  clientRequestEmailFn,
  clientConfirmEmailFn,
  getHashFn,
  rateLimiter,
  schema,
  createRequestCalendarEvent,
  updateCalendarEvent,
}: {
  req: NextRequest
  headers: Headers
  sendMailFn: typeof sendMail
  siteMetadata: { email?: string }
  ownerTimeZone: string
  approvalEmailFn: typeof ApprovalEmail
  clientRequestEmailFn: typeof ClientRequestEmail
  clientConfirmEmailFn: typeof ClientConfirmEmail
  getHashFn: typeof getHash
  rateLimiter: (req: NextRequest, headers: Headers) => boolean
  schema: typeof AppointmentRequestSchema
  createRequestCalendarEvent: typeof createRequestCalendarEventFn
  updateCalendarEvent: typeof updateCalendarEventFn
}) {
  const jsonData = await req.json()
  if (rateLimiter(req, headers)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const validationResult: AppointmentRequestValidationResult = schema.safeParse(jsonData)
  if (!validationResult.success) {
    return NextResponse.json(validationResult.error.message, { status: 400 })
  }
  const { data } = validationResult

  const safeLocation = escapeHtml(flattenLocation(data.locationObject || data.locationString || ''))
  const safeData = {
    firstName: escapeHtml(data.firstName),
    lastName: escapeHtml(data.lastName),
    phone: escapeHtml(data.phone),
    email: escapeHtml(data.email),
    promo: data.promo ? escapeHtml(data.promo) : data.promo,
    timeZone: escapeHtml(data.timeZone),
  }

  // Check if instantConfirm is true
  if (data.instantConfirm) {
    const start = new Date(data.start)
    const end = new Date(data.end)

    // Create the calendar appointment directly
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

    // Send pushover notification for instant confirm
    const pushover = AppointmentPushoverInstantConfirm(data, ownerTimeZone)

    pushoverSendMessage({
      message: pushover.message,
      title: pushover.title,
      priority: 0,
    })

    // Send confirmation email directly
    const confirmationEmail = await clientConfirmEmailFn({
      ...data,
      ...safeData,
      location: safeLocation,
      email: data.email, // Explicitly pass the email
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
    })

    return NextResponse.json({ success: true, instantConfirm: true }, { status: 200 })
  }

  const start = new Date(data.start)
  const end = new Date(data.end)
  const origin = headers.get('origin') ?? '?'
  const clientName = `${data.firstName} ${data.lastName}`

  // Phase 1: Create REQUEST calendar event with placeholder description
  const calendarResponse = await createRequestCalendarEvent({
    start: data.start,
    end: data.end,
    summary: requestEventSummary({ clientName, duration: data.duration }),
    description: 'Pending — links loading...',
    location: flattenLocation(data.locationObject || data.locationString || ''),
  })
  const calendarEventId = calendarResponse.id

  // Phase 2: Build accept/decline URLs using the calendarEventId
  const acceptUrl = createConfirmUrl(origin, calendarEventId, data, getHashFn)
  const declineUrl = createDeclineUrl(origin, calendarEventId, getHashFn)

  // Phase 3: Patch the calendar event with real description containing links
  await updateCalendarEvent(calendarEventId, {
    description: requestEventDescription({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      start: data.start,
      end: data.end,
      duration: data.duration,
      location: flattenLocation(data.locationObject || data.locationString || ''),
      price: data.price,
      promo: data.promo,
      timeZone: data.timeZone,
      ownerTimeZone,
      acceptUrl,
      declineUrl,
    }),
  })

  const safeExtraFields = {
    hotelRoomNumber: data.hotelRoomNumber ? escapeHtml(data.hotelRoomNumber) : data.hotelRoomNumber,
    parkingInstructions: data.parkingInstructions
      ? escapeHtml(data.parkingInstructions)
      : data.parkingInstructions,
    additionalNotes: data.additionalNotes ? escapeHtml(data.additionalNotes) : data.additionalNotes,
  }

  // Send admin approval email with accept + decline links
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

  // Send pushover with accept + decline links
  const pushover = AppointmentPushover(data, ownerTimeZone, acceptUrl, declineUrl)

  pushoverSendMessage({
    message: pushover.message,
    title: pushover.title,
    priority: 0,
  })

  await sendMailFn({
    to: siteMetadata.email ?? '',
    subject: approveEmail.subject,
    body: approveEmail.body,
  })

  // Send client email with cancel link
  const confirmationEmail = await clientRequestEmailFn({
    ...data,
    ...safeData,
    location: safeLocation,
    email: data.email,
    cancelUrl: declineUrl,
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
  })
  return NextResponse.json({ success: true }, { status: 200 })
}
