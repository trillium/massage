import siteMetadata from '@/data/siteMetadata'
import { fetchContainersByQuery } from '@/lib/fetch/fetchContainersByQuery'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import Template from '@/components/Template'
import BookingForm from '@/components/booking/BookingForm'
import { createSlots } from '@/lib/availability/createSlots'
import { ALLOWED_DURATIONS, DEFAULT_DURATION, DEFAULT_PRICING, LEAD_TIME } from 'config'
import { UrlUpdateUtility } from '@/components/utilities/UrlUpdateUtility'
import { InitialUrlUtility } from '@/components/utilities/InitialUrlUtility'
import { dayFromString } from '@/lib/dayAsObject'
import { UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  params: Promise<{ bookingSlug: string }>
}) {
  const { bookingSlug } = await params
  const resolvedParams = await searchParams
  const duration =
    resolvedParams.duration !== undefined ? Number(resolvedParams.duration) : DEFAULT_DURATION

  const { props } = await fetchContainersByQuery({
    searchParams: resolvedParams,
    query: bookingSlug,
  })

  const start = dayFromString(props.start)
  const end = dayFromString(props.end)

  const slots = createSlots({ ...props, duration, leadTime: LEAD_TIME, start, end })

  const slugData = await fetchSlugConfigurationData()
  const configuration = slugData[bookingSlug] ?? null

  const containerStrings = {
    eventBaseString: bookingSlug + siteMetadata.eventBaseString,
    eventMemberString: bookingSlug + siteMetadata.eventBaseString + 'MEMBER__',
    eventContainerString: bookingSlug + siteMetadata.eventBaseString + 'CONTAINER__',
  }

  const pricing = configuration?.price || DEFAULT_PRICING
  const durationString = `${duration || '##'} minute session`
  const paymentString = configuration?.acceptingPayment ?? ' - $' + pricing[duration]
  const combinedString = durationString + paymentString

  const durationProps = {
    title: combinedString,
    price: pricing,
    duration: duration,
    allowedDurations: configuration?.allowedDurations ?? ALLOWED_DURATIONS,
  }

  const { selectedDate } = props

  return (
    <>
      <Template
        title={configuration.title || 'Book a massage with Trillium :)'}
        text={configuration.text}
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
      <UpdateSlotsUtility busy={props.busy} containers={props.containers} start={start} end={end} />
    </>
  )
}
