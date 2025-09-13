import { SearchParamsType, SlugConfigurationType } from '@/lib/types'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import NextBookingFeature from '@/components/booking/features/NextBookingFeature'

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsType> }) {
  const resolvedParams = await searchParams

  // Start with 'next' type - configuration system will handle event detection automatically
  const overrides: Partial<SlugConfigurationType> = {
    type: 'next',
    title: 'Book Next Available',
    text: 'Book your next available appointment.',
    instantConfirm: true,
    acceptingPayment: true,
  }

  const pageConfiguration = await createPageConfiguration({
    resolvedParams,
    overrides,
  })

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
  } = pageConfiguration

  return (
    <NextBookingFeature
      durationProps={durationProps}
      configuration={configuration}
      selectedDate={selectedDate}
      slots={slots}
      duration={duration}
      data={data}
      start={start}
      end={end}
    />
  )
}
