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
import {
  hasConflict,
  SEARCH_WINDOW_MINUTES,
  convertToTimeListFormat as sharedConvertToTimeListFormat,
  createMultiDurationAvailabilityObject,
} from './availabilityHelpers'

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

function createDefaultLocation(): LocationObject {
  return { street: '', city: '', zip: '' }
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

  const searchStartTime = subMinutes(eventStartTime, SEARCH_WINDOW_MINUTES)
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

export const convertToTimeListFormat = sharedConvertToTimeListFormat

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

  const searchStartTime = subMinutes(eventStartTime, SEARCH_WINDOW_MINUTES)
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

  return createMultiDurationAvailabilityObject(cache, calculateSlotsForDuration)
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
