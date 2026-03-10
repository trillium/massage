'use client'

import { useMemo, useState } from 'react'
import { useReduxAvailability, useAppDispatch } from '@/redux/hooks'
import { setSelectedTime } from '@/redux/slices/availabilitySlice'
import { setModal } from '@/redux/slices/modalSlice'
import { setEventContainers } from '@/redux/slices/eventContainersSlice'
import { useSlotHoldContext } from 'hooks/SlotHoldContext'
import TimeButton from './TimeButton'
import { DataFreshnessPill } from './DataFreshnessPill'
import type {
  StringDateTimeIntervalAndLocation,
  StringDateTimeInterval,
  LocationObject,
} from '@/lib/types'

import { format } from 'date-fns-tz'

export default function TimeList({}) {
  const { slots: slotsRedux, selectedDate, selectedTime, timeZone } = useReduxAvailability()
  const dispatch = useAppDispatch()
  const { claimHold, claiming } = useSlotHoldContext()
  const [claimingSlot, setClaimingSlot] = useState<string | null>(null)

  const slots = slotsRedux || []

  const timeSignature = (selectedTime?.start ?? '') + (selectedTime?.end ?? '')

  const availabilityByDate = useMemo(
    () =>
      slots.reduce<Record<string, StringDateTimeIntervalAndLocation[]>>((acc, slot) => {
        const date = format(slot.start, 'yyyy-MM-dd', { timeZone })
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(slot)
        return acc
      }, {}),
    [slots, timeZone]
  )

  const availability = selectedDate ? availabilityByDate[selectedDate.toString()] : []

  const handleTimeButtonClick = async (time: StringDateTimeInterval, location?: LocationObject) => {
    const slotKey = time.start + time.end
    setClaimingSlot(slotKey)

    const held = await claimHold(time.start, time.end)
    setClaimingSlot(null)

    if (!held) return

    dispatch(setSelectedTime({ start: time.start, end: time.end }))
    if (location) {
      dispatch(setEventContainers({ location: location }))
    } else {
      dispatch(setEventContainers({ location: undefined }))
    }
    dispatch(setModal({ status: 'open' }))
  }

  return (
    <div className="relative pt-2">
      <DataFreshnessPill />
      <div className="grid grid-cols-2 gap-2">
        {availability?.map(({ start, end, location, className }) => {
          const slotKey = start + end
          const isActive = selectedTime ? slotKey === timeSignature : false
          const isLoading = claiming && claimingSlot === slotKey

          return (
            <TimeButton
              key={slotKey}
              active={isActive}
              time={{ start, end }}
              timeZone={timeZone}
              location={location}
              className={className}
              disabled={claiming}
              loading={isLoading}
              onTimeSelect={handleTimeButtonClick}
            />
          )
        })}
      </div>
    </div>
  )
}
