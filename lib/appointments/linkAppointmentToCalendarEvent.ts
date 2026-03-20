import { getSupabaseAdminClient } from '@/lib/supabase/server'

export async function linkAppointmentToCalendarEvent(
  appointmentId: string,
  calendarEventId: string
): Promise<void> {
  const supabase = getSupabaseAdminClient()

  const { error } = await supabase
    .from('appointments')
    .update({ calendar_event_id: calendarEventId })
    .eq('id', appointmentId)

  if (error) {
    console.error('Failed to link appointment to calendar event:', error)
  }
}
