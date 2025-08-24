import type { InferGetServerSidePropsType } from 'next'

import ClientPage from './ClientPage'
import Template from 'components/Template'
import { fetchData } from 'lib/fetch/fetchData'
import { SearchParamsType, SlugConfigurationType } from '@/lib/types'
import { InitialUrlUtility } from '@/components/utilities/InitialUrlUtility'
import { UrlUpdateUtility } from '@/components/utilities/UrlUpdateUtility'
import { UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import SectionContainer from '@/components/SectionContainer'

export type PageProps = InferGetServerSidePropsType<typeof fetchData>

export const dynamic = 'force-dynamic'

const overrides: Partial<SlugConfigurationType> = {
  allowedDurations: [60 * 1, 60 * 1.5, 60 * 2, 60 * 2.5, 60 * 3, 60 * 3.5, 60 * 4],
  type: 'area-wide',
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsType> }) {
  const resolvedParams = await searchParams

  const {
    durationProps,
    configuration,
    selectedDate,
    slots,
    containerStrings,
    allowedDurations,
    duration,
    data,
    start,
    end,
  } = await createPageConfiguration({ resolvedParams, overrides })

  return (
    <SectionContainer>
      <Template title="Book a session with Trillium :)" />
      <ClientPage duration={duration}>
        <div className="flex flex-col space-y-8">
          <div className="flex space-x-6">
            <DurationPicker {...durationProps} />
          </div>
          <Calendar />
          <TimeList />
        </div>
      </ClientPage>

      <InitialUrlUtility
        configSliceData={configuration}
        selectedDate={selectedDate}
        duration={duration}
        allowedDurations={allowedDurations}
        slots={slots}
      />
      <UrlUpdateUtility />
      <UpdateSlotsUtility busy={data.busy} start={start} end={end} configObject={configuration} />
    </SectionContainer>
  )
}
