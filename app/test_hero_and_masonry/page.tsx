import Template from '@/components/Template'
import Hero from '@/components/hero/Hero'
import siteMetadata from '@/data/siteMetadata'
// import Masonry from '@/components/masonry/Masonry'
import { SearchParamsType } from '@/lib/types'
import BookingForm from '@/components/booking/BookingForm'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import { InitialUrlUtility, UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import SectionContainer from '@/components/SectionContainer'
import Link from '@/components/Link'

const { avatar } = siteMetadata
const massageBio =
  'Trillium is a massage therapist with 10 years of experience. Working in the LA Metro Area, Trillium found success in specializing in In-Home mobile massage therapy, working solo and through platforms like Soothe and Zeel since 2016.'

export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsType> }) {
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
  } = await createPageConfiguration({ resolvedParams })

  return (
    <SectionContainer>
      <div className="border-primary-500 mb-10 flex flex-col items-center justify-center rounded-lg border-2 p-5 text-2xl font-bold text-red-500">
        <p>Note, looking to rebuild this here:</p>
        <div>
          <Link
            className="text-blue-500 underline"
            href="https://flowbite.com/docs/components/gallery/"
          >
            Flowbite Gallery Component
          </Link>{' '}
        </div>
      </div>
      <Hero title="Meet Trillium - Certified Massage Therapist" img={avatar} text={massageBio} />
      {/* <Masonry /> */}
      <Template title="Book a massage with Trillium :)" />
      <BookingForm />
      <div className="flex flex-col space-y-8">
        <DurationPicker {...durationProps} />
        <Calendar />
        <TimeList />
      </div>

      <InitialUrlUtility
        configObject={configuration}
        initialSlots={slots}
        initialSelectedDate={selectedDate || undefined}
        initialDuration={duration}
      />
      <UpdateSlotsUtility busy={data.busy} start={start} end={end} configObject={configuration} />
    </SectionContainer>
  )
}
