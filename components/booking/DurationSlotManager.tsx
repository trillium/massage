'use client'

import { useEffect } from 'react'
import { useAppDispatch, useReduxAvailability } from '@/redux/hooks'
import { setSlots } from '@/redux/slices/availabilitySlice'
import { StringDateTimeIntervalAndLocation } from '@/lib/types'

interface DurationSlotManagerProps {
  multiDurationSlots: Record<number, StringDateTimeIntervalAndLocation[]>
}

/**
 * Client component that updates Redux slots when duration changes
 * This replaces the slot management functionality from utility components
 */
export default function DurationSlotManager({ multiDurationSlots }: DurationSlotManagerProps) {
  const dispatch = useAppDispatch()
  const { duration } = useReduxAvailability()

  useEffect(() => {
    if (duration && multiDurationSlots[duration]) {
      // Update slots when duration changes
      dispatch(setSlots(multiDurationSlots[duration]))
    }
  }, [dispatch, duration, multiDurationSlots])

  // This component doesn't render anything, it just manages slot updates
  return null
}
