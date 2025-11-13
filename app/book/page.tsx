import type { InferGetServerSidePropsType } from 'next'

import Template from '@/components/Template'
import { fetchData } from 'lib/fetch/fetchData'
import { SearchParamsType, SlugConfigurationType } from '@/lib/types'
import BookingForm from '@/components/booking/BookingForm'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import { InitialUrlUtility, UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import SectionContainer from '@/components/SectionContainer'

export type PageProps = InferGetServerSidePropsType<typeof fetchData>

export const dynamic = 'force-dynamic'

const overrides: Partial<SlugConfigurationType> = { type: 'area-wide' }

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
  } = await createPageConfiguration({ resolvedParams, overrides })

  return (
    <SectionContainer>
      <Template title="Book a reading with Kendra :)" />
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
