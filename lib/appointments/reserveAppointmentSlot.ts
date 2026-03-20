import { getSupabaseAdminClient } from '@/lib/supabase/server'

interface ReserveSlotParams {
  start: string
  end: string
  clientEmail: string
  clientPhone?: string | null
  clientFirstName: string
  clientLastName: string
  durationMinutes: number
  timezone: string
  location?: string | null
  price?: number | null
  status?: 'pending' | 'confirmed'
  promo?: string | null
  bookingUrl?: string | null
  slugConfig?: unknown
  source?: string
  instantConfirm?: boolean
  confirmedAt?: string | null
}

type ReserveResult = { success: true; appointmentId: string } | { success: false; reason: string }

export async function reserveAppointmentSlot(params: ReserveSlotParams): Promise<ReserveResult> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase.rpc('reserve_appointment_slot', {
    p_start: params.start,
    p_end: params.end,
    p_client_email: params.clientEmail,
    p_client_phone: params.clientPhone ?? null,
    p_client_first: params.clientFirstName,
    p_client_last: params.clientLastName,
    p_duration_min: params.durationMinutes,
    p_timezone: params.timezone,
    p_location: params.location ?? null,
    p_price: params.price ?? null,
    p_status: params.status ?? 'pending',
    p_promo: params.promo ?? null,
    p_booking_url: params.bookingUrl ?? null,
    p_slug_config: params.slugConfig ? JSON.parse(JSON.stringify(params.slugConfig)) : null,
    p_source: params.source ?? 'web',
    p_instant: params.instantConfirm ?? false,
    p_confirmed_at: params.confirmedAt ?? null,
  })

  if (error) {
    console.error('reserve_appointment_slot RPC failed:', error)
    return { success: false, reason: 'rpc_error' }
  }

  const result = data as { success: boolean; appointment_id?: string; reason?: string }
  if (result.success) {
    return { success: true, appointmentId: result.appointment_id! }
  }
  return { success: false, reason: result.reason ?? 'unknown' }
}
