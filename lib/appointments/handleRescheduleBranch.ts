import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { AppointmentRequestSchema } from '../schema'
import type updateCalendarEventFn from '../availability/updateCalendarEvent'
import { createEventPageUrl, verifyEventToken } from '../eventToken'
import { formatLocalDate, formatLocalTime } from '../availability/helpers'
import { pushoverSendMessage } from '../messaging/push/admin/pushover'
import type { SafeAppointmentData } from './sanitizeRequestData'

type AppointmentRequestData = z.output<typeof AppointmentRequestSchema>

export async function handleRescheduleBranch({
  data,
  safeData,
  origin,
  updateCalendarEvent,
}: {
  data: AppointmentRequestData & { rescheduleEventId: string; rescheduleToken: string }
  safeData: SafeAppointmentData
  origin: string
  updateCalendarEvent: typeof updateCalendarEventFn
}): Promise<NextResponse> {
  const tokenResult = verifyEventToken(data.rescheduleToken, data.rescheduleEventId)
  if (!tokenResult.valid) {
    return NextResponse.json({ error: tokenResult.error }, { status: 403 })
  }

  try {
    await updateCalendarEvent(data.rescheduleEventId, {
      start: { dateTime: data.start, timeZone: data.timeZone },
      end: { dateTime: data.end, timeZone: data.timeZone },
    })
  } catch (error) {
    console.error('Failed to reschedule event:', error)
    return NextResponse.json({ error: 'Failed to reschedule appointment' }, { status: 500 })
  }

  const eventPageUrl = createEventPageUrl(origin, data.rescheduleEventId, data.email, data.end)

  pushoverSendMessage({
    title: 'Client Rescheduled',
    message: `${safeData.firstName} ${safeData.lastName} rescheduled to ${formatLocalDate(data.start)} ${formatLocalTime(data.start)}`,
    priority: 0,
  }).catch(() => {})

  return NextResponse.json({ success: true, eventPageUrl }, { status: 200 })
}
