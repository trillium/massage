import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Template from '@/components/Template'
import { fetchData } from 'lib/fetch/fetchData'
import Hero from '@/components/hero/Hero'
import siteMetadata from 'storage/siteMetadata'
import Masonry from '@/components/masonry/Masonry'
import { SearchParamsType } from '@/lib/types'
import { ALLOWED_DURATIONS, DEFAULT_DURATION, DEFAULT_PRICING, LEAD_TIME } from 'config'
import BookingForm from '@/components/booking/BookingForm'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import { dayFromString } from '@/lib/dayAsObject'
import { createSlots } from '@/lib/availability/createSlots'
import { InitialUrlUtility } from '@/components/utilities/InitialUrlUtility'
import { UrlUpdateUtility } from '@/components/utilities/UrlUpdateUtility'
import { UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'

const { avatar } = siteMetadata
const massageBio =
  'Trillium is a massage therapist with 10 years of experience. Working in the LA Metro Area, Trillium found success in specializing in In-Home mobile massage therapy, working solo and through platforms like Soothe and Zeel since 2016.'

export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsType> }) {
  const resolvedParams = await searchParams
  const duration =
    resolvedParams.duration !== undefined ? Number(resolvedParams.duration) : DEFAULT_DURATION

  const { props } = await fetchData({ searchParams: resolvedParams })

  const start = dayFromString(props.start)
  const end = dayFromString(props.end)

  const slots = createSlots({ ...props, duration, leadTime: LEAD_TIME, start, end })

  const configuration = null

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
      <div className="mb-10 flex flex-col items-center justify-center rounded-lg border-2 border-primary-500 p-5 text-2xl font-bold text-red-500">
        <p>Note, looking to rebuild this here:</p>
        <div>
          <a
            className="text-blue-500 underline"
            href="https://flowbite.com/docs/components/gallery/"
          >
            Flowbite Gallery Component
          </a>
        </div>
      </div>
      <Hero title="Meet Trillium - Certified Massge Therapist" img={avatar} text={massageBio} />
      <Masonry />
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
      <UpdateSlotsUtility busy={props.busy} start={start} end={end} />
    </>
  )
}
