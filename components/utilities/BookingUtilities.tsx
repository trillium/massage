'use client'

import { startTransition, useCallback, useEffect, useRef } from 'react'
import {
  useAppDispatch,
  useReduxAvailability,
  useReduxConfig,
  useReduxEdgeRole,
} from '@/redux/hooks'
import { setSlots, setSelectedDate, setDuration } from '@/redux/slices/availabilitySlice'
import {
  setBulkConfigSliceState,
  setLocation,
  setLocationReadOnly,
} from '@/redux/slices/configSlice'
import { mergeParamsWithLocation } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import { createSlots } from '@/lib/availability/createSlots'
import { DEFAULT_DURATION, LEAD_TIME } from 'config'
import { assertDateString, toDateString } from '@/lib/temporal/brands'
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

export type NextSlotMultiDurationsType = Record<number, StringDateTimeIntervalAndLocation[]>

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

export function InitializationUtility({
  initialSlots,
  initialSelectedDate,
  initialDuration,
}: {
  initialSlots?: StringDateTimeIntervalAndLocation[]
  initialSelectedDate?: string
  initialDuration?: number
}) {
  const dispatch = useAppDispatch()
  const { timeZone } = useReduxAvailability()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return

    if (initialSlots && initialSlots.length > 0) {
      dispatch(setSlots(initialSlots))

      if (!initialSelectedDate) {
        dispatch(setSelectedDate(toDateString(initialSlots[0].start, timeZone)))
      }
    }

    if (initialDuration) {
      dispatch(setDuration(initialDuration))
    }

    initializedRef.current = true
  }, [initialSlots, initialDuration, initialSelectedDate, timeZone, dispatch])

  useEffect(() => {
    if (initialSelectedDate) {
      dispatch(setSelectedDate(assertDateString(initialSelectedDate)))
    }
  }, [initialSelectedDate, dispatch])

  return <></>
}

export function SlotGenerationUtility(
  props: {
    busy: StringInterval[]
    containers?: GoogleCalendarV3Event[]
    nextSlotMultiDurations?: NextSlotMultiDurationsType
    isNextSlotPage?: boolean
    shouldAutoSelectFirstDate?: boolean
    initialSelectedDate?: string
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
  const {
    duration: durationRedux,
    selectedDate: selectedDateRedux,
    timeZone,
  } = useReduxAvailability()
  const {
    leadTimeMinimum: leadTime,
    durationBonus,
    availabilityWindowMinutes,
    nextSlotOnly,
    customFields,
  } = useReduxConfig()
  const edgeRole = useReduxEdgeRole()
  const dispatch = useAppDispatch()

  useEffect(() => {
    let newSlots: StringDateTimeIntervalAndLocation[] = []

    const effectiveDuration = durationRedux || DEFAULT_DURATION

    if (props.isNextSlotPage && props.nextSlotMultiDurations && durationRedux) {
      if (props.nextSlotMultiDurations[durationRedux]) {
        newSlots = props.nextSlotMultiDurations[durationRedux]
      }
    } else if (props.start && props.end) {
      const roleBonus = edgeRole ? (customFields?.roleBonus?.[edgeRole] ?? 0) : 0
      newSlots = createSlots({
        duration: effectiveDuration,
        durationBonus: (durationBonus ?? 0) + roleBonus,
        leadTime: leadTime ?? LEAD_TIME,
        start: props.start,
        end: props.end,
        busy: props.busy,
        containers: props.containers,
      })
    }

    if (availabilityWindowMinutes) {
      const cutoff = new Date(Date.now() + availabilityWindowMinutes * 60 * 1000)
      const next = newSlots.find((slot) => new Date(slot.start) <= cutoff)
      newSlots = next ? [next] : []
    } else if (nextSlotOnly) {
      newSlots = newSlots.length > 0 ? [newSlots[0]] : []
    }

    startTransition(() => {
      dispatch(setSlots(newSlots))

      if (
        props.shouldAutoSelectFirstDate &&
        !selectedDateRedux &&
        !props.initialSelectedDate &&
        newSlots.length > 0
      ) {
        dispatch(setSelectedDate(toDateString(newSlots[0].start, timeZone)))
      }
    })
  }, [
    durationRedux,
    leadTime,
    edgeRole,
    customFields,
    props,
    timeZone,
    dispatch,
    selectedDateRedux,
  ])

  return <></>
}

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
