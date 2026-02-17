'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAppDispatch, useReduxAvailability, useReduxConfig } from '@/redux/hooks'
import { setSlots, setSelectedDate, setDuration } from '@/redux/slices/availabilitySlice'
import {
  setBulkConfigSliceState,
  setLocation,
  setLocationReadOnly,
} from '@/redux/slices/configSlice'
import { mergeParamsWithLocation } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import { createSlots } from '@/lib/availability/createSlots'
import { todayWithOffset } from '@/lib/dayAsObject'
import { DEFAULT_DURATION, LEAD_TIME } from 'config'
import { format } from 'date-fns'
import {
  DayWithStartEnd,
  GoogleCalendarV3Event,
  SlugConfigurationType,
  StringInterval,
  StringDateTimeIntervalAndLocation,
} from '@/lib/types'

type UrlParams = {
  duration?: string
  selectedDate?: string
  timeZone?: string
}

type NextSlotMultiDurationsType = Record<number, StringDateTimeIntervalAndLocation[]>

// 1. Configuration Utility - Handles Redux config setup
export function ConfigurationUtility({
  configObject,
}: {
  configObject: SlugConfigurationType | null
}) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (configObject) {
      dispatch(setBulkConfigSliceState(configObject))
      if (configObject.location) {
        dispatch(setLocation(configObject.location))
      }
      dispatch(setLocationReadOnly(configObject.locationIsReadOnly ?? false))
    }
  }, [configObject, dispatch])

  return <></>
}

// 2. Initialization Utility - Sets up initial state from props
export function InitializationUtility({
  initialSlots,
  initialSelectedDate,
  initialDuration,
}: {
  initialSlots?: StringDateTimeIntervalAndLocation[]
  initialSelectedDate?: string
  initialDuration?: number
}) {
  const { selectedDate: selectedDateRedux, duration: durationRedux } = useReduxAvailability()
  const dispatch = useAppDispatch()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return

    // Set initial slots
    if (initialSlots && initialSlots.length > 0) {
      dispatch(setSlots(initialSlots))
    }

    // Set initial selected date
    if (initialSelectedDate && !selectedDateRedux) {
      dispatch(setSelectedDate(initialSelectedDate))
    }

    // Set initial duration
    if (initialDuration && !durationRedux) {
      dispatch(setDuration(initialDuration))
    }

    initializedRef.current = true
  }, [
    initialSlots,
    initialSelectedDate,
    initialDuration,
    dispatch,
    selectedDateRedux,
    durationRedux,
  ])

  return <></>
}

// 3. Slot Generation Utility - Generates and updates slots
export function SlotGenerationUtility(
  props: {
    busy: StringInterval[]
    containers?: GoogleCalendarV3Event[]
    nextSlotMultiDurations?: NextSlotMultiDurationsType
    isNextSlotPage?: boolean
    shouldAutoSelectFirstDate?: boolean
  } & (
    | {
        nextSlotMultiDurations: NextSlotMultiDurationsType
        start?: never
        end?: never
      }
    | {
        nextSlotMultiDurations?: undefined
        start: DayWithStartEnd
        end: DayWithStartEnd
      }
  )
) {
  const { duration: durationRedux, selectedDate: selectedDateRedux } = useReduxAvailability()
  const { leadTimeMinimum: leadTime } = useReduxConfig()
  const dispatch = useAppDispatch()

  useEffect(() => {
    let newSlots: StringDateTimeIntervalAndLocation[] = []

    if (props.isNextSlotPage && props.nextSlotMultiDurations && durationRedux) {
      // Next-slot page: use pre-calculated multi-duration data
      if (props.nextSlotMultiDurations[durationRedux]) {
        newSlots = props.nextSlotMultiDurations[durationRedux]
      }
    } else if (props.start && props.end) {
      // Regular page: generate slots
      newSlots = createSlots({
        duration: durationRedux || DEFAULT_DURATION,
        leadTime: leadTime ?? LEAD_TIME,
        start: props.start,
        end: props.end,
        busy: props.busy,
        containers: props.containers,
      })
    }

    dispatch(setSlots(newSlots))

    // Auto-select first available date if none selected and slots are available
    if (props.shouldAutoSelectFirstDate && !selectedDateRedux && newSlots.length > 0) {
      const firstAvail = format(new Date(newSlots[0].start), 'yyyy-MM-dd')
      dispatch(setSelectedDate(firstAvail))
    }
  }, [durationRedux, leadTime, props, dispatch, selectedDateRedux])

  return <></>
}

// 4. URL Synchronization Utility - Keeps URL in sync with Redux
export function UrlSynchronizationUtility() {
  const {
    duration: durationRedux,
    selectedDate: selectedDateRedux,
    timeZone,
  } = useReduxAvailability()

  const updateUrl = useCallback(() => {
    const newParamsObj: UrlParams = {}
    if (durationRedux) newParamsObj.duration = durationRedux.toString()
    if (selectedDateRedux) newParamsObj.selectedDate = selectedDateRedux
    if (timeZone !== 'America/Los_Angeles') newParamsObj.timeZone = timeZone

    const merged = mergeParamsWithLocation(window.location.search, newParamsObj)
    const finalUrl = `${window.location.pathname}${merged ? '?' + merged : ''}`
    window.history.replaceState(null, '', finalUrl)
  }, [durationRedux, selectedDateRedux, timeZone])

  useEffect(() => {
    updateUrl()
  }, [updateUrl])

  return <></>
}

// Convenience wrapper for standard booking pages (replaces UpdateSlotsUtility)
export function UpdateSlotsUtility(props: {
  busy: StringInterval[]
  containers?: GoogleCalendarV3Event[]
  start: DayWithStartEnd
  end: DayWithStartEnd
  configObject: SlugConfigurationType | null
}) {
  return (
    <>
      <ConfigurationUtility configObject={props.configObject} />
      <SlotGenerationUtility
        busy={props.busy}
        containers={props.containers}
        start={props.start}
        end={props.end}
        shouldAutoSelectFirstDate={true}
      />
      <UrlSynchronizationUtility />
    </>
  )
}

// Convenience wrapper for next-slot pages (replaces NextSlotUpdateUtility)
export function NextSlotUpdateUtility(props: {
  busy: StringInterval[]
  containers?: GoogleCalendarV3Event[]
  start: DayWithStartEnd
  end: DayWithStartEnd
  configObject: SlugConfigurationType | null
  nextSlotMultiDurations: NextSlotMultiDurationsType
}) {
  return (
    <>
      <ConfigurationUtility configObject={props.configObject} />
      <SlotGenerationUtility
        busy={props.busy}
        containers={props.containers}
        nextSlotMultiDurations={props.nextSlotMultiDurations}
        isNextSlotPage={true}
        shouldAutoSelectFirstDate={true}
      />
    </>
  )
}

// Convenience wrapper for initialization only (replaces InitialUrlUtility)
export function InitialUrlUtility(props: {
  configObject: SlugConfigurationType | null
  initialSlots: StringDateTimeIntervalAndLocation[]
  initialSelectedDate?: string
  initialDuration?: number
}) {
  return (
    <>
      <ConfigurationUtility configObject={props.configObject} />
      <InitializationUtility
        initialSlots={props.initialSlots}
        initialSelectedDate={props.initialSelectedDate}
        initialDuration={props.initialDuration}
      />
    </>
  )
}

// URL updating is now built into AvailabilityUtility, but keeping for compatibility
export function UrlUpdateUtility() {
  return <UrlSynchronizationUtility />
}
