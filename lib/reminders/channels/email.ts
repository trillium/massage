import sendMail from '@/lib/email'
import type { Appointment, Reminder } from '@/lib/supabase/database.types'
import type { ReminderChannelAdapter, ReminderDeliveryResult } from './types'
import { renderReminderEmail } from '../templates/renderReminderEmail'

export const emailAdapter: ReminderChannelAdapter = {
  channel: 'email',

  async send(reminder: Reminder, appointment: Appointment): Promise<ReminderDeliveryResult> {
    const { subject, body } = renderReminderEmail(reminder, appointment)

    try {
      await sendMail({ to: appointment.client_email, subject, body })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error',
      }
    }
  },
}
