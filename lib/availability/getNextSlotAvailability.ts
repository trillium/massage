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
import { addMinutes, isBefore, isAfter, parseISO } from 'date-fns'
import { fetchAllCalendarEvents } from '@/lib/fetch/fetchContainersByQuery'
import { stringToLocationObject } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import {
  hasConflict,
  convertToTimeListFormat as sharedConvertToTimeListFormat,
  createMultiDurationAvailabilityObject,
} from './availabilityHelpers'

export interface NextSlotOptions extends SlotSearchOptions {
  maxMinutesAhead?: number
}

export interface MultiDurationOptions extends MultiDurationSearchOptions {
  maxMinutesAhead?: number
}

export interface AvailabilityCache extends AvailabilityCacheBase {
  eventEndTime: Date
  maxSearchTime: Date
  eventLocation: LocationObject
}

/**
 * Creates a location object from a string
 */
function parseEventLocation(locationString?: string): LocationObject {
  if (!locationString) return { street: '', city: '', zip: '' }
  return stringToLocationObject(locationString)
}

/**
 * Gets available time slots starting from the end of the current event
 * up to maxMinutesAhead, checking for conflicts with existing calendar events
 */
export async function getNextSlotAvailability(
  options: NextSlotOptions
): Promise<CalendarAvailabilitySlot[]> {
  const {
    currentEvent,
    appointmentDuration = 60,
    slotInterval = 15,
    maxMinutesAhead = 30,
  } = options

  // Validate current event has end time
  if (!currentEvent.end?.dateTime) {
    throw new Error('Current event must have an end dateTime')
  }

  const eventEndTime = parseISO(currentEvent.end.dateTime)
  const maxSearchTime = addMinutes(eventEndTime, maxMinutesAhead)
  const eventLocation = parseEventLocation(currentEvent.location)

  // Fetch all existing events to check for conflicts
  // Limit to 24 hours from event end time for performance optimization
  const searchEndTime = addMinutes(eventEndTime, 24 * 60) // 24 hours from event end
  const allEventsData = await fetchAllCalendarEvents({
    searchParams: {
      startDate: eventEndTime.toISOString(),
      endDate: searchEndTime.toISOString(),
    },
  })
  const existingEvents = allEventsData.allEvents || []

  const availabilitySlots: CalendarAvailabilitySlot[] = []
  let slotTime = new Date(eventEndTime)

  // Generate slots from event end time up to maxMinutesAhead
  while (isBefore(slotTime, maxSearchTime) || slotTime.getTime() === maxSearchTime.getTime()) {
    const slotEnd = addMinutes(slotTime, appointmentDuration)

    // Check for conflicts with existing events
    const conflictCheck = hasConflict(slotTime, slotEnd, existingEvents)

    const slot: CalendarAvailabilitySlot = {
      start: new Date(slotTime),
      end: new Date(slotEnd),
      startISO: slotTime.toISOString(),
      endISO: slotEnd.toISOString(),
      location: eventLocation,
      available: !conflictCheck.hasConflict,
      conflictingEvent: conflictCheck.conflictingEvent,
      duration: appointmentDuration,
    }

    availabilitySlots.push(slot)

    // Move to next slot
    slotTime = addMinutes(slotTime, slotInterval)
  }

  return availabilitySlots
}

/**
 * Gets only the available (non-conflicting) slots
 */
export async function getAvailableNextSlots(
  options: NextSlotOptions
): Promise<CalendarAvailabilitySlot[]> {
  const allSlots = await getNextSlotAvailability(options)
  return allSlots.filter((slot) => slot.available)
}

export const convertToTimeListFormat = sharedConvertToTimeListFormat

/**
 * Creates a comprehensive availability object that can handle multiple durations
 * without requiring repeated API calls to the calendar
 */
export async function createMultiDurationAvailability(
  options: MultiDurationOptions
): Promise<MultiDurationAvailability> {
  const {
    currentEvent,
    durationOptions = [30, 60, 90, 120], // Default duration options
    slotInterval = 15,
    maxMinutesAhead = 30,
  } = options

  // Validate current event has end time
  if (!currentEvent.end?.dateTime) {
    throw new Error('Current event must have an end dateTime')
  }

  const eventEndTime = parseISO(currentEvent.end.dateTime)
  const maxSearchTime = addMinutes(eventEndTime, maxMinutesAhead)
  const eventLocation = parseEventLocation(currentEvent.location)

  // Fetch all existing events once
  /**
   * Limit this call to 24 hours in the future from the current event end time
   * This optimization reduces API payload size and improves performance
   */
  const searchEndTime = addMinutes(eventEndTime, 24 * 60) // 24 hours from event end
  const allEventsData = await fetchAllCalendarEvents({
    searchParams: {
      startDate: eventEndTime.toISOString(),
      endDate: searchEndTime.toISOString(),
    },
  })
  const existingEvents = allEventsData.allEvents || []

  // Create the cache object
  const cache: AvailabilityCache = {
    currentEvent,
    existingEvents,
    eventEndTime,
    maxSearchTime,
    eventLocation,
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
  cache: AvailabilityCache,
  duration: number
): CalendarAvailabilitySlot[] {
  const slots: CalendarAvailabilitySlot[] = []
  let slotTime = new Date(cache.eventEndTime)

  while (
    isBefore(slotTime, cache.maxSearchTime) ||
    slotTime.getTime() === cache.maxSearchTime.getTime()
  ) {
    const slotEnd = addMinutes(slotTime, duration)

    // Check for conflicts with existing events
    const conflictCheck = hasConflict(slotTime, slotEnd, cache.existingEvents)

    const slot: CalendarAvailabilitySlot = {
      start: new Date(slotTime),
      end: new Date(slotEnd),
      startISO: slotTime.toISOString(),
      endISO: slotEnd.toISOString(),
      location: cache.eventLocation,
      available: !conflictCheck.hasConflict,
      conflictingEvent: conflictCheck.conflictingEvent,
      duration: duration,
    }

    slots.push(slot)

    // Move to next slot
    slotTime = addMinutes(slotTime, cache.slotInterval)
  }

  return slots
}
