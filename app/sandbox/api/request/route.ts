import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { OWNER_TIMEZONE } from 'config'
import { handleAppointmentRequest } from '@/lib/handleAppointmentRequest'
import { ApprovalEmail } from '@/lib/messaging/email/admin/Approval'
import ClientRequestEmail from '@/lib/messaging/email/client/ClientRequestEmail'
import ClientConfirmEmail from '@/lib/messaging/email/client/ClientConfirmEmail'
import { AppointmentRequestSchema } from '@/lib/schema'
import siteMetadata from '@/data/siteMetadata'
import { addEvent, addEmail, updateEventInStore, validateSessionId } from '../sandboxStore'

function createFakeHash(data: string): string {
  return `sandbox-hash-${Buffer.from(data).toString('base64url').slice(0, 16)}`
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId || !validateSessionId(sessionId)) {
    return NextResponse.json({ error: 'Invalid or missing sessionId' }, { status: 400 })
  }

  const body = await req.json()

  const preValidation = AppointmentRequestSchema.safeParse(body)
  if (!preValidation.success) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
  }
  const validatedData = preValidation.data

  const wrappedReq = new NextRequest(req.url, {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify(body),
  })

  const fakeCalendarEventId = `sandbox-evt-${randomUUID().slice(0, 8)}`

  const fakeCreateRequestCalendarEvent = async (params: {
    start: string
    end: string
    summary: string
    description: string
    location?: string
  }) => {
    await addEvent(sessionId, {
      id: randomUUID(),
      status: 'pending',
      data: validatedData,
      calendarEventId: fakeCalendarEventId,
      createdAt: Date.now(),
      summary: params.summary,
      description: params.description,
      location: params.location || '',
    })
    return { id: fakeCalendarEventId }
  }

  const fakeUpdateCalendarEvent = async (eventId: string, updateData: Record<string, unknown>) => {
    await updateEventInStore(sessionId, eventId, {
      description: (updateData.description as string) || undefined,
    })
    return { id: eventId, ...updateData }
  }

  const fakeSendMail = async ({
    to,
    subject,
    body,
  }: {
    to: string
    subject: string
    body: string
  }) => {
    const isAdminEmail = to === (siteMetadata.email ?? '')
    await addEmail(sessionId, {
      to,
      subject,
      body,
      timestamp: Date.now(),
      type: isAdminEmail ? 'admin-approval' : 'client-request',
    })
  }

  const fakeRateLimiter = () => false

  const fakeHeaders = new Headers(req.headers)
  fakeHeaders.set('origin', req.nextUrl.origin)

  const response = await handleAppointmentRequest({
    req: wrappedReq,
    headers: fakeHeaders,
    sendMailFn: fakeSendMail,
    siteMetadata,
    ownerTimeZone: OWNER_TIMEZONE,
    approvalEmailFn: ApprovalEmail,
    clientRequestEmailFn: ClientRequestEmail,
    clientConfirmEmailFn: ClientConfirmEmail,
    getHashFn: createFakeHash,
    rateLimiter: fakeRateLimiter,
    schema: AppointmentRequestSchema,
    createRequestCalendarEvent: fakeCreateRequestCalendarEvent as Parameters<
      typeof handleAppointmentRequest
    >[0]['createRequestCalendarEvent'],
    updateCalendarEvent: fakeUpdateCalendarEvent as Parameters<
      typeof handleAppointmentRequest
    >[0]['updateCalendarEvent'],
  })

  const json = await response.json()

  if (json.success) {
    return NextResponse.json({
      ...json,
      eventPageUrl: `/sandbox?tab=admin&sessionId=${sessionId}`,
    })
  }

  return NextResponse.json(json, { status: response.status })
}
