import { NextResponse, type NextRequest } from 'next/server'
import { verifyEventToken } from '@/lib/eventToken'
import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import updateCalendarEvent from '@/lib/availability/updateCalendarEvent'
import { pushoverSendMessage } from '@/lib/messaging/push/admin/pushover'
import { getCleanSummary } from '@/lib/helpers/eventHelpers'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ event_id: string }> }
) {
  const { event_id } = await params

  let body: { token?: string; reason?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { token, reason } = body
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 401 })
  }

  const result = verifyEventToken(token, event_id)
  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 403 })
  }

  const event = await fetchSingleEvent(event_id)
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  if (event.status === 'cancelled') {
    return NextResponse.json({ success: true, message: 'Already cancelled' })
  }

  try {
    await updateCalendarEvent(event_id, { status: 'cancelled' })
  } catch (error) {
    console.error('Failed to cancel event:', error)
    return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 })
  }

  const summary = getCleanSummary(event)
  const isReschedule = reason === 'reschedule'
  pushoverSendMessage({
    title: isReschedule ? 'Client Rescheduled' : 'Client Cancelled',
    message: `${summary}\n${isReschedule ? 'Rescheduled' : 'Cancelled'} by ${result.payload.email}`,
    priority: 0,
  }).catch(() => {})

  return NextResponse.json({ success: true, message: 'Appointment cancelled' })
}
