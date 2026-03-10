import { getSupabaseAdminClient } from '@/lib/supabase/server'

type ClaimResult = { success: true; holdId: string } | { success: false; reason: string }

export async function claimSlotHold(
  sessionId: string,
  start: string,
  end: string
): Promise<ClaimResult> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase.rpc('claim_slot_hold', {
    p_session_id: sessionId,
    p_start: start,
    p_end: end,
  })

  if (error) {
    console.error('claim_slot_hold RPC failed:', error)
    return { success: false, reason: 'rpc_error' }
  }

  const result = data as { success: boolean; hold_id?: string; reason?: string }
  if (result.success) {
    return { success: true, holdId: result.hold_id! }
  }
  return { success: false, reason: result.reason ?? 'unknown' }
}
