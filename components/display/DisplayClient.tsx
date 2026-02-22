'use client'

import DurationPicker from '@/components/availability/controls/DurationPicker'
import DisplayTimeList from './DisplayTimeList'
import EventBookingForm from './EventBookingForm'
import { useSmartRefresh } from 'hooks/useSmartRefresh'
import { useSlotPresence } from 'hooks/useSlotPresence'
import { useReduxAvailability } from '@/redux/hooks'
import type { durationPropsType, DayWithStartEnd } from '@/lib/types'

type DisplayClientProps = {
  durationProps: durationPropsType
  start: DayWithStartEnd
  end: DayWithStartEnd
}

export default function DisplayClient({ durationProps, start, end }: DisplayClientProps) {
  const { duration } = useReduxAvailability()
  const { presenceCounts, trackSlot } = useSlotPresence('display-event')

  useSmartRefresh({
    start,
    end,
    duration: duration || durationProps.duration,
  })

  return (
    <div className="flex flex-col space-y-6">
      <DurationPicker {...durationProps} showPrice={false} />
      <DisplayTimeList presenceCounts={presenceCounts} onSlotHover={trackSlot} />
      <EventBookingForm />
    </div>
  )
}
