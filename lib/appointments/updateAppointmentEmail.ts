import { getSupabaseAdminClient } from '@/lib/supabase/server'

export async function updateAppointmentEmail(
  calendarEventId: string,
  email: string
): Promise<void> {
  const supabase = getSupabaseAdminClient()

  const { error } = await supabase
    .from('appointments')
    .update({ client_email: email })
    .eq('calendar_event_id', calendarEventId)

  if (error) {
    console.error('Failed to update appointment email:', error)
  }
}
