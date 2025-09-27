import { SearchParamsType } from '@/lib/types'
import NotFound from 'app/not-found'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import ExpiredPromoPage from '@/components/ExpiredPromoPage'
import GeneralBookingFeature from '@/components/booking/features/GeneralBookingFeature'
import AdminDebugPanel from '@/components/admin/AdminDebugPanel'

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParamsType>
  params: Promise<{ bookingSlug: string }>
}) {
  const { bookingSlug } = await params
  const resolvedParams = await searchParams

  const result = await createPageConfiguration({ bookingSlug, resolvedParams, debug: true })

  if (result.configuration === null || result.configuration === undefined) {
    return <NotFound></NotFound>
  }

  // Check if this is an expired promotion
  if (result.isExpired && result.configuration.promoEndDate) {
    return (
      <ExpiredPromoPage
        title={result.configuration.title || 'Promotion Expired'}
        promoEndDate={result.configuration.promoEndDate}
        originalText={result.configuration.text}
      />
    )
  }

  const {
    durationProps,
    configuration,
    selectedDate,
    allowedDurations,
    slots,
    containerStrings,
    duration,
    data,
    start,
    end,
    debug,
  } = result

  return (
    <div>
      {debug && <AdminDebugPanel debug={debug} />}
      <GeneralBookingFeature
        durationProps={durationProps}
        configuration={configuration}
        selectedDate={selectedDate}
        slots={slots}
        duration={duration}
        data={data}
        start={start}
        end={end}
      />
    </div>
  )
}
