import { getSupabaseAdminClient } from '@/lib/supabase/server'

type ExtendResult = { extended: true } | { extended: false; reason: string }

export async function extendSlotHold(sessionId: string): Promise<ExtendResult> {
  const supabase = getSupabaseAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RPC not in generated types until migration runs
  const { data, error } = await (supabase.rpc as any)('extend_slot_hold', {
    p_session_id: sessionId,
  })

  if (error) {
    console.error('extend_slot_hold RPC failed:', error)
    return { extended: false, reason: 'rpc_error' }
  }

  const result = data as unknown as { extended: boolean; reason?: string }
  if (result.extended) {
    return { extended: true }
  }
  return { extended: false, reason: result.reason ?? 'unknown' }
}
