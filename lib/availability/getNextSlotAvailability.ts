import {
  GoogleCalendarV3Event,
  StringDateTimeIntervalAndLocation,
  LocationObject,
} from '@/lib/types'
import { addMinutes, isBefore, isAfter, parseISO } from 'date-fns'
import { fetchAllCalendarEvents } from '@/lib/fetch/fetchContainersByQuery'

export interface NextSlotOptions {
  /** The event after which to find availability */
  currentEvent: GoogleCalendarV3Event
  /** Duration of the appointment in minutes (default: 60) */
  appointmentDuration?: number
  /** Interval between available slots in minutes (default: 15) */
  slotInterval?: number
  /** Maximum minutes ahead to look for availability (default: 30) */
  maxMinutesAhead?: number
}

export interface MultiDurationOptions {
  /** The event after which to find availability */
  currentEvent: GoogleCalendarV3Event
  /** Array of duration options in minutes */
  durationOptions?: number[]
  /** Interval between available slots in minutes (default: 15) */
  slotInterval?: number
  /** Maximum minutes ahead to look for availability (default: 30) */
  maxMinutesAhead?: number
}

export interface AvailabilitySlot {
  start: Date
  end: Date
  startISO: string
  endISO: string
  location?: LocationObject
  available: boolean
  conflictingEvent?: GoogleCalendarV3Event
  duration: number // Duration in minutes
}

export interface AvailabilityCache {
  /** The original event */
  currentEvent: GoogleCalendarV3Event
  /** All existing events fetched from calendar */
  existingEvents: GoogleCalendarV3Event[]
  /** Event end time as Date object */
  eventEndTime: Date
  /** Maximum search time as Date object */
  maxSearchTime: Date
  /** Event location object */
  eventLocation: LocationObject
  /** Slot interval in minutes */
  slotInterval: number
  /** When this cache was created */
  cachedAt: Date
  /** Available slots by duration */
  slotsByDuration: Map<number, AvailabilitySlot[]>
}

export interface MultiDurationAvailability {
  /** Cached data to avoid repeated API calls */
  cache: AvailabilityCache
  /** Get slots for a specific duration */
  getSlotsForDuration: (duration: number) => AvailabilitySlot[]
  /** Get available slots for a specific duration */
  getAvailableSlotsForDuration: (duration: number) => AvailabilitySlot[]
  /** Get slots in TimeList format for a specific duration */
  getTimeListFormatForDuration: (duration: number) => StringDateTimeIntervalAndLocation[]
  /** Get all available durations (durations that have at least one available slot) */
  getAvailableDurations: () => number[]
  /** Check if cache is still valid (within 5 minutes) */
  isCacheValid: () => boolean
}

/**
 * Creates a location object from a string
 */
function createLocationObject(locationString?: string): LocationObject {
  if (!locationString) {
    return { street: 'TBD', city: 'Los Angeles', zip: '90210' }
  }

  return {
    street: locationString.split(',')[0]?.trim() || locationString,
    city: locationString.split(',')[1]?.trim() || 'Los Angeles',
    zip: '90210', // Could be enhanced to parse from location string
  }
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
 * Gets available time slots starting from the end of the current event
 * up to maxMinutesAhead, checking for conflicts with existing calendar events
 */
export async function getNextSlotAvailability(
  options: NextSlotOptions
): Promise<AvailabilitySlot[]> {
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
  const eventLocation = createLocationObject(currentEvent.location)

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

  const availabilitySlots: AvailabilitySlot[] = []
  let slotTime = new Date(eventEndTime)

  // Generate slots from event end time up to maxMinutesAhead
  while (isBefore(slotTime, maxSearchTime) || slotTime.getTime() === maxSearchTime.getTime()) {
    const slotEnd = addMinutes(slotTime, appointmentDuration)

    // Check for conflicts with existing events
    const conflictCheck = hasConflict(slotTime, slotEnd, existingEvents)

    const slot: AvailabilitySlot = {
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
export async function getAvailableNextSlots(options: NextSlotOptions): Promise<AvailabilitySlot[]> {
  const allSlots = await getNextSlotAvailability(options)
  return allSlots.filter((slot) => slot.available)
}

/**
 * Converts availability slots to the format expected by TimeList component
 */
export function convertToTimeListFormat(
  slots: AvailabilitySlot[]
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
  const eventLocation = createLocationObject(currentEvent.location)

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

  // Return the multi-duration availability object
  return {
    cache,
    getSlotsForDuration: (duration: number) => {
      let slots = cache.slotsByDuration.get(duration)
      if (!slots) {
        // Calculate on demand if not pre-calculated
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
function calculateSlotsForDuration(cache: AvailabilityCache, duration: number): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = []
  let slotTime = new Date(cache.eventEndTime)

  while (
    isBefore(slotTime, cache.maxSearchTime) ||
    slotTime.getTime() === cache.maxSearchTime.getTime()
  ) {
    const slotEnd = addMinutes(slotTime, duration)

    // Check for conflicts with existing events
    const conflictCheck = hasConflict(slotTime, slotEnd, cache.existingEvents)

    const slot: AvailabilitySlot = {
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
