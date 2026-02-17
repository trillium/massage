import {
  GoogleCalendarV3Event,
  SearchParamsType,
  StringDateTimeIntervalAndLocation,
} from '@/lib/types'
import { fetchData } from '@/lib/fetch/fetchData'
import { createMultiDurationAvailability as createAdjacentMultiDurationAvailability } from '@/lib/availability/getAdjacentSlotAvailability'
import { ALLOWED_DURATIONS } from 'config'
import { FetchPageDataReturnType } from './fetchPageData.types'

type PageDataResult = Omit<FetchPageDataReturnType, 'debugInfo'>

export async function fetchAdjacentWithEventResult(
  event: GoogleCalendarV3Event
): Promise<PageDataResult> {
  const multiDurationAvailability = await createAdjacentMultiDurationAvailability({
    currentEvent: event,
    durationOptions: ALLOWED_DURATIONS,
    slotInterval: 15,
    adjacencyBuffer: 30,
  })

  const multiDurationSlots: Record<number, StringDateTimeIntervalAndLocation[]> = {}
  for (const duration of ALLOWED_DURATIONS) {
    multiDurationSlots[duration] = multiDurationAvailability.getTimeListFormatForDuration(duration)
  }

  const eventStartTime = event.start?.dateTime ? new Date(event.start.dateTime) : new Date()
  const eventEndTime = event.end?.dateTime ? new Date(event.end.dateTime) : new Date()

  return {
    start: eventStartTime.toISOString().split('T')[0],
    end: eventEndTime.toISOString().split('T')[0],
    busy: [],
    multiDurationSlots,
    currentEvent: event,
    nextEventFound: true,
  }
}

export async function fetchAdjacentNoEventFallback(
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

  return {
    start: today.toISOString().split('T')[0],
    end: tomorrow.toISOString().split('T')[0],
    busy: generalData.busy,
    nextEventFound: false,
  }
}
