import {
  GoogleCalendarV3Event,
  StringDateTimeIntervalAndLocation,
  LocationObject,
  CalendarAvailabilitySlot,
  SlotSearchOptions,
  MultiDurationSearchOptions,
  AvailabilityCacheBase,
  MultiDurationAvailability,
} from '@/lib/types'
import { addMinutes, subMinutes, isBefore, isAfter, parseISO } from 'date-fns'
import { fetchAllCalendarEvents } from '@/lib/fetch/fetchContainersByQuery'

export interface PreviousSlotOptions extends SlotSearchOptions {
  maxMinutesBefore?: number
}

export interface MultiDurationPreviousOptions extends MultiDurationSearchOptions {
  maxMinutesBefore?: number
}

export interface PreviousAvailabilityCache extends AvailabilityCacheBase {
  eventStartTime: Date
  minSearchTime: Date
  defaultLocation: LocationObject
}

/**
 * Creates a default location object (not inherited from event)
 */
function createDefaultLocation(): LocationObject {
  return { street: 'TBD', city: 'Los Angeles', zip: '90210' }
}

/**
 * Checks if a time slot conflicts with any existing events
 */
function hasConflict(
  slotStart: Date,
  slotEnd: Date,
  existingEvents: GoogleCalendarV3Event[]
): { hasConflict: boolean; conflictingEvent?: GoogleCalendarV3Event } {
  for (const event of existingEvents) {
    if (!event.start?.dateTime || !event.end?.dateTime) continue

    const eventStart = parseISO(event.start.dateTime)
    const eventEnd = parseISO(event.end.dateTime)

    // Check for overlap: slot starts before event ends AND slot ends after event starts
    if (isBefore(slotStart, eventEnd) && isAfter(slotEnd, eventStart)) {
      return { hasConflict: true, conflictingEvent: event }
    }
  }

  return { hasConflict: false }
}

/**
 * Gets available time slots ending at or before the current event start time,
 * going back maxMinutesBefore, checking for conflicts with existing calendar events
 */
export async function getPreviousSlotAvailability(
  options: PreviousSlotOptions
): Promise<CalendarAvailabilitySlot[]> {
  const {
    currentEvent,
    appointmentDuration = 60,
    slotInterval = 15,
    maxMinutesBefore = 60,
  } = options

  // Validate current event has start time
  if (!currentEvent.start?.dateTime) {
    throw new Error('Current event must have a start dateTime')
  }

  const eventStartTime = parseISO(currentEvent.start.dateTime)
  const minSearchTime = subMinutes(eventStartTime, maxMinutesBefore)
  const defaultLocation = createDefaultLocation()

  // Fetch all existing events to check for conflicts
  // Search backwards from event start time
  const searchStartTime = subMinutes(eventStartTime, 24 * 60) // 24 hours before event start
  const allEventsData = await fetchAllCalendarEvents({
    searchParams: {
      startDate: searchStartTime.toISOString(),
      endDate: eventStartTime.toISOString(),
    },
  })
  const existingEvents = allEventsData.allEvents || []

  const availabilitySlots: CalendarAvailabilitySlot[] = []
  let slotEndTime = new Date(eventStartTime)

  // Generate slots ending at event start time, going backwards
  while (isAfter(slotEndTime, minSearchTime) || slotEndTime.getTime() === minSearchTime.getTime()) {
    const slotStart = subMinutes(slotEndTime, appointmentDuration)

    // Only include slots where start time is within our search window
    if (isAfter(slotStart, minSearchTime) || slotStart.getTime() === minSearchTime.getTime()) {
      // Check for conflicts with existing events
      const conflictCheck = hasConflict(slotStart, slotEndTime, existingEvents)

      const slot: CalendarAvailabilitySlot = {
        start: new Date(slotStart),
        end: new Date(slotEndTime),
        startISO: slotStart.toISOString(),
        endISO: slotEndTime.toISOString(),
        location: defaultLocation,
        available: !conflictCheck.hasConflict,
        conflictingEvent: conflictCheck.conflictingEvent,
        duration: appointmentDuration,
      }

      availabilitySlots.push(slot)
    }

    // Move to previous slot (earlier end time)
    slotEndTime = subMinutes(slotEndTime, slotInterval)
  }

  return availabilitySlots
}

/**
 * Gets only the available (non-conflicting) slots
 */
export async function getAvailablePreviousSlots(
  options: PreviousSlotOptions
): Promise<CalendarAvailabilitySlot[]> {
  const allSlots = await getPreviousSlotAvailability(options)
  return allSlots.filter((slot) => slot.available)
}

/**
 * Converts availability slots to the format expected by TimeList component
 */
