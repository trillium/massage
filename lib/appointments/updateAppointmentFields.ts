import { getSupabaseAdminClient } from '@/lib/supabase/server'

interface UpdatableFields {
  client_first_name?: string
  client_last_name?: string
  client_email?: string
  client_phone?: string
  location?: string
}

export async function updateAppointmentFields(
  calendarEventId: string,
  fields: UpdatableFields
): Promise<void> {
  const filtered = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined)
  )
  if (Object.keys(filtered).length === 0) return

  const supabase = getSupabaseAdminClient()

  const { error } = await supabase
    .from('appointments')
    .update(filtered)
    .eq('calendar_event_id', calendarEventId)

  if (error) {
    console.error('Failed to update appointment fields:', error)
  }
}
