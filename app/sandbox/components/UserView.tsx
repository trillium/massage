'use client'

import { useMemo } from 'react'
import GeneralBookingFeature from '@/components/booking/features/GeneralBookingFeature'
import type { PageConfigurationReturnType } from '@/lib/componentTypes'
import { useSandbox } from '../SandboxProvider'

export default function UserView({ pageConfig }: { pageConfig: PageConfigurationReturnType }) {
  const { state } = useSandbox()

  const mergedData = useMemo(() => {
    const confirmedBusy = state.events
      .filter((e) => e.status === 'confirmed')
      .map((e) => ({
        start: e.data.start,
        end: e.data.end,
      }))

    return {
      ...pageConfig.data,
      busy: [...pageConfig.data.busy, ...confirmedBusy],
    }
  }, [pageConfig.data, state.events])

  const endPoint = `/sandbox/api/request?sessionId=${state.sessionId}`

  if (!pageConfig.configuration) return null

  return (
    <GeneralBookingFeature
      durationProps={pageConfig.durationProps}
      configuration={pageConfig.configuration}
      selectedDate={pageConfig.selectedDate}
      slots={pageConfig.slots}
      duration={pageConfig.duration}
      data={mergedData}
      start={pageConfig.start}
      end={pageConfig.end}
      bookingEndPoint={endPoint}
    />
  )
}
