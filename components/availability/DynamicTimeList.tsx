'use client'

import { useReduxAvailability } from '@/redux/hooks'
import { StringDateTimeIntervalAndLocation } from '@/lib/types'
import { DEFAULT_DURATION } from 'config'
import TimeList from '@/components/availability/time/TimeList'
import booking from '@/data/booking.json'
import { TextXs, TextBase, TextSmMedium } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

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
    <Box className="space-y-3">
      <Box className="text-sm text-accent-600 dark:text-accent-400">
        <TextSmMedium as="span">{currentSlots.length}</TextSmMedium>{' '}
        {booking.availability.availableSlotLabel}
        {currentSlots.length !== 1
          ? booking.availability.slotPlural
          : booking.availability.emptyString}{' '}
        {booking.availability.for} {currentDuration}
        {booking.availability.dash}
        {booking.availability.minuteSessions}
      </Box>
      {currentSlots.length > 0 ? (
        <TimeList />
      ) : (
        <Box className="py-4 text-center text-accent-500 dark:text-accent-400">
          <TextBase>
            {booking.availability.noAvailableSlots} {currentDuration}
            {booking.availability.dash}
            {booking.availability.minuteSlots}
          </TextBase>
          <TextXs className="mt-1">{booking.availability.tryDifferentDuration}</TextXs>
        </Box>
      )}
    </Box>
  )
}
