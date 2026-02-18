import type { ReminderChannel } from '@/lib/supabase/database.types'
import type { ReminderChannelAdapter } from './types'
import { emailAdapter } from './email'

const adapters: Record<string, ReminderChannelAdapter> = {
  email: emailAdapter,
}

export function getAdapter(channel: ReminderChannel): ReminderChannelAdapter | null {
  return adapters[channel] || null
}
