import { getSupabaseAdminClient } from '@/lib/supabase/admin'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function client(): any {
  const supabase = getSupabaseAdminClient()
  if (!supabase) throw new Error('Supabase admin client not available')
  return supabase
}

export async function logContactSubmission(data: {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}): Promise<string | null> {
  try {
    const { data: row, error } = await client()
      .from('contact_submissions')
      .insert({ ...data, send_state: 'received' })
      .select('id')
      .single()
    if (error) console.error('[auditLog] contact_submission insert failed:', error.message)
    return row?.id ?? null
  } catch {
    return null
  }
}

export async function updateContactSubmission(
  id: string,
  update: { send_state: 'success' | 'failed'; error_detail?: string }
): Promise<void> {
  try {
    const { error } = await client()
      .from('contact_submissions')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) console.error('[auditLog] contact_submission update failed:', error.message)
  } catch {}
}

export async function logEmailSend(data: {
  template: string
  to_address: string
  subject?: string
  variables?: Record<string, unknown>
  send_state: 'success' | 'failed'
  error_detail?: string
}): Promise<void> {
  try {
    const { error } = await client()
      .from('email_sends')
      .insert({
        ...data,
        sent_at: data.send_state === 'success' ? new Date().toISOString() : null,
      })
    if (error) console.error('[auditLog] email_send insert failed:', error.message)
  } catch {}
}
