import { NextRequest, NextResponse } from 'next/server'
import sendMail from './email'
import { ApprovalEmail } from './messaging/email/admin/Approval'
import ClientRequestEmail from './messaging/email/client/ClientRequestEmail'
import ClientConfirmEmail from './messaging/email/client/ClientConfirmEmail'
import { getHash } from './hash'
import { AppointmentRequestSchema } from './schema'
import { z } from 'zod'
import type createRequestCalendarEventFn from './availability/createRequestCalendarEvent'
import type updateCalendarEventFn from './availability/updateCalendarEvent'
import type { CheckSlotAvailabilityFn } from './availability/checkSlotAvailability'
import { getOriginFromHeaders } from './helpers/getOriginFromHeaders'
import type { reserveAppointmentSlot as reserveAppointmentSlotFn } from './appointments/reserveAppointmentSlot'
import type { linkAppointmentToCalendarEvent as linkAppointmentToCalendarEventFn } from './appointments/linkAppointmentToCalendarEvent'
import { sanitizeAppointmentData } from './appointments/sanitizeRequestData'
import { handleRescheduleBranch } from './appointments/handleRescheduleBranch'
import { handleInstantConfirmBranch } from './appointments/handleInstantConfirmBranch'
import { handleStandardRequestBranch } from './appointments/handleStandardRequestBranch'

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
  checkSlotAvailability,
  reserveAppointmentSlot,
  linkAppointmentToCalendarEvent,
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
  checkSlotAvailability: CheckSlotAvailabilityFn
  reserveAppointmentSlot: typeof reserveAppointmentSlotFn
  linkAppointmentToCalendarEvent: typeof linkAppointmentToCalendarEventFn
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

  if (!data.rescheduleEventId) {
    try {
      const availability = await checkSlotAvailability({
        start: data.start,
        end: data.end,
        eventBaseString: data.eventBaseString,
        blockingScope: data.slugConfiguration?.blockingScope,
        blockingContainers: data.slugConfiguration?.blockingContainers,
        sessionId: data.sessionId,
      })
      if (!availability.available) {
        const body: Record<string, unknown> = {
          error: 'slot_unavailable',
          bookingUrl: data.bookingUrl,
        }
        if (process.env.NODE_ENV !== 'production') {
          body.reason = availability.reason ?? 'unknown'
          body.detail = availability.detail
          body.source = 'checkSlotAvailability'
        }
        return NextResponse.json(body, { status: 409 })
      }
    } catch {
      return NextResponse.json({ error: 'Unable to verify availability' }, { status: 503 })
    }
  }

  const { safeData, safeLocation, safeExtraFields } = sanitizeAppointmentData(data)
  const origin = getOriginFromHeaders(headers)

  if (data.rescheduleEventId && data.rescheduleToken) {
    return handleRescheduleBranch({
      data: {
        ...data,
        rescheduleEventId: data.rescheduleEventId,
        rescheduleToken: data.rescheduleToken,
      },
      safeData,
      origin,
      updateCalendarEvent,
    })
  }

  if (data.instantConfirm) {
    return handleInstantConfirmBranch({
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
    })
  }

  return handleStandardRequestBranch({
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
  })
}