export function convertToTimeListFormat(
  slots: CalendarAvailabilitySlot[]
): StringDateTimeIntervalAndLocation[] {
  return slots
    .filter((slot) => slot.available)
    .map((slot) => ({
      start: slot.startISO,
      end: slot.endISO,
      location: slot.location,
    }))
}

/**
 * Creates a comprehensive availability object that can handle multiple durations
 * without requiring repeated API calls to the calendar
 */
export async function createMultiDurationAvailability(
  options: MultiDurationPreviousOptions
): Promise<MultiDurationAvailability> {
  const {
    currentEvent,
    durationOptions = [30, 60, 90, 120],
    slotInterval = 15,
    maxMinutesBefore = 60,
  } = options

  // Validate current event has start time
  if (!currentEvent.start?.dateTime) {
    throw new Error('Current event must have a start dateTime')
  }

  const eventStartTime = parseISO(currentEvent.start.dateTime)
  const minSearchTime = subMinutes(eventStartTime, maxMinutesBefore)
  const defaultLocation = createDefaultLocation()

  // Fetch all existing events once
  // Search backwards from event start time, limited to 24 hours for performance
  const searchStartTime = subMinutes(eventStartTime, 24 * 60)
  const allEventsData = await fetchAllCalendarEvents({
    searchParams: {
      startDate: searchStartTime.toISOString(),
      endDate: eventStartTime.toISOString(),
    },
  })
  const existingEvents = allEventsData.allEvents || []

  // Create the cache object
  const cache: PreviousAvailabilityCache = {
    currentEvent,
    existingEvents,
    eventStartTime,
    minSearchTime,
    defaultLocation,
    slotInterval,
    cachedAt: new Date(),
    slotsByDuration: new Map(),
  }

  // Pre-calculate slots for each duration option
  for (const duration of durationOptions) {
    const slots = calculateSlotsForDuration(cache, duration)
    cache.slotsByDuration.set(duration, slots)
  }

  // Return the multi-duration availability object
  return {
    cache,
    getSlotsForDuration: (duration: number) => {
      let slots = cache.slotsByDuration.get(duration)
      if (!slots) {
        slots = calculateSlotsForDuration(cache, duration)
        cache.slotsByDuration.set(duration, slots)
      }
      return slots
    },
    getAvailableSlotsForDuration: (duration: number) => {
      const allSlots =
        cache.slotsByDuration.get(duration) || calculateSlotsForDuration(cache, duration)
      return allSlots.filter((slot) => slot.available)
    },
    getTimeListFormatForDuration: (duration: number) => {
      const availableSlots =
        cache.slotsByDuration.get(duration)?.filter((slot) => slot.available) ||
        calculateSlotsForDuration(cache, duration).filter((slot) => slot.available)
      return availableSlots.map((slot) => ({
        start: slot.startISO,
        end: slot.endISO,
        location: slot.location,
      }))
    },
    getAvailableDurations: () => {
      const availableDurations: number[] = []
      for (const [duration, slots] of cache.slotsByDuration) {
        if (slots.some((slot) => slot.available)) {
          availableDurations.push(duration)
        }
      }
      return availableDurations.sort((a, b) => a - b)
    },
    isCacheValid: () => {
      const fiveMinutesAgo = addMinutes(new Date(), -5)
      return isAfter(cache.cachedAt, fiveMinutesAgo)
    },
  }
}

/**
 * Helper function to calculate slots for a specific duration using cached data
 */
function calculateSlotsForDuration(
  cache: PreviousAvailabilityCache,
  duration: number
): CalendarAvailabilitySlot[] {
  const slots: CalendarAvailabilitySlot[] = []
  let slotEndTime = new Date(cache.eventStartTime)

  while (
    isAfter(slotEndTime, cache.minSearchTime) ||
    slotEndTime.getTime() === cache.minSearchTime.getTime()
  ) {
    const slotStart = subMinutes(slotEndTime, duration)

    // Only include slots where start time is within our search window
    if (
      isAfter(slotStart, cache.minSearchTime) ||
      slotStart.getTime() === cache.minSearchTime.getTime()
    ) {
      // Check for conflicts with existing events
      const conflictCheck = hasConflict(slotStart, slotEndTime, cache.existingEvents)

      const slot: CalendarAvailabilitySlot = {
        start: new Date(slotStart),
        end: new Date(slotEndTime),
        startISO: slotStart.toISOString(),
        endISO: slotEndTime.toISOString(),
        location: cache.defaultLocation,
        available: !conflictCheck.hasConflict,
        conflictingEvent: conflictCheck.conflictingEvent,
        duration: duration,
      }

      slots.push(slot)
    }

    // Move to previous slot (earlier end time)
    slotEndTime = subMinutes(slotEndTime, cache.slotInterval)
  }

  return slots
}
