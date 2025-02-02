import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Template from '@/components/Template'
import { fetchData } from 'lib/fetch/fetchData'
import Main from './Main'
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
import { initialState } from '@/redux/slices/configSlice'
import { validateSearchParams } from '@/lib/searchParams/validateSearchParams'

const { avatar } = siteMetadata
const mapData = '/static/images/foo/service-area.jpg'
const massageBio =
  'Trillium is a massage therapist with 10 years of experience. Working in the LA Metro Area, Trillium found success in specializing in In-Home mobile massage therapy, working solo and through platforms like Soothe and Zeel since 2016.'
const serviceAreaBlub =
  'Trillium is based out of Westchester, but happy to travel to the LA area in general. Very close locations include Playa Vista, Mar Vista, Santa Monica, Venice, El Segundo, and Torrance.'

export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsType> }) {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  const resolvedParams = await searchParams

  const data = await fetchData({ searchParams: resolvedParams })
  const { duration, selectedDate } = validateSearchParams({ searchParams: resolvedParams })

  const start = dayFromString(data.start)
  const end = dayFromString(data.end)

  const slots = createSlots({ ...data, duration, leadTime: LEAD_TIME, start, end })

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

  return (
    <>
      <Hero
        title="Meet Trillium - Certified Massge Therapist"
        img={avatar}
        text={massageBio}
        imageRight
      />
      <Hero
        title="What's the service area for mobile massage therapy?"
        img={mapData}
        text={serviceAreaBlub}
        buttons={false}
        imageLeft
      />
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
      <UpdateSlotsUtility busy={data.busy} start={start} end={end} configObject={configuration} />

      {!!posts.length && <Main posts={posts} />}
    </>
  )
}
