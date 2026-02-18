import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/lib/supabase/database.types'

export async function updateAppointmentStatus(
  calendarEventId: string,
  status: AppointmentStatus
): Promise<void> {
  const supabase = getSupabaseAdminClient()

  const timestamps: Record<string, string> = {}
  if (status === 'confirmed') timestamps.confirmed_at = new Date().toISOString()
  if (status === 'cancelled') timestamps.cancelled_at = new Date().toISOString()

  const { error } = await supabase
    .from('appointments')
    .update({ status, ...timestamps })
    .eq('calendar_event_id', calendarEventId)

  if (error) {
    console.error(`Failed to update appointment status to ${status}:`, error)
  }
}
