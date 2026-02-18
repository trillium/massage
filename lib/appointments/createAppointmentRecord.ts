import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { AppointmentInsert, AppointmentStatus } from '@/lib/supabase/database.types'

interface BookingData {
  firstName: string
  lastName: string
  email: string
  phone: string
  start: string
  end: string
  duration: string
  timeZone: string
  locationObject?: { street: string; city: string; zip: string }
  locationString?: string
  price?: string
  promo?: string
  bookingUrl?: string
  slugConfiguration?: unknown
  instantConfirm?: boolean
}

export async function createAppointmentRecord(
  calendarEventId: string,
  data: BookingData,
  status: AppointmentStatus = 'pending'
): Promise<void> {
  const supabase = getSupabaseAdminClient()

  const location = data.locationObject
    ? `${data.locationObject.street}, ${data.locationObject.city} ${data.locationObject.zip}`
    : data.locationString || null

  const record: AppointmentInsert = {
    calendar_event_id: calendarEventId,
    client_email: data.email,
    client_phone: data.phone || null,
    client_first_name: data.firstName,
    client_last_name: data.lastName,
    start_time: data.start,
    end_time: data.end,
    duration_minutes: Number.parseInt(data.duration),
    timezone: data.timeZone,
    location,
    price: data.price ? Number.parseInt(data.price) : null,
    status,
    promo: data.promo || null,
    booking_url: data.bookingUrl || null,
    slug_config: data.slugConfiguration ? JSON.parse(JSON.stringify(data.slugConfiguration)) : null,
    source: 'web',
    instant_confirm: data.instantConfirm || false,
    confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
  }

  const { error } = await supabase.from('appointments').insert(record)

  if (error) {
    console.error('Failed to create appointment record:', error)
  }
}
