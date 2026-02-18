import type { Appointment, Reminder, ReminderChannel } from '@/lib/supabase/database.types'

export interface ReminderDeliveryResult {
  success: boolean
  error?: string
  providerResponse?: unknown
}

export interface ReminderChannelAdapter {
  channel: ReminderChannel
  send(reminder: Reminder, appointment: Appointment): Promise<ReminderDeliveryResult>
}
