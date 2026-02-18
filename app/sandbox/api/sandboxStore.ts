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

function getClient() {
  return getSupabaseAdminClient()
}

function cleanupExpired() {
  const supabase = getClient()
  supabase
    .from('sandbox_sessions')
    .delete()
    .lt('created_at', new Date(Date.now() - SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString())
    .then(() => {})
}

export async function addEvent(sessionId: string, event: SandboxEvent) {
  if (Math.random() < 0.1) cleanupExpired()

  const supabase = getClient()
  await supabase.rpc('sandbox_add_event', {
    p_session_id: sessionId,
    p_event: event,
    p_max_events: MAX_EVENTS_PER_SESSION,
  })
}

export async function updateEventInStore(
  sessionId: string,
  calendarEventId: string,
  updates: Partial<SandboxEvent>
) {
  if (updates.description) {
    const supabase = getClient()
    await supabase.rpc('sandbox_update_event_description', {
      p_session_id: sessionId,
      p_calendar_event_id: calendarEventId,
      p_description: updates.description,
    })
  }
}

export async function addEmail(sessionId: string, email: SandboxEmail) {
  const sanitizedEmail = {
    ...email,
    body:
      email.body.length > MAX_EMAIL_BODY_LENGTH
        ? email.body.slice(0, MAX_EMAIL_BODY_LENGTH)
        : email.body,
    subject: email.subject.slice(0, 500),
    to: email.to.slice(0, 254),
  }

  const supabase = getClient()
  await supabase.rpc('sandbox_add_email', {
    p_session_id: sessionId,
    p_email: sanitizedEmail,
    p_max_emails: MAX_EMAILS_PER_SESSION,
  })
}

export async function approveEvent(
  sessionId: string,
  calendarEventId: string
): Promise<SandboxEvent | undefined> {
  const supabase = getClient()
  const { data } = await supabase.rpc('sandbox_update_event_status', {
    p_session_id: sessionId,
    p_calendar_event_id: calendarEventId,
    p_status: 'confirmed',
  })
  return (data as SandboxEvent) || undefined
}

export async function declineEvent(
  sessionId: string,
  calendarEventId: string
): Promise<SandboxEvent | undefined> {
  const supabase = getClient()
  const { data } = await supabase.rpc('sandbox_update_event_status', {
    p_session_id: sessionId,
    p_calendar_event_id: calendarEventId,
    p_status: 'declined',
  })
  return (data as SandboxEvent) || undefined
}

export async function getSessionState(sessionId: string) {
  const supabase = getClient()
  const { data } = await supabase
    .from('sandbox_sessions')
    .select('events, emails')
    .eq('session_id', sessionId)
    .single()

  if (!data) return { events: [] as SandboxEvent[], emails: [] as SandboxEmail[] }
  return {
    events: (data.events as SandboxEvent[]) || [],
    emails: (data.emails as SandboxEmail[]) || [],
  }
}

export async function resetSession(sessionId: string) {
  const supabase = getClient()
  await supabase.from('sandbox_sessions').delete().eq('session_id', sessionId)
}
