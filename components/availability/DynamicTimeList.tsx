'use client'

import { useReduxAvailability } from '@/redux/hooks'
import { StringDateTimeIntervalAndLocation } from '@/lib/types'
import { DEFAULT_DURATION } from 'config'
import TimeList from '@/components/availability/time/TimeList'
import booking from '@/data/booking.json'
import { TextXs } from '@/components/ui/text'

type DynamicTimeListProps = {
  multiDurationSlots: Record<number, StringDateTimeIntervalAndLocation[]>
}

/**
 * Dynamic TimeList that updates slot count display based on selected duration
 */
export function DynamicTimeList({ multiDurationSlots }: DynamicTimeListProps) {
  const { duration: selectedDuration } = useReduxAvailability()

  const currentDuration = selectedDuration || DEFAULT_DURATION
  const currentSlots = multiDurationSlots[currentDuration] || []

  return (
    <div className="space-y-3">
      <div className="text-sm text-accent-600 dark:text-accent-400">
        <span className="font-medium">{currentSlots.length}</span>{' '}
        {booking.availability.availableSlotLabel}
        {currentSlots.length !== 1
          ? booking.availability.slotPlural
          : booking.availability.emptyString}{' '}
        {booking.availability.for} {currentDuration}
        {booking.availability.dash}
        {booking.availability.minuteSessions}
      </div>
      {currentSlots.length > 0 ? (
        <TimeList />
      ) : (
        <div className="py-4 text-center text-accent-500 dark:text-accent-400">
          <p>
            {booking.availability.noAvailableSlots} {currentDuration}
            {booking.availability.dash}
            {booking.availability.minuteSlots}
          </p>
          <TextXs className="mt-1">{booking.availability.tryDifferentDuration}</TextXs>
        </div>
      )}
    </div>
  )
}
