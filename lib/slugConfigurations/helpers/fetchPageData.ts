import {
  GoogleCalendarV3Event,
  SearchParamsType,
  SlugConfigurationType,
  StringInterval,
  StringDateTimeIntervalAndLocation,
} from '@/lib/types'
import {
  fetchContainersByQuery,
  fetchContainerGeneric,
  fetchAllCalendarEvents,
  filterEventsForQuery,
  filterEventsForGeneralBlocking,
} from '@/lib/fetch/fetchContainersByQuery'
import { fetchData } from '@/lib/fetch/fetchData'
import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import { createMultiDurationAvailability } from '@/lib/availability/getNextSlotAvailability'
import { getNextUpcomingEvent } from '@/lib/fetch/getNextUpcomingEvent'
import { ALLOWED_DURATIONS } from 'config'

type MockedData = {
  start: string
  end: string
  busy: Array<{ start: Date; end: Date }>
  timeZone?: string
  data?: Record<string, unknown>
}

type FetchPageDataReturnType = {
  start: string
  end: string
  busy: StringInterval[]
  containers?: GoogleCalendarV3Event[]
  timeZone?: string
  data?: Record<string, unknown>
  multiDurationSlots?: Record<number, StringDateTimeIntervalAndLocation[]>
  currentEvent?: GoogleCalendarV3Event
  nextEventFound: boolean
  targetDate?: string
}

/**
 * Fetches data based on configuration type and mocking requirements
 */
