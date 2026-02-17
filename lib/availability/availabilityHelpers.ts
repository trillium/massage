import {
  GoogleCalendarV3Event,
  StringDateTimeIntervalAndLocation,
  CalendarAvailabilitySlot,
  AvailabilityCacheBase,
  MultiDurationAvailability,
} from '@/lib/types'
import { addMinutes, isBefore, isAfter, parseISO } from 'date-fns'

export const SEARCH_WINDOW_MINUTES = 24 * 60
export const CACHE_VALIDITY_MINUTES = 5

export function hasConflict(
  slotStart: Date,
  slotEnd: Date,
  existingEvents: GoogleCalendarV3Event[]
): { hasConflict: boolean; conflictingEvent?: GoogleCalendarV3Event } {
  for (const event of existingEvents) {
    if (!event.start?.dateTime || !event.end?.dateTime) continue

    const eventStart = parseISO(event.start.dateTime)
    const eventEnd = parseISO(event.end.dateTime)

    if (isBefore(slotStart, eventEnd) && isAfter(slotEnd, eventStart)) {
      return { hasConflict: true, conflictingEvent: event }
    }
  }

  return { hasConflict: false }
}

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

export function createMultiDurationAvailabilityObject<T extends AvailabilityCacheBase>(
  cache: T,
  calculateSlots: (cache: T, duration: number) => CalendarAvailabilitySlot[]
): MultiDurationAvailability {
  return {
    cache,
    getSlotsForDuration: (duration: number) => {
      let slots = cache.slotsByDuration.get(duration)
      if (!slots) {
        slots = calculateSlots(cache, duration)
        cache.slotsByDuration.set(duration, slots)
      }
      return slots
    },
    getAvailableSlotsForDuration: (duration: number) => {
      const allSlots = cache.slotsByDuration.get(duration) || calculateSlots(cache, duration)
      return allSlots.filter((slot) => slot.available)
    },
    getTimeListFormatForDuration: (duration: number) => {
      const availableSlots =
        cache.slotsByDuration.get(duration)?.filter((slot) => slot.available) ||
        calculateSlots(cache, duration).filter((slot) => slot.available)
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
      const fiveMinutesAgo = addMinutes(new Date(), -CACHE_VALIDITY_MINUTES)
      return isAfter(cache.cachedAt, fiveMinutesAgo)
    },
  }
}
