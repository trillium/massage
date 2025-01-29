'use client'

import { useCallback, useEffect } from 'react'

import { useReduxAvailability } from '@/redux/hooks'

type UrlParams = {
  duration?: string
  selectedDate?: string
  timeZone?: string
}

export function UrlUpdateUtility() {
  const {
    duration: durationRedux,
    timeZone,
    selectedDate: selectedDateRedux,
  } = useReduxAvailability()

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
    createNewUrlParams()
  }, [createNewUrlParams])

  return <></>
}
