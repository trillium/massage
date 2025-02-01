import type { InferGetServerSidePropsType } from 'next'

import Template from '@/components/Template'
import { fetchData } from 'lib/fetch/fetchData'
import { SearchParamsType } from '@/lib/types'
import BookingForm from '@/components/booking/BookingForm'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import { ALLOWED_DURATIONS, DEFAULT_DURATION, DEFAULT_PRICING, LEAD_TIME } from 'config'
import { createSlots } from '@/lib/availability/createSlots'
import { dayFromString } from '@/lib/dayAsObject'
import { InitialUrlUtility } from '@/components/utilities/InitialUrlUtility'
import { UrlUpdateUtility } from '@/components/utilities/UrlUpdateUtility'
import { UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import { initialState } from '@/redux/slices/configSlice'

export type PageProps = InferGetServerSidePropsType<typeof fetchData>

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsType> }) {
  const resolvedParams = await searchParams
  const duration =
    resolvedParams.duration !== undefined ? Number(resolvedParams.duration) : DEFAULT_DURATION

  const { props } = await fetchData({ searchParams: resolvedParams })

  const start = dayFromString(props.start)
  const end = dayFromString(props.end)

  const slots = createSlots({ ...props, duration, leadTime: LEAD_TIME, start, end })

  const configuration = initialState

  const pricing = DEFAULT_PRICING
  const durationString = `${duration || '##'} minute session`
  const paymentString = ' - $' + pricing[duration]
  const combinedString = durationString + paymentString

  const durationProps = {
    title: combinedString,
    price: pricing,
    duration: duration,
    allowedDurations: ALLOWED_DURATIONS,
  }

  const { selectedDate } = props

  return (
    <>
      <Template title="Book a massage with Trillium :)" />
      <BookingForm endPoint="api/request" />
      <div className="flex flex-col space-y-8">
        <DurationPicker {...durationProps} />
        <Calendar />
        <TimeList />
      </div>

      <InitialUrlUtility
        configSliceData={configuration}
        selectedDate={selectedDate}
        duration={duration}
        allowedDurations={ALLOWED_DURATIONS}
        slots={slots}
      />
      <UrlUpdateUtility />
      <UpdateSlotsUtility busy={props.busy} start={start} end={end} configObject={configuration} />
    </>
  )
}
