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

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParamsType>
  params: Promise<{ bookingSlug: string }>
}) {
  const { bookingSlug } = await params
  const resolvedParams = await searchParams

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
  } = await createPageConfiguration({ bookingSlug, resolvedParams })

  if (configuration === null || configuration === undefined) {
    return <NotFound></NotFound>
  }

  return (
    <>
      <Template
        title={configuration.title || 'Book a massage with Trillium :)'}
        text={configuration.text ?? undefined}
      />
      <BookingForm
        endPoint="api/request"
        acceptingPayment={configuration.acceptingPayment ?? true}
      />

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
    </>
  )
}
