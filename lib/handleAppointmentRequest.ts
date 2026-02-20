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
import { createEventPageUrl, verifyEventToken } from './eventToken'
import { getOriginFromHeaders } from './helpers/getOriginFromHeaders'
import { formatLocalDate, formatLocalTime } from './availability/helpers'
import { createAppointmentRecord } from './appointments/createAppointmentRecord'

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ])
}

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

  const origin = getOriginFromHeaders(headers)

  if (data.rescheduleEventId && data.rescheduleToken) {
    const tokenResult = verifyEventToken(data.rescheduleToken, data.rescheduleEventId)
    if (!tokenResult.valid) {
      return NextResponse.json({ error: tokenResult.error }, { status: 403 })
    }

    try {
      await withTimeout(
        updateCalendarEvent(data.rescheduleEventId, {
          start: { dateTime: data.start, timeZone: data.timeZone },
          end: { dateTime: data.end, timeZone: data.timeZone },
        }),
        15_000,
        'Reschedule calendar update'
      )
    } catch (error) {
      console.error('Failed to reschedule event:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to reschedule appointment',
          errorType: 'retryable',
        },
        { status: 500 }
      )
    }

    const eventPageUrl = createEventPageUrl(origin, data.rescheduleEventId, data.email, data.end)

    pushoverSendMessage({
      title: 'Client Rescheduled',
      message: `${safeData.firstName} ${safeData.lastName} rescheduled to ${formatLocalDate(data.start)} ${formatLocalTime(data.start)}`,
      priority: 0,
    }).catch(() => {})

    return NextResponse.json({ success: true, eventPageUrl }, { status: 200 })
  }

  if (data.instantConfirm) {
    const start = new Date(data.start)
    const end = new Date(data.end)

    const location = data.locationObject || { street: '', city: data.locationString || '', zip: '' }
    const requestId = getHashFn(JSON.stringify(data))

    let calendarResponse: Response
    try {
      calendarResponse = await withTimeout(
        createCalendarAppointment({
          ...data,
          location,
          requestId,
          summary:
            eventSummary({
              duration: data.duration,
              clientName: `${data.firstName} ${data.lastName}`,
            }) || 'Instant Confirm Appointment',
        }),
        15_000,
        'Instant confirm calendar create'
      )
    } catch (error) {
      console.error('Instant confirm calendar create failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create calendar appointment',
          errorType: 'retryable',
        },
        { status: 502 }
      )
    }

    if (!calendarResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create calendar appointment',
          errorType: 'retryable',
        },
        { status: 502 }
      )
    }

    const pushover = AppointmentPushoverInstantConfirm(data, ownerTimeZone)
    pushoverSendMessage({
      message: pushover.message,
      title: pushover.title,
      priority: 0,
    }).catch(() => {})

    const calendarData = await calendarResponse.json()
    createAppointmentRecord(calendarData.id, data, 'confirmed').catch(() => {})
    const eventPageUrl = createEventPageUrl(origin, calendarData.id, data.email, data.end)

    try {
      const confirmationEmail = await clientConfirmEmailFn({
        ...data,
        ...safeData,
        location: safeLocation,
        eventPageUrl,
        dateSummary: intervalToHumanString({
          start,
          end,
          timeZone: data.timeZone,
        }),
      })
      await withTimeout(
        sendMailFn({
          to: data.email,
          subject: confirmationEmail.subject,
          body: confirmationEmail.body,
        }),
        15_000,
        'Instant confirm email send'
      )
    } catch (emailError) {
      console.error('Instant confirm email failed:', emailError)
      pushoverSendMessage({
        title: 'Email Failed - Instant Confirm',
        message: `Confirmation email to ${data.email} failed. Calendar event created: ${calendarData.id}`,
        priority: 1,
      }).catch(() => {})
      return NextResponse.json(
        {
          success: true,
          instantConfirm: true,
          eventPageUrl,
          error: 'Calendar event created but confirmation email failed',
          errorType: 'partial_success',
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ success: true, instantConfirm: true, eventPageUrl }, { status: 200 })
  }

  const start = new Date(data.start)
  const end = new Date(data.end)
  const clientName = `${data.firstName} ${data.lastName}`

  let calendarEventId: string
  try {
    const calendarResponse = await withTimeout(
      createRequestCalendarEvent({
        start: data.start,
        end: data.end,
        summary: requestEventSummary({ clientName, duration: data.duration }),
        description: 'Pending — links loading...',
        location: flattenLocation(data.locationObject || data.locationString || ''),
      }),
      15_000,
      'Standard request calendar create'
    )
    calendarEventId = calendarResponse.id
  } catch (error) {
    console.error('Standard request calendar create failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create calendar event',
        errorType: 'retryable',
      },
      { status: 502 }
    )
  }

  createAppointmentRecord(calendarEventId, data, 'pending').catch(() => {})

  const acceptUrl = createConfirmUrl(origin, calendarEventId, data, getHashFn)
  const declineUrl = createDeclineUrl(origin, calendarEventId, getHashFn)

  try {
    await withTimeout(
      updateCalendarEvent(calendarEventId, {
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
      }),
      15_000,
      'Standard request calendar update'
    )
  } catch (error) {
    console.error('Calendar event update with links failed (non-fatal):', error)
  }

  const safeExtraFields = {
    hotelRoomNumber: data.hotelRoomNumber ? escapeHtml(data.hotelRoomNumber) : data.hotelRoomNumber,
    parkingInstructions: data.parkingInstructions
      ? escapeHtml(data.parkingInstructions)
      : data.parkingInstructions,
    additionalNotes: data.additionalNotes ? escapeHtml(data.additionalNotes) : data.additionalNotes,
  }

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
  }).catch(() => {})

  const eventPageUrl = createEventPageUrl(origin, calendarEventId, data.email, data.end)

  try {
    await withTimeout(
      sendMailFn({
        to: siteMetadata.email ?? '',
        subject: approveEmail.subject,
        body: approveEmail.body,
      }),
      15_000,
      'Admin approval email'
    )

    const confirmationEmail = await clientRequestEmailFn({
      ...data,
      ...safeData,
      location: safeLocation,
      eventPageUrl,
      dateSummary: intervalToHumanString({
        start,
        end,
        timeZone: data.timeZone,
      }),
    })
    await withTimeout(
      sendMailFn({
        to: data.email,
        subject: confirmationEmail.subject,
        body: confirmationEmail.body,
      }),
      15_000,
      'Client confirmation email'
    )
  } catch (emailError) {
    console.error('Email send failed after calendar event created:', emailError)
    pushoverSendMessage({
      title: 'Email Failed - Appointment Request',
      message: `Email to ${data.email} failed. Calendar event: ${calendarEventId}`,
      priority: 1,
    }).catch(() => {})
    return NextResponse.json(
      {
        success: true,
        eventPageUrl,
        error: 'Calendar event created but email notification failed',
        errorType: 'partial_success',
      },
      { status: 200 }
    )
  }

  return NextResponse.json({ success: true, eventPageUrl }, { status: 200 })
}
