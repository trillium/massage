import { NextResponse, type NextRequest } from 'next/server'
import { verifyEventToken } from '@/lib/eventToken'
import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import updateCalendarEvent from '@/lib/availability/updateCalendarEvent'
import {
  updateDescriptionFields,
  type EditableEventFields,
} from '@/lib/helpers/parseEventDescription'
import {
  isRequestEvent,
  getCleanSummary,
  rebuildSummary,
  REQUEST_PREFIX,
} from '@/lib/helpers/eventHelpers'
import { escapeHtml } from '@/lib/messaging/escapeHtml'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ event_id: string }> }
) {
  const { event_id } = await params

  let body: { token?: string; fields?: Partial<EditableEventFields> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { token, fields } = body
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 401 })
  }
  if (!fields || Object.keys(fields).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
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
    return NextResponse.json({ error: 'Cannot edit a cancelled appointment' }, { status: 400 })
  }

  const sanitized: Partial<EditableEventFields> = {}
  if (fields.firstName !== undefined) sanitized.firstName = escapeHtml(fields.firstName)
  if (fields.lastName !== undefined) sanitized.lastName = escapeHtml(fields.lastName)
  if (fields.phone !== undefined) sanitized.phone = escapeHtml(fields.phone)
  if (fields.location !== undefined) sanitized.location = escapeHtml(fields.location)

  const updateData: Record<string, unknown> = {}

  if (event.description) {
    updateData.description = updateDescriptionFields(event.description, sanitized)
  }

  if (sanitized.firstName !== undefined || sanitized.lastName !== undefined) {
    const newName = [sanitized.firstName, sanitized.lastName].filter(Boolean).join(' ')
    const rebuilt = rebuildSummary(getCleanSummary(event), newName)
    if (rebuilt) {
      updateData.summary = isRequestEvent(event) ? `${REQUEST_PREFIX}${rebuilt}` : rebuilt
    }
  }

  if (sanitized.location !== undefined) {
    updateData.location = sanitized.location
  }

  try {
    await updateCalendarEvent(event_id, updateData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update event:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}
