import { NextRequest, NextResponse } from 'next/server'
import { declineEvent, validateSessionId } from '../sandboxStore'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { sessionId, calendarEventId } = await req.json()

  if (!sessionId || !validateSessionId(sessionId)) {
    return NextResponse.json({ error: 'Invalid or missing sessionId' }, { status: 400 })
  }
  if (!calendarEventId || typeof calendarEventId !== 'string') {
    return NextResponse.json({ error: 'Missing calendarEventId' }, { status: 400 })
  }

  const event = await declineEvent(sessionId, calendarEventId)
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
