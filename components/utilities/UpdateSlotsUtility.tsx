'use client'

import { useCallback, useEffect } from 'react'

import { useAppDispatch, useReduxAvailability } from '@/redux/hooks'
import { setSlots } from '@/redux/slices/availabilitySlice'
import { useDispatch } from 'react-redux'
import { createSlots } from '@/lib/availability/createSlots'
import { DEFAULT_DURATION, LEAD_TIME } from 'config'

type UrlParams = {
  duration?: string
  selectedDate?: string
  timeZone?: string
}

export function UpdateSlotsUtility({ busy, containers, start, end }) {
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

  useEffect(() => {
    const newSlots = createSlots({
      duration: durationRedux || DEFAULT_DURATION,
      leadTime: LEAD_TIME,
      start,
      end,
      busy,
      containers,
    })
    dispatchRedux(setSlots(newSlots))
    createNewUrlParams()
  }, [createNewUrlParams])

  return <></>
}
