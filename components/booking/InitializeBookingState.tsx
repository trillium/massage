'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { setSlots, setDuration, setSelectedDate } from '@/redux/slices/availabilitySlice'
import { StringDateTimeIntervalAndLocation } from '@/lib/types'

interface InitializeBookingStateProps {
  slots: StringDateTimeIntervalAndLocation[]
  duration: number
  selectedDate?: string
}

/**
 * Client component that initializes Redux state with server-generated data
 * This replaces the need for utility functions like NextSlotUpdateUtility
 */
export default function InitializeBookingState({
  slots,
  duration,
  selectedDate,
}: InitializeBookingStateProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Initialize Redux state with server-generated data
    dispatch(setSlots(slots))
    dispatch(setDuration(duration))
    if (selectedDate) {
      dispatch(setSelectedDate(selectedDate))
    }
  }, [dispatch, slots, duration, selectedDate])

  // This component doesn't render anything, it just initializes state
  return null
}
