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
  setLocation,
} from '@/redux/slices/configSlice'
import { setForm } from '@/redux/slices/formSlice'
import {
  SlugConfigurationType,
  StringDateTimeIntervalAndLocation,
  LocationObject,
} from '@/lib/types'
import { parseLocationFromParams } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'

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

    // Step 1: Parse URL parameters first (LOWER priority - will be overridden by server config)
    let locationFromUrl: LocationObject | null = null
    try {
      const searchParams = new URLSearchParams(window.location.search)
      const parsedLocation = parseLocationFromParams(searchParams)

      // Only use URL location if it has actual data
      if (parsedLocation.street || parsedLocation.city || parsedLocation.zip) {
        locationFromUrl = parsedLocation

        // Temporarily dispatch URL location data to Redux config slice
        // This will be overridden by server config if present
        dispatchRedux(setLocation(locationFromUrl))

        // Update form data with complete location object (not separate fields)
        // This ensures form field changes don't overwrite the location data
        dispatchRedux(setForm({ location: locationFromUrl }))

        console.log('[InitialUrlUtility] Form updates from URL:', { location: locationFromUrl })

        console.log('[InitialUrlUtility] Parsed URL location (lower priority):', locationFromUrl)
      }
    } catch (error) {
      console.warn('Failed to parse URL parameters for location:', error)
    }

    // Step 2: Apply server configuration (HIGHEST priority - overrides URL params)
    if (configSliceData) {
      dispatchRedux(setBulkConfigSliceState(configSliceData))

      // Server config location ALWAYS overrides URL parameters
      if (configSliceData.location) {
        // This will replace any URL-based location that was set above
        dispatchRedux(setLocation(configSliceData.location))
        dispatchRedux(setForm({ location: configSliceData.location }))

        console.log(
          '[InitialUrlUtility] Applied server config location (highest priority):',
          configSliceData.location
        )
        console.log(
          '[InitialUrlUtility] Server config overrode URL params:',
          locationFromUrl ? 'YES' : 'NO'
        )
      } else if (locationFromUrl) {
        // If server has no location config, URL params are used as fallback
        console.log('[InitialUrlUtility] No server location config, using URL params as fallback')
        console.log('[InitialUrlUtility] URL params should remain in form state')
      }
    } else if (locationFromUrl) {
      // If no server config at all, URL params are the only source
      console.log('[InitialUrlUtility] No server config, URL params are primary location source')
      console.log('[InitialUrlUtility] URL params should remain in form state')
    }

    // Rest of the existing logic remains unchanged
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
