'use client'

import { useCallback, useEffect } from 'react'
import { format } from 'date-fns-tz'

import { ALLOWED_DURATIONS } from 'config'

import { setDuration, setSelectedDate, setSlots } from '@/redux/slices/availabilitySlice'
import { useAppDispatch, useReduxAvailability } from '@/redux/hooks'
import { setEventContainers } from '@/redux/slices/eventContainersSlice'
import { setBulkConfigSliceState } from '@/redux/slices/configSlice'

export function InitialUrlUtility({
  selectedDate,
  duration,
  eventMemberString,
  eventBaseString,
  allowedDurations,
  slots,
  configSliceData,
}) {
  const dispatchRedux = useAppDispatch()

  const { timeZone, selectedDate: selectedDateRedux } = useReduxAvailability()

  const initialURLParamsData = useCallback(() => {
    const newConfigSlcieState = {}

    dispatchRedux(setSlots(slots))
    dispatchRedux(setBulkConfigSliceState(configSliceData))

    if (selectedDate && !selectedDateRedux) {
      dispatchRedux(setSelectedDate(selectedDate))
    } else {
      if (slots.length > 0) {
        const firstAvail = format(slots[0].start, 'yyyy-MM-dd', { timeZone })
        dispatchRedux(setSelectedDate(firstAvail))
      }
    }
    const newDuration = duration || allowedDurations
    const ALLOWED = allowedDurations || ALLOWED_DURATIONS
    if (!ALLOWED.includes(newDuration)) {
      const middleIndex = Math.floor((ALLOWED.length - 1) / 2)
      const biasedIndex = ALLOWED.length % 2 === 0 ? middleIndex + 1 : middleIndex
      const adjustedDuration = ALLOWED[biasedIndex]
      dispatchRedux(setDuration(adjustedDuration))
    } else {
      dispatchRedux(setDuration(newDuration))
    }
    if (eventMemberString) {
      dispatchRedux(setEventContainers({ eventMemberString: eventMemberString || '' }))
    }
    if (eventBaseString) {
      dispatchRedux(setEventContainers({ eventBaseString: eventBaseString || '' }))
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    initialURLParamsData()
  }, [initialURLParamsData])

  return <></>
}
