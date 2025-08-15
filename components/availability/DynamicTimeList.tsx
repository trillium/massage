'use client'

import { useReduxAvailability } from '@/redux/hooks'
import { StringDateTimeIntervalAndLocation } from '@/lib/types'
import { DEFAULT_DURATION } from 'config'
import TimeList from '@/components/availability/time/TimeList'

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
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">{currentSlots.length}</span> available slot
        {currentSlots.length !== 1 ? 's' : ''} for {currentDuration}-minute sessions
      </div>
      {currentSlots.length > 0 ? (
        <TimeList />
      ) : (
        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
          <p>No available {currentDuration}-minute slots</p>
          <p className="mt-1 text-xs">Try selecting a different duration to see more options</p>
        </div>
      )}
    </div>
  )
}
