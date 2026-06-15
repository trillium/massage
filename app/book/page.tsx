import type { InferGetServerSidePropsType } from 'next'

import Template from '@/components/Template'
import SlotTakenAlert from '@/components/booking/SlotTakenAlert'
import { SlotHoldProvider } from 'hooks/SlotHoldContext'
import { fetchData } from 'lib/fetch/fetchData'
import { SearchParamsType, SlugConfigurationType } from '@/lib/types'
import BookingForm from '@/components/booking/BookingForm'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import { InitialUrlUtility, UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import SectionContainer from '@/components/SectionContainer'
import { home } from '@/app/content'
import { Stack } from '@/components/ui/stack'

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
      <SlotHoldProvider>
        <SlotTakenAlert />
        <Template title={home.bookingTitle ?? 'Book a session'} />
        <BookingForm additionalData={{ showPromoField: true }} />
        <Stack className="space-y-8" direction="col">
          <DurationPicker {...durationProps} />
          <Calendar />
          <TimeList />
        </Stack>
      </SlotHoldProvider>

      <InitialUrlUtility
        configObject={configuration}
        initialSlots={slots}
        initialSelectedDate={selectedDate || undefined}
        initialDuration={duration}
      />
      <UpdateSlotsUtility
        busy={data.busy}
        start={start}
        end={end}
        configObject={configuration}
        initialSelectedDate={selectedDate || undefined}
      />
    </SectionContainer>
  )
}
