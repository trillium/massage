export const dynamic = 'force-dynamic'

import { SearchParamsType } from '@/lib/types'
import NotFound from 'app/not-found'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import SlugDashboard from '@/components/admin/SlugDashboard'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParamsType>
  params: Promise<{ bookingSlug: string }>
}) {
  const { bookingSlug } = await params
  const resolvedParams = await searchParams

  const result = await createPageConfiguration({ bookingSlug, resolvedParams })

  if (result.configuration === null || result.configuration === undefined) {
    return <NotFound />
  }

  const supabase = getSupabaseAdminClient()
  const { data: appointmentsData } = await supabase!
    .from('appointments')
    .select(
      'id, client_first_name, client_last_name, client_email, client_phone, start_time, end_time, duration_minutes, status, promo, location, admin_notes, created_at'
    )
    .ilike('booking_url', `%${bookingSlug}%`)
    .order('start_time', { ascending: true })

  const eventContainer = result.configuration.eventContainer ?? null

  return (
    <SlugDashboard
      slug={bookingSlug}
      appointments={appointmentsData ?? []}
      eventContainer={eventContainer}
    />
  )
}
