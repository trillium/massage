import { getSupabaseAdminClient } from '@/lib/supabase/server'

export async function releaseSlotHold(sessionId: string): Promise<void> {
  const supabase = getSupabaseAdminClient()

  const { error } = await supabase.rpc('release_slot_hold', {
    p_session_id: sessionId,
  })

  if (error) {
    console.error('release_slot_hold RPC failed:', error)
  }
}
