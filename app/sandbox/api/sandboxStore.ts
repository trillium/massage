import { z } from 'zod'
import { AppointmentRequestSchema } from '@/lib/schema'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const SESSION_TTL_HOURS = 1
const MAX_EVENTS_PER_SESSION = 20
const MAX_EMAILS_PER_SESSION = 60
const MAX_EMAIL_BODY_LENGTH = 50_000

export type SandboxEvent = {
  id: string
  status: 'pending' | 'confirmed' | 'declined'
  data: z.output<typeof AppointmentRequestSchema>
  calendarEventId: string
  createdAt: number
  summary: string
  description: string
  location: string
}

export type SandboxEmail = {
  to: string
  subject: string
  body: string
  timestamp: number
  type: 'admin-approval' | 'client-request' | 'client-confirm'
}

export function validateSessionId(sessionId: string): boolean {
  return UUID_REGEX.test(sessionId)
}

function assertValidSessionId(sessionId: string) {
  if (!validateSessionId(sessionId)) {
    throw new Error('Invalid session ID: must be a UUID')
  }
}

function truncateEmailBody(body: string): string {
  return body.length > MAX_EMAIL_BODY_LENGTH ? body.slice(0, MAX_EMAIL_BODY_LENGTH) : body
}

function getClient() {
  return getSupabaseAdminClient()
}

async function cleanupExpired() {
  const supabase = getClient()
  await supabase
    .from('sandbox_sessions')
    .delete()
    .lt('created_at', new Date(Date.now() - SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString())
}

async function getSession(
  sessionId: string
): Promise<{ events: SandboxEvent[]; emails: SandboxEmail[] }> {
  const supabase = getClient()
  const { data } = await supabase
    .from('sandbox_sessions')
    .select('events, emails')
    .eq('session_id', sessionId)
    .single()

  if (!data) return { events: [], emails: [] }
  return {
    events: (data.events as SandboxEvent[]) || [],
    emails: (data.emails as SandboxEmail[]) || [],
  }
}

async function upsertSession(sessionId: string, events: SandboxEvent[], emails: SandboxEmail[]) {
  const supabase = getClient()
  await supabase.from('sandbox_sessions').upsert(
    {
      session_id: sessionId,
      events: JSON.parse(JSON.stringify(events)),
      emails: JSON.parse(JSON.stringify(emails)),
    },
    { onConflict: 'session_id' }
  )
}

export async function addEvent(sessionId: string, event: SandboxEvent) {
  assertValidSessionId(sessionId)
  await cleanupExpired()

  const session = await getSession(sessionId)
  if (session.events.length >= MAX_EVENTS_PER_SESSION) {
    throw new Error('Session event limit reached')
  }
  session.events.push(event)
  await upsertSession(sessionId, session.events, session.emails)
}

export async function updateEventInStore(
  sessionId: string,
  calendarEventId: string,
  updates: Partial<SandboxEvent>
) {
  assertValidSessionId(sessionId)
  const session = await getSession(sessionId)
  const event = session.events.find((e) => e.calendarEventId === calendarEventId)
  if (event) {
    Object.assign(event, updates)
    await upsertSession(sessionId, session.events, session.emails)
  }
}

export async function addEmail(sessionId: string, email: SandboxEmail) {
  assertValidSessionId(sessionId)
  const session = await getSession(sessionId)
  if (session.emails.length >= MAX_EMAILS_PER_SESSION) {
    return
  }
  session.emails.push({
    ...email,
    body: truncateEmailBody(email.body),
    subject: email.subject.slice(0, 500),
    to: email.to.slice(0, 254),
  })
  await upsertSession(sessionId, session.events, session.emails)
}

export async function approveEvent(sessionId: string, calendarEventId: string) {
  assertValidSessionId(sessionId)
  const session = await getSession(sessionId)
  const event = session.events.find((e) => e.calendarEventId === calendarEventId)
  if (event) {
    event.status = 'confirmed'
    await upsertSession(sessionId, session.events, session.emails)
  }
  return event
}

export async function declineEvent(sessionId: string, calendarEventId: string) {
  assertValidSessionId(sessionId)
  const session = await getSession(sessionId)
  const event = session.events.find((e) => e.calendarEventId === calendarEventId)
  if (event) {
    event.status = 'declined'
    await upsertSession(sessionId, session.events, session.emails)
  }
  return event
}

export async function getSessionState(sessionId: string) {
  assertValidSessionId(sessionId)
  return getSession(sessionId)
}

export async function resetSession(sessionId: string) {
  assertValidSessionId(sessionId)
  const supabase = getClient()
  await supabase.from('sandbox_sessions').delete().eq('session_id', sessionId)
}
