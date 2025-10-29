'use client'

import { useReduxAvailability, useAppDispatch } from '@/redux/hooks'
import { setSelectedTime } from '@/redux/slices/availabilitySlice'
import { setModal } from '@/redux/slices/modalSlice'
import { setEventContainers } from '@/redux/slices/eventContainersSlice'
import TimeButton from './TimeButton'
import type {
  StringDateTimeIntervalAndLocation,
  StringDateTimeInterval,
  LocationObject,
} from '@/lib/types'

import { format } from 'date-fns-tz'

export default function TimeList({}) {
  const { slots: slotsRedux, selectedDate } = useReduxAvailability()
  const { selectedTime, timeZone } = useReduxAvailability()
  const dispatchRedux = useAppDispatch()

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

  const handleTimeButtonClick = (time: StringDateTimeInterval, location?: LocationObject) => {
    dispatchRedux(
      setSelectedTime({
        start: time.start,
        end: time.end,
      })
    )
    if (location) {
      // Set the location in eventContainers - don't convert to empty string
      dispatchRedux(setEventContainers({ location: location }))
    } else {
      // Don't clear all eventContainers, just clear the location field
      dispatchRedux(setEventContainers({ location: undefined }))
    }
    dispatchRedux(setModal({ status: 'open' }))
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {availability?.map(({ start, end, location, className }) => {
        const isActive = selectedTime ? start + end === timeSignature : false

        return (
          <TimeButton
            key={start + end}
            active={isActive}
            time={{ start, end }}
            timeZone={timeZone}
            location={location}
            className={className}
            onTimeSelect={handleTimeButtonClick}
          />
        )
      })}
    </div>
  )
}
