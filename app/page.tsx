import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Template from '@/components/Template'
import Hero from '@/components/hero/Hero'
import siteMetadata from '@/data/siteMetadata'
import { SearchParamsType, SlugConfigurationType } from '@/lib/types'
import { ALLOWED_DURATIONS } from 'config'
import BookingForm from '@/components/booking/BookingForm'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import { InitialUrlUtility } from '@/components/utilities/InitialUrlUtility'
import { UrlUpdateUtility } from '@/components/utilities/UrlUpdateUtility'
import { UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import SectionContainer from '@/components/SectionContainer'

const { avatar } = siteMetadata
const mapData = '/static/images/foo/service-area.jpg'
const massageBio =
  'Trillium is a massage therapist with 10 years of experience. Working in the LA Metro Area, Trillium found success in specializing in In-Home mobile massage therapy, working solo and through platforms like Soothe and Zeel since 2016.'
const serviceAreaBlurb =
  'Trillium is based out of Westchester, but happy to travel to the LA area in general. Very close locations include Playa Vista, Mar Vista, Santa Monica, Venice, El Segundo, and Torrance.'

const overrides: Partial<SlugConfigurationType> = { type: 'area-wide' }

export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsType> }) {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
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
  } = await createPageConfiguration({ resolvedParams, overrides })

  return (
    <>
      <SectionContainer>
        <Hero
          title="Meet Trillium - Certified Massage Therapist"
          img={avatar}
          text={massageBio}
          imageRight
        />
        <Hero
          title="What's the service area for mobile massage therapy?"
          img={mapData}
          text={serviceAreaBlurb}
          buttons={false}
          imageLeft
        />
      </SectionContainer>
      <SectionContainer>
        <Template title="Book a massage with Trillium :)" />
        <BookingForm endPoint="api/request" />
        <div className="flex flex-col space-y-8">
          <DurationPicker {...durationProps} />
          <Calendar />
          <TimeList />
        </div>
      </SectionContainer>
      <InitialUrlUtility
        configSliceData={configuration}
        selectedDate={selectedDate}
        duration={duration}
        allowedDurations={ALLOWED_DURATIONS}
        slots={slots}
      />
      <UrlUpdateUtility />
      <UpdateSlotsUtility busy={data.busy} start={start} end={end} configObject={configuration} />
    </>
  )
}
