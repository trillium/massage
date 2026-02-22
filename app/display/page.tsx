import Template from '@/components/Template'
import { SearchParamsType } from '@/lib/types'
import { InitialUrlUtility, UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import SectionContainer from '@/components/SectionContainer'
import DisplayClient from '@/components/display/DisplayClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsType> }) {
  const resolvedParams = await searchParams

  const { durationProps, configuration, selectedDate, slots, duration, data, start, end } =
    await createPageConfiguration({ resolvedParams, bookingSlug: 'scale23x', debug: true })

  if (!configuration) notFound()

  return (
    <SectionContainer>
      <Template
        title={configuration.title ?? 'Book a Session'}
        text={configuration.text ?? undefined}
      />
      <DisplayClient durationProps={durationProps} start={start} end={end} />

      <InitialUrlUtility
        configObject={configuration}
        initialSlots={slots}
        initialSelectedDate={selectedDate || undefined}
        initialDuration={duration}
      />
      <UpdateSlotsUtility
        busy={data.busy}
        containers={data.containers}
        start={start}
        end={end}
        configObject={configuration}
      />
    </SectionContainer>
  )
}
