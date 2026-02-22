import Template from '@/components/Template'
import { SearchParamsType, SlugConfigurationType } from '@/lib/types'
import { InitialUrlUtility, UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import SectionContainer from '@/components/SectionContainer'
import DisplayClient from '@/components/display/DisplayClient'

export const dynamic = 'force-dynamic'

const overrides: Partial<SlugConfigurationType> = {
  type: 'area-wide',
  allowedDurations: [5, 10, 15, 20, 25, 30],
  leadTimeMinimum: 0,
  instantConfirm: true,
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsType> }) {
  const resolvedParams = await searchParams

  const { durationProps, configuration, selectedDate, slots, duration, data, start, end } =
    await createPageConfiguration({ resolvedParams, overrides })

  return (
    <SectionContainer>
      <Template title="Book a Session" text="Pick a time and we'll get you in!" />
      <DisplayClient durationProps={durationProps} start={start} end={end} />

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
