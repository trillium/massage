import { describe, it, expect } from 'vitest'
import { renderReminderEmail } from '../templates/renderReminderEmail'
import type { Appointment, Reminder } from '@/lib/supabase/database.types'

const appointment = {
  client_first_name: 'Jane',
  client_last_name: 'Doe',
  start_time: '2026-03-01T18:00:00.000Z',
  duration_minutes: 90,
  timezone: 'America/Los_Angeles',
} as Appointment

describe('renderReminderEmail', () => {
  it('renders 24h_before template', () => {
    const reminder = { reminder_type: '24h_before' } as Reminder
    const { subject, body } = renderReminderEmail(reminder, appointment)

    expect(subject).toContain('tomorrow')
    expect(body).toContain('Jane Doe')
    expect(body).toContain('90-minute')
  })

  it('renders 2h_before template', () => {
    const reminder = { reminder_type: '2h_before' } as Reminder
    const { subject, body } = renderReminderEmail(reminder, appointment)

    expect(subject).toContain('2 hours')
    expect(body).toContain('Jane Doe')
  })

  it('renders generic fallback for unknown types', () => {
    const reminder = { reminder_type: 'follow_up' } as Reminder
    const { subject, body } = renderReminderEmail(reminder, appointment)

    expect(subject).toContain('reminder')
    expect(body).toContain('Jane Doe')
  })
})
