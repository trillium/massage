'use client'

import { useCallback, useEffect } from 'react'
import { format } from 'date-fns-tz'

import { ALLOWED_DURATIONS } from 'config'

import { setDuration, setSelectedDate, setSlots } from '@/redux/slices/availabilitySlice'
import { useAppDispatch, useReduxAvailability } from '@/redux/hooks'
import { setEventContainers } from '@/redux/slices/eventContainersSlice'
import {
  setAllowedDurations,
  setBulkConfigSliceState,
  setLeadTimeMinimum,
} from '@/redux/slices/configSlice'
import { setForm } from '@/redux/slices/formSlice'
import { SlugConfigurationType, StringDateTimeIntervalAndLocation } from '@/lib/types'

type InitialUrlUtilityProps = {
  selectedDate?: string | null
  duration: number
  eventMemberString?: string
  eventBaseString?: string
  allowedDurations: number[]
  slots: StringDateTimeIntervalAndLocation[]
  configSliceData: SlugConfigurationType | null
}

export function InitialUrlUtility({
  selectedDate,
  duration,
  eventMemberString,
  eventBaseString,
  allowedDurations,
  slots,
  configSliceData,
}: InitialUrlUtilityProps) {
  const dispatchRedux = useAppDispatch()

  const { timeZone, selectedDate: selectedDateRedux } = useReduxAvailability()

  const initialURLParamsData = useCallback(() => {
    dispatchRedux(setSlots(slots))
    if (configSliceData) {
      dispatchRedux(setBulkConfigSliceState(configSliceData))

      // If config has location data, populate the form with it
      if (configSliceData.location) {
        dispatchRedux(setForm({ location: configSliceData.location }))
      }
    }
    if (configSliceData?.allowedDurations !== undefined) {
      dispatchRedux(setAllowedDurations(configSliceData.allowedDurations))
    }
    if (configSliceData?.leadTimeMinimum !== undefined) {
      dispatchRedux(setLeadTimeMinimum(configSliceData.leadTimeMinimum))
    }
    if (selectedDate && !selectedDateRedux) {
      dispatchRedux(setSelectedDate(selectedDate))
    } else {
      if (slots.length > 0) {
        const firstAvail = format(slots[0].start, 'yyyy-MM-dd', { timeZone })
        dispatchRedux(setSelectedDate(firstAvail))
      }
    }
    const newDuration: number =
      duration || allowedDurations[Math.floor(allowedDurations.length / 2)]
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
