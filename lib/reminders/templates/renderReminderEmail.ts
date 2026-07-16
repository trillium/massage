import type { Appointment, Reminder } from '@/lib/supabase/database.types'

export function renderReminderEmail(
  reminder: Reminder,
  appointment: Appointment
): { subject: string; body: string } {
  const clientName = `${appointment.client_first_name} ${appointment.client_last_name}`
  const date = new Date(appointment.start_time)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: appointment.timezone,
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: appointment.timezone,
  })

  if (reminder.reminder_type === '24h_before') {
    return {
      subject: `Reminder: Your reading is tomorrow`,
      body: `<p>Hi ${clientName},</p><p>This is a friendly reminder that your ${appointment.duration_minutes}-minute reading is scheduled for <strong>${formattedDate} at ${formattedTime}</strong>.</p><p>Looking forward to seeing you!</p>`,
    }
  }

  if (reminder.reminder_type === '2h_before') {
    return {
      subject: `Your reading is in 2 hours`,
      body: `<p>Hi ${clientName},</p><p>Just a quick reminder — your ${appointment.duration_minutes}-minute reading starts at <strong>${formattedTime}</strong> today.</p><p>See you soon!</p>`,
    }
  }

  return {
    subject: `Reading appointment reminder`,
    body: `<p>Hi ${clientName},</p><p>You have a reading scheduled for ${formattedDate} at ${formattedTime}.</p>`,
  }
}
