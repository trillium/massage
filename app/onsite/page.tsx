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

export type PageProps = InferGetServerSidePropsType<typeof fetchData>

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsType> }) {
  const resolvedParams = await searchParams
  const { props } = await fetchData({ searchParams: resolvedParams })

  const duration =
    resolvedParams.duration !== undefined ? Number(resolvedParams.duration) : DEFAULT_DURATION

  const start = dayFromString(props.start)
  const end = dayFromString(props.end)

  const slots = createSlots({ ...props, duration, leadTime: LEAD_TIME, start, end })

  const configuration = initialState

  const { selectedDate } = props

  return (
    <>
      <Template title="Book a session with Trillium :)" />
      <ClientPage {...props} />

      <InitialUrlUtility
        configSliceData={configuration}
        selectedDate={selectedDate}
        duration={duration}
        allowedDurations={allowedDurations}
        slots={slots}
      />
      <UrlUpdateUtility />
      <UpdateSlotsUtility busy={props.busy} start={start} end={end} configObject={configuration} />
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
