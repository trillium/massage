import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { DateTimeInterval } from '@/lib/availabilityTypes'

export async function getActiveHolds(
  start: string,
  end: string,
  excludeSessionId?: string
): Promise<DateTimeInterval[]> {
  const supabase = getSupabaseAdminClient()

  let query = supabase
    .from('slot_holds')
    .select('start_time, end_time')
    .gt('expires_at', new Date().toISOString())
    .lt('start_time', end)
    .gt('end_time', start)

  if (excludeSessionId) {
    query = query.neq('session_id', excludeSessionId)
  }

  const { data, error } = await query

  if (error) {
    console.error('getActiveHolds query failed:', error)
    return []
  }

  return (data ?? []).map((row) => ({
    start: new Date(row.start_time),
    end: new Date(row.end_time),
  }))
}
