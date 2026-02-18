import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { Appointment, Reminder, ReminderChannel } from '@/lib/supabase/database.types'
import { getAdapter } from './channels/registry'

const BATCH_LIMIT = 50

interface ProcessResult {
  processed: number
  sent: number
  failed: number
  errors: string[]
}

export async function processReminders(): Promise<ProcessResult> {
  const supabase = getSupabaseAdminClient()
  const result: ProcessResult = { processed: 0, sent: 0, failed: 0, errors: [] }

  const { data: dueReminders, error: fetchError } = await supabase
    .from('reminders')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_for', new Date().toISOString())
    .limit(BATCH_LIMIT)

  if (fetchError) {
    result.errors.push(`Failed to fetch reminders: ${fetchError.message}`)
    return result
  }

  if (!dueReminders || dueReminders.length === 0) return result

  for (const reminder of dueReminders) {
    result.processed++

    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', reminder.appointment_id)
      .single()

    if (apptError || !appointment) {
      await markFailed(supabase, reminder, 'Appointment not found')
      result.failed++
      result.errors.push(
        `Reminder ${reminder.id}: appointment ${reminder.appointment_id} not found`
      )
      continue
    }

    if (appointment.status === 'cancelled') {
      await supabase
        .from('reminders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', reminder.id)
      continue
    }

    const adapter = getAdapter(reminder.channel as ReminderChannel)
    if (!adapter) {
      await markFailed(supabase, reminder, `No adapter for channel: ${reminder.channel}`)
      result.failed++
      result.errors.push(`Reminder ${reminder.id}: no adapter for ${reminder.channel}`)
      continue
    }

    const deliveryResult = await adapter.send(reminder as Reminder, appointment as Appointment)

    if (deliveryResult.success) {
      await supabase
        .from('reminders')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reminder.id)
      result.sent++
    } else {
      await markFailed(supabase, reminder, deliveryResult.error || 'Unknown error')
      result.failed++
      result.errors.push(`Reminder ${reminder.id}: ${deliveryResult.error}`)
    }

    await supabase.from('reminder_logs').insert({
      reminder_id: reminder.id,
      channel: reminder.channel,
      recipient: appointment.client_email,
      status: deliveryResult.success ? 'delivered' : 'failed',
      error_message: deliveryResult.error || null,
      response_data: deliveryResult.providerResponse
        ? JSON.parse(JSON.stringify(deliveryResult.providerResponse))
        : null,
    })
  }

  return result
}

async function markFailed(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  reminder: { id: string },
  _error: string
) {
  await supabase
    .from('reminders')
    .update({ status: 'failed', updated_at: new Date().toISOString() })
    .eq('id', reminder.id)
}
