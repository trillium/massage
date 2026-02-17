import { NextResponse, type NextRequest } from 'next/server'
import { verifyEventToken } from '@/lib/eventToken'
import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import updateCalendarEvent from '@/lib/availability/updateCalendarEvent'
import {
  updateDescriptionFields,
  type EditableEventFields,
} from '@/lib/helpers/parseEventDescription'
import { isRequestEvent, getCleanSummary } from '@/lib/helpers/eventHelpers'

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

  const updateData: Record<string, unknown> = {}

  if (event.description) {
    updateData.description = updateDescriptionFields(event.description, fields)
  }

  if (fields.firstName !== undefined || fields.lastName !== undefined) {
    const cleanSummary = getCleanSummary(event)
    const match = cleanSummary.match(
      /^(\d+\s+minute\s+massage\s+with\s+).+(\s+-\s+TrilliumMassage)$/i
    )
    if (match) {
      const newName = [fields.firstName, fields.lastName].filter(Boolean).join(' ')
      const newSummary = `${match[1]}${newName}${match[2]}`
      updateData.summary = isRequestEvent(event) ? `REQUEST: ${newSummary}` : newSummary
    }
  }

  if (fields.location !== undefined) {
    updateData.location = fields.location
  }

  try {
    await updateCalendarEvent(event_id, updateData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update event:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}
