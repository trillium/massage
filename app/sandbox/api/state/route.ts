import { NextRequest, NextResponse } from 'next/server'
import { getSessionState, resetSession, validateSessionId } from '../sandboxStore'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId || !validateSessionId(sessionId)) {
    return NextResponse.json({ error: 'Invalid or missing sessionId' }, { status: 400 })
  }

  const state = await getSessionState(sessionId)
  return NextResponse.json(state)
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId || !validateSessionId(sessionId)) {
    return NextResponse.json({ error: 'Invalid or missing sessionId' }, { status: 400 })
  }

  await resetSession(sessionId)
  return NextResponse.json({ success: true })
}
