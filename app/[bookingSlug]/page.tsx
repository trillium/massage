import Template from '@/components/Template'
import BookingForm from '@/components/booking/BookingForm'
import { ALLOWED_DURATIONS, DEFAULT_DURATION, DEFAULT_PRICING, LEAD_TIME } from 'config'
import { UrlUpdateUtility } from '@/components/utilities/UrlUpdateUtility'
import { InitialUrlUtility } from '@/components/utilities/InitialUrlUtility'
import { UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import { SearchParamsType } from '@/lib/types'
import NotFound from 'app/not-found'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import ExpiredPromoPage from '@/components/ExpiredPromoPage'
import SectionContainer from '@/components/SectionContainer'

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
  } = result

  return (
    <SectionContainer>
      <Template
        title={configuration.title || 'Book a massage with Trillium :)'}
        text={configuration.text ?? undefined}
      />
      <BookingForm acceptingPayment={configuration.acceptingPayment ?? true} />

      <div className="flex flex-col space-y-8">
        <DurationPicker {...durationProps} />
        <Calendar />
        <TimeList />
      </div>

      <InitialUrlUtility
        configSliceData={configuration}
        selectedDate={selectedDate}
        duration={duration}
        eventMemberString={containerStrings.eventMemberString}
        eventBaseString={containerStrings.eventBaseString}
        allowedDurations={configuration.allowedDurations || ALLOWED_DURATIONS}
        slots={slots}
      />
      <UrlUpdateUtility />
      <UpdateSlotsUtility
        busy={data.busy}
        containers={data.containers}
        start={start}
        end={end}
        configObject={configuration}
      />
    </SectionContainer>
  )
}
