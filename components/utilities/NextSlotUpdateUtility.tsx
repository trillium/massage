'use client'

import { useEffect } from 'react'
import { useAppDispatch, useReduxAvailability } from '@/redux/hooks'
import { setSlots } from '@/redux/slices/availabilitySlice'
import { StringDateTimeIntervalAndLocation } from '@/lib/types'
import { DEFAULT_DURATION, ALLOWED_DURATIONS } from 'config'

type NextSlotUpdateUtilityProps = {
  /** Serialized multi-duration availability data */
  multiDurationSlots: Record<number, StringDateTimeIntervalAndLocation[]>
}

/**
 * Specialized UpdateSlotsUtility for next-slot booking pages
 * Handles multi-duration availability updates when user changes duration preference
 */
export function NextSlotUpdateUtility({ multiDurationSlots }: NextSlotUpdateUtilityProps) {
  const { duration: durationRedux } = useReduxAvailability()
  const dispatchRedux = useAppDispatch()

  useEffect(() => {
    // Use the selected duration or default to DEFAULT_DURATION
    const selectedDuration = durationRedux || DEFAULT_DURATION

    // Get slots for the selected duration from our serialized multi-duration data
    const newSlots = multiDurationSlots[selectedDuration] || []

    // Update Redux with the new slots
    dispatchRedux(setSlots(newSlots))
  }, [durationRedux, multiDurationSlots, dispatchRedux])

  return null // This is a utility component, no UI
}
