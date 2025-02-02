import type { InferGetServerSidePropsType } from 'next'

import ClientPage from './ClientPage'
import Template from 'components/Template'
import { fetchData } from 'lib/fetch/fetchData'
import { AllowedDurationsType, SearchParamsType } from '@/lib/types'
import { dayFromString } from '@/lib/dayAsObject'
import { createSlots } from '@/lib/availability/createSlots'
import { DEFAULT_DURATION, LEAD_TIME } from 'config'
import { InitialUrlUtility } from '@/components/utilities/InitialUrlUtility'
import { UrlUpdateUtility } from '@/components/utilities/UrlUpdateUtility'
import { UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import { initialState } from '@/redux/slices/configSlice'
import { validateSearchParams } from '@/lib/searchParams/validateSearchParams'

export type PageProps = InferGetServerSidePropsType<typeof fetchData>

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsType> }) {
  const resolvedParams = await searchParams
  const data = await fetchData({ searchParams: resolvedParams })
  const { duration, selectedDate } = validateSearchParams({ searchParams: resolvedParams })

  const start = dayFromString(data.start)
  const end = dayFromString(data.end)

  const slots = createSlots({ ...data, duration, leadTime: LEAD_TIME, start, end })

  const configuration = initialState

  return (
    <>
      <Template title="Book a session with Trillium :)" />
      {/* <ClientPage {...data} /> */}

      <InitialUrlUtility
        configSliceData={configuration}
        selectedDate={selectedDate}
        duration={duration}
        allowedDurations={allowedDurations}
        slots={slots}
      />
      <UrlUpdateUtility />
      <UpdateSlotsUtility busy={data.busy} start={start} end={end} configObject={configuration} />
    </>
  )
}

const allowedDurations: AllowedDurationsType = [
  60 * 1,
  60 * 1.5,
  60 * 2,
  60 * 2.5,
  60 * 3,
  60 * 3.5,
  60 * 4,
]
