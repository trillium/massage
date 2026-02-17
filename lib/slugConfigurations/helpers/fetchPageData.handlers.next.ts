import {
  GoogleCalendarV3Event,
  SearchParamsType,
  StringDateTimeIntervalAndLocation,
} from '@/lib/types'
import { fetchData } from '@/lib/fetch/fetchData'
import { createMultiDurationAvailability } from '@/lib/availability/getNextSlotAvailability'
import { geocodeLocation } from '@/lib/geocode'
import { ALLOWED_DURATIONS, LEAD_TIME } from 'config'
import { FetchPageDataReturnType } from './fetchPageData.types'

type PageDataResult = Omit<FetchPageDataReturnType, 'debugInfo'>

export async function fetchNextWithEventResult(
  event: GoogleCalendarV3Event
): Promise<PageDataResult> {
  const multiDurationAvailability = await createMultiDurationAvailability({
    currentEvent: event,
    durationOptions: ALLOWED_DURATIONS,
    slotInterval: 15,
    maxMinutesAhead: 30,
  })

  const multiDurationSlots: Record<number, StringDateTimeIntervalAndLocation[]> = {}
  for (const duration of ALLOWED_DURATIONS) {
    multiDurationSlots[duration] = multiDurationAvailability.getTimeListFormatForDuration(duration)
  }

  const SEARCH_BUFFER_MS = 30 * 60 * 1000
  const eventEndTime = event.end?.dateTime ? new Date(event.end.dateTime) : new Date()
  const searchEndTime = new Date(eventEndTime.getTime() + SEARCH_BUFFER_MS)
  const startDateString = eventEndTime.toISOString().split('T')[0]
  const endDateString = searchEndTime.toISOString().split('T')[0]

  let eventCoordinates: { latitude: number; longitude: number } | undefined
  if (event.location) {
    try {
      const geocodeResult = await geocodeLocation(event.location)
      if (geocodeResult.success && geocodeResult.coordinates) {
        eventCoordinates = {
          latitude: geocodeResult.coordinates.lat,
          longitude: geocodeResult.coordinates.lng,
        }
      }
    } catch (error) {
      console.error('Error geocoding event location:', error)
    }
  }

  return {
    start: startDateString,
    end: endDateString,
    busy: [],
    multiDurationSlots,
    currentEvent: event,
    eventCoordinates,
    nextEventFound: true,
  }
}

export async function fetchNextNoEventFallback(
  resolvedParams: SearchParamsType
): Promise<PageDataResult> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfterTomorrow = new Date(tomorrow)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

  const twoDaySearchParams = {
    ...resolvedParams,
    start: today.toISOString().split('T')[0],
    end: dayAfterTomorrow.toISOString().split('T')[0],
  }

  const generalData = await fetchData({ searchParams: twoDaySearchParams })

  const END_OF_BUSINESS_HOUR = 23
  const MINIMUM_VIABLE_MS = 60 * 60 * 1000
  const earliestBookingTime = new Date(now.getTime() + LEAD_TIME * 60 * 1000)
  const endOfBusinessToday = new Date(today)
  endOfBusinessToday.setHours(END_OF_BUSINESS_HOUR, 0, 0, 0)

  let targetDateString: string
  if (earliestBookingTime.getTime() + MINIMUM_VIABLE_MS <= endOfBusinessToday.getTime()) {
    targetDateString = today.toISOString().split('T')[0]
  } else {
    targetDateString = tomorrow.toISOString().split('T')[0]
  }

  return {
    start: targetDateString,
    end: targetDateString,
    busy: generalData.busy,
    nextEventFound: false,
    targetDate: targetDateString,
  }
}
