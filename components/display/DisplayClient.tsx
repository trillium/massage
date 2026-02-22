'use client'

import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import DisplayTimeList from './DisplayTimeList'
import BookingForm from '@/components/booking/BookingForm'
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
    <div className="flex flex-col space-y-8">
      <DurationPicker {...durationProps} showPrice={false} />
      <Calendar />
      <DisplayTimeList presenceCounts={presenceCounts} onSlotHover={trackSlot} />
      <BookingForm acceptingPayment={false} endPoint="api/event-booking" />
    </div>
  )
}
