import {
  GoogleCalendarV3Event,
  SearchParamsType,
  StringDateTimeIntervalAndLocation,
} from '@/lib/types'
import { fetchData } from '@/lib/fetch/fetchData'
import { createMultiDurationAvailability } from '@/lib/availability/getNextSlotAvailability'
import { geocodeLocation } from '@/lib/geocode'
import { ALLOWED_DURATIONS, LEAD_TIME, OWNER_TIMEZONE } from 'config'
import { toZonedTime } from 'date-fns-tz'
import { format } from 'date-fns'
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
  const zonedNow = toZonedTime(now, OWNER_TIMEZONE)

  const todayStr = format(zonedNow, 'yyyy-MM-dd')
  const tomorrowDate = new Date(zonedNow)
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = format(tomorrowDate, 'yyyy-MM-dd')
  const dayAfterDate = new Date(tomorrowDate)
  dayAfterDate.setDate(dayAfterDate.getDate() + 1)
  const dayAfterStr = format(dayAfterDate, 'yyyy-MM-dd')

  const twoDaySearchParams = {
    ...resolvedParams,
    start: todayStr,
    end: dayAfterStr,
  }

  const generalData = await fetchData({ searchParams: twoDaySearchParams })

  const END_OF_BUSINESS_HOUR = 23
  const MINIMUM_VIABLE_HOURS = 1
  const leadTimeHours = LEAD_TIME / 60
  const currentHour = zonedNow.getHours() + zonedNow.getMinutes() / 60
  const earliestBookableHour = currentHour + leadTimeHours

  let targetDateString: string
  if (earliestBookableHour + MINIMUM_VIABLE_HOURS <= END_OF_BUSINESS_HOUR) {
    targetDateString = todayStr
  } else {
    targetDateString = tomorrowStr
  }

  return {
    start: targetDateString,
    end: targetDateString,
    busy: generalData.busy,
    nextEventFound: false,
    targetDate: targetDateString,
  }
}
