'use client'

import { useReduxAvailability } from '@/redux/hooks'
import TimeButton from './TimeButton'
import type { StringDateTimeIntervalAndLocation } from '@/lib/types'

import { format } from 'date-fns-tz'

export default function TimeList({}) {
  const { slots: slotsRedux, selectedDate } = useReduxAvailability()
  const { selectedTime, timeZone } = useReduxAvailability()

  const slots = slotsRedux || []

  const timeSignature = (selectedTime?.start ?? '') + (selectedTime?.end ?? '')

  let maximumAvailability = 0
  const availabilityByDate = slots.reduce<Record<string, StringDateTimeIntervalAndLocation[]>>(
    (acc, slot) => {
      // Gives us the same YYYY-MM-DD format as Day.toString()
      const date = format(slot.start, 'yyyy-MM-dd', { timeZone })

      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(slot)

      if (acc[date].length > maximumAvailability) {
        maximumAvailability = acc[date].length
      }
      return acc
    },
    {}
  )

  const availability = selectedDate ? availabilityByDate[selectedDate.toString()] : []

  return (
    <div className="grid grid-cols-2 gap-2">
      {availability?.map(({ start, end, location }) => {
        const isActive = selectedTime ? start + end === timeSignature : false

        return (
          <TimeButton
            key={start + end}
            active={isActive}
            time={{ start, end }}
            location={location}
          />
        )
      })}
    </div>
  )
}
