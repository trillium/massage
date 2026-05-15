import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { Appointment } from '@/lib/supabase/database.types'

export async function getAppointmentByCalendarEventId(
  calendarEventId: string
): Promise<Appointment | null> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) throw new Error('Supabase client unavailable')

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('calendar_event_id', calendarEventId)
    .single()

  if (error || !data) return null
  return data
}
