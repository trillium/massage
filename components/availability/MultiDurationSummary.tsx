'use client'

import { StringDateTimeIntervalAndLocation } from '@/lib/types'
import { ALLOWED_DURATIONS } from 'config'
import { useReduxAvailability } from '@/redux/hooks'

type MultiDurationSummaryProps = {
  multiDurationSlots: Record<number, StringDateTimeIntervalAndLocation[]>
}

/**
 * Summary component showing availability across all durations
 * Helps users understand which durations have immediate availability
 */
export function MultiDurationSummary({ multiDurationSlots }: MultiDurationSummaryProps) {
  const { duration: selectedDuration } = useReduxAvailability()

  // Calculate availability stats
  const durationStats = ALLOWED_DURATIONS.map((duration) => {
    const slots = multiDurationSlots[duration] || []
    return {
      duration,
      availableSlots: slots.length,
      isSelected: duration === selectedDuration,
    }
  }).filter((stat) => stat.availableSlots > 0) // Only show durations with availability

  if (durationStats.length === 0) {
    return null // No availability to show
  }

  // Show different messages based on availability
  const totalAvailableSlots = durationStats.reduce((sum, stat) => sum + stat.availableSlots, 0)
  const availableDurations = durationStats.length

  return (
    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Next Available Appointments
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {totalAvailableSlots} slot{totalAvailableSlots !== 1 ? 's' : ''} across{' '}
            {availableDurations} duration{availableDurations !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex space-x-1">
          {durationStats.map(({ duration, availableSlots, isSelected }) => (
            <div
              key={duration}
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                isSelected
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
              title={`${availableSlots} slot${availableSlots !== 1 ? 's' : ''} available for ${duration}-minute sessions`}
            >
              {duration}min ({availableSlots})
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
