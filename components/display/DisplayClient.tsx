'use client'

import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import DisplayTimeList from './DisplayTimeList'
import BookingForm from '@/components/booking/BookingForm'
import { useSmartRefresh } from 'hooks/useSmartRefresh'
import { useSlotPresence } from 'hooks/useSlotPresence'
import { SlotHoldProvider } from 'hooks/SlotHoldContext'
import type { durationPropsType } from '@/lib/types'

type DisplayClientProps = {
  durationProps: durationPropsType
}

export default function DisplayClient({ durationProps }: DisplayClientProps) {
  const { presenceCounts, trackSlot } = useSlotPresence('display-event')

  useSmartRefresh()

  return (
    <SlotHoldProvider>
      <div className="flex flex-col space-y-8">
        <DurationPicker {...durationProps} />
        <Calendar weeksDisplayOverride={2} />
        <DisplayTimeList presenceCounts={presenceCounts} onSlotHover={trackSlot} />
        <BookingForm acceptingPayment={false} endPoint="api/event-booking" />
      </div>
    </SlotHoldProvider>
  )
}
