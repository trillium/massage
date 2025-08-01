'use client'

import { useCallback, useEffect } from 'react'
import { useAppDispatch, useReduxAvailability, useReduxConfig } from '@/redux/hooks'
import { setSlots } from '@/redux/slices/availabilitySlice'
import { createSlots } from '@/lib/availability/createSlots'
import { DEFAULT_DURATION, LEAD_TIME } from 'config'
import {
  DayWithStartEnd,
  GoogleCalendarV3Event,
  SlugConfigurationType,
  StringInterval,
} from '@/lib/types'
import {
  setBulkConfigSliceState,
  setLocation,
  setLocationReadOnly,
} from '@/redux/slices/configSlice'

type UrlParams = {
  duration?: string
  selectedDate?: string
  timeZone?: string
}

type UpdateSlotsUtilityProps = {
  busy: StringInterval[]
  containers?: GoogleCalendarV3Event[]
  start: DayWithStartEnd
  end: DayWithStartEnd
  configObject: SlugConfigurationType
}

export function UpdateSlotsUtility({
  busy,
  containers,
  start,
  end,
  configObject,
}: UpdateSlotsUtilityProps) {
  const {
    duration: durationRedux,
    timeZone,
    selectedDate: selectedDateRedux,
  } = useReduxAvailability()

  const dispatchRedux = useAppDispatch()

  const createNewUrlParams = useCallback(() => {
    const newParamsObj: UrlParams = {}
    if (durationRedux) newParamsObj.duration = durationRedux.toString()
    if (selectedDateRedux) newParamsObj.selectedDate = selectedDateRedux
    if (timeZone != 'America/Los_Angeles') newParamsObj.timeZone = timeZone
    const newUrl = new URLSearchParams({ ...newParamsObj })
    // Push to the window.
    window.history.replaceState(null, '', `${window.location.pathname}?${newUrl.toString()}`)
  }, [durationRedux, selectedDateRedux, timeZone])

  const { leadTimeMinimum: leadTime } = useReduxConfig()

  useEffect(() => {
    const newSlots = createSlots({
      duration: durationRedux || DEFAULT_DURATION,
      leadTime: leadTime ?? LEAD_TIME,
      start,
      end,
      busy,
      containers,
    })
    dispatchRedux(setSlots(newSlots))
    createNewUrlParams()
  }, [createNewUrlParams, durationRedux, leadTime, start, end, busy, containers, dispatchRedux])

  useEffect(() => {
    dispatchRedux(setBulkConfigSliceState(configObject))
    if (!!configObject && !!configObject.location) {
      dispatchRedux(setLocation(configObject.location))
    }
    dispatchRedux(setLocationReadOnly(configObject?.locationIsReadOnly ?? false))
  }, [configObject, dispatchRedux])

  return <></>
}