export async function fetchPageData(
  configuration: SlugConfigurationType,
  resolvedParams: SearchParamsType,
  bookingSlug?: string,
  mocked?: MockedData | null,
  eventId?: string,
  currentEvent?: GoogleCalendarV3Event
): Promise<FetchPageDataReturnType> {
  // If configuration type is null, this is an invalid/non-existent slug
  if (configuration?.type === null) {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD format
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    return {
      start: todayStr,
      end: yesterdayStr, // End before start = invalid range, no availability
      busy: [],
      nextEventFound: false, // Invalid slug never has a next event
    }
  }

  if (mocked) {
    // Use mocked data instead of fetching
    const result = {
      start: mocked.start,
      end: mocked.end,
      busy: mocked.busy.map((busyItem) => ({
        start: busyItem.start.toISOString(),
        end: busyItem.end.toISOString(),
      })),
      timeZone: mocked.timeZone,
      data: mocked.data || {},
      containers: [], // Ensure containers property exists
      nextEventFound: false, // Mocked data never has a next event
    }
    return result
  }

  // Check for container-based availability
  // This handles both 'scheduled-site' type and configurations with eventContainer property
  if (
    (configuration?.type === 'scheduled-site' && !!bookingSlug) ||
    configuration?.eventContainer
  ) {
    const query = configuration?.eventContainer || bookingSlug!
    const blockingScope = configuration?.blockingScope || 'event' // default to 'event' behavior

    let containerData

    if (blockingScope === 'general') {
      // For general blocking, fetch ALL calendar events and filter for general blocking
      const allEventsData = await fetchAllCalendarEvents({
        searchParams: resolvedParams,
      })

      const generalBlocking = filterEventsForGeneralBlocking(allEventsData.allEvents)
      const querySpecific = filterEventsForQuery(allEventsData.allEvents, query)

      containerData = {
        start: allEventsData.start,
        end: allEventsData.end,
        busy: generalBlocking.busyQuery, // Block against ALL events
        containers: querySpecific.containers, // But still only show containers for this query
      }
    } else {
      // For event-only blocking (default behavior), use the original logic
      containerData = await fetchContainersByQuery({
        searchParams: resolvedParams,
        query,
      })
    }

    // Convert busy times to the expected string format
    const busyConverted = containerData.busy.map((busyItem) => ({
      start: typeof busyItem.start === 'string' ? busyItem.start : busyItem.start.dateTime,
      end: typeof busyItem.end === 'string' ? busyItem.end : busyItem.end.dateTime,
    }))

    const result = {
      start: containerData.start,
      end: containerData.end,
      busy: busyConverted,
      containers: containerData.containers,
      nextEventFound: false, // Container-based bookings don't have next events
    }
    return result
  }

  if (configuration?.type === 'fixed-location') {
    // Fixed-location bookings use regular data fetching and OWNER_AVAILABILITY
    const regularData = await fetchData({ searchParams: resolvedParams })
    // Don't include containers - this will use OWNER_AVAILABILITY in getPotentialTimes
    const result = {
      start: regularData.start,
      end: regularData.end,
      busy: regularData.busy,
      nextEventFound: false, // Fixed-location bookings don't have next events
    }
    return result
  }

  if (configuration?.type === 'next') {
    let actualCurrentEvent: GoogleCalendarV3Event | null = null

    if (currentEvent) {
      // Use the provided event object (no need to refetch)
      actualCurrentEvent = currentEvent
    } else if (eventId && typeof eventId === 'string') {
      // Fetch the single event details using the provided eventId
      const fetchedEvent = await fetchSingleEvent(eventId)
      if (!fetchedEvent) {
        throw new Error(`Event not found: ${eventId}`)
      }
      actualCurrentEvent = fetchedEvent
    } else {
      // No specific event provided - try to find the next upcoming event automatically
      actualCurrentEvent = await getNextUpcomingEvent()
    }

    // If we found an event, use next-slot availability
    if (actualCurrentEvent) {
      // Use multi-duration availability system for flexible next-slot booking
      const multiDurationAvailability = await createMultiDurationAvailability({
        currentEvent: actualCurrentEvent,
        durationOptions: ALLOWED_DURATIONS, // Use all allowed durations
        slotInterval: 15, // 15-minute increments
        maxMinutesAhead: 30, // Look 30 minutes ahead
      })

      // Serialize multi-duration availability data for client components
      const multiDurationSlots: Record<number, StringDateTimeIntervalAndLocation[]> = {}
      for (const duration of ALLOWED_DURATIONS) {
        multiDurationSlots[duration] =
          multiDurationAvailability.getTimeListFormatForDuration(duration)
      }

      // For next-type configurations, we provide the event end time as the start
      // and 30 minutes after as the end (matching the maxMinutesAhead)
      const eventEndTime = actualCurrentEvent.end?.dateTime
        ? new Date(actualCurrentEvent.end.dateTime)
        : new Date()
      const searchEndTime = new Date(eventEndTime.getTime() + 30 * 60 * 1000) // 30 minutes later

      // Convert to YYYY-MM-DD format for dayFromString compatibility
      const startDateString = eventEndTime.toISOString().split('T')[0]
      const endDateString = searchEndTime.toISOString().split('T')[0]

      const result = {
        start: startDateString,
        end: endDateString,
        busy: [], // Next-type configurations don't use traditional busy slots
        multiDurationSlots,
        currentEvent: actualCurrentEvent,
        nextEventFound: true, // Flag to indicate next event was found
      }
      return result
    } else {
      // No upcoming event found - intelligently fallback based on actual availability
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

      // Fetch general availability for the next 2 days to check what's actually available
      const twoDaySearchParams = {
        ...resolvedParams,
        start: today.toISOString().split('T')[0],
        end: dayAfterTomorrow.toISOString().split('T')[0], // Include 2 days
      }

      const generalData = await fetchData({ searchParams: twoDaySearchParams })

      // Create temporary slots for today to see if any are available after lead time
      const leadTimeMinutes = 3 * 60 // 3 hours in minutes
      const earliestBookingTime = new Date(now.getTime() + leadTimeMinutes * 60 * 1000)

      // Check if there's meaningful business time left today
      // Business hours are 10 AM - 11 PM (23:00) from config.ts OWNER_AVAILABILITY
      const endOfBusinessToday = new Date(today)
      endOfBusinessToday.setHours(23, 0, 0, 0) // 11 PM is the close time

      // We need at least 60 minutes of business time for a viable appointment
      // (shortest duration is 60 minutes per ALLOWED_DURATIONS)
      const minimumViableTime = 60 * 60 * 1000 // 60 minutes in milliseconds

      let targetDate: Date
      let targetDateString: string

      if (earliestBookingTime.getTime() + minimumViableTime <= endOfBusinessToday.getTime()) {
        // There's enough viable business time left today for at least a 60-minute appointment
        targetDate = today
        targetDateString = today.toISOString().split('T')[0]
      } else {
        // Not enough viable business time left today - offer tomorrow
        targetDate = tomorrow
        targetDateString = tomorrow.toISOString().split('T')[0]
      }

      // Return availability constrained to the single target day
      const result = {
        start: targetDateString, // Single day start
        end: targetDateString, // Single day end (same day)
        busy: generalData.busy, // Keep all busy times (slot creation will filter by date)
        nextEventFound: false, // Flag to indicate no next event was found
        targetDate: targetDateString, // Add info about which day we're targeting
      }
      return result
    }
  }

  if (configuration?.type === 'previous') {
    // get soonest event
    // offer slots between 0 and leadTime minutes before session
  }

  if (configuration?.type === 'next-previous') {
    // get soonest event
    // offer slots between 0 and leadTime minutes before and after session
  }

  // Default case: area-wide or null type configurations
  const regularData = await fetchData({ searchParams: resolvedParams })
  // Don't include containers - this will use OWNER_AVAILABILITY in getPotentialTimes
  const result = {
    start: regularData.start,
    end: regularData.end,
    busy: regularData.busy,
    nextEventFound: false, // Default case never has a next event
  }
  return result
}
