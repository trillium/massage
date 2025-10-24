import {
  GoogleCalendarV3Event,
  StringDateTimeIntervalAndLocation,
  LocationObject,
} from '@/lib/types'
import { addMinutes, subMinutes, isBefore, isAfter, parseISO } from 'date-fns'
import { fetchAllCalendarEvents } from '@/lib/fetch/fetchContainersByQuery'

export interface AdjacentSlotOptions {
  currentEvent: GoogleCalendarV3Event
  appointmentDuration?: number
  slotInterval?: number
  adjacencyBuffer?: number
}

export interface MultiDurationAdjacentOptions {
  currentEvent: GoogleCalendarV3Event
  durationOptions?: number[]
  slotInterval?: number
  adjacencyBuffer?: number
}

export interface AvailabilitySlot {
  start: Date
  end: Date
  startISO: string
  endISO: string
  location?: LocationObject
  available: boolean
  conflictingEvent?: GoogleCalendarV3Event
  duration: number
  type: 'before' | 'after'
}

export interface AvailabilityCache {
  currentEvent: GoogleCalendarV3Event
  existingEvents: GoogleCalendarV3Event[]
  eventStartTime: Date
  eventEndTime: Date
  eventLocation: LocationObject
  slotInterval: number
  adjacencyBuffer: number
  cachedAt: Date
  slotsByDuration: Map<number, AvailabilitySlot[]>
}

export interface MultiDurationAvailability {
  cache: AvailabilityCache
  getSlotsForDuration: (duration: number) => AvailabilitySlot[]
  getAvailableSlotsForDuration: (duration: number) => AvailabilitySlot[]
  getTimeListFormatForDuration: (duration: number) => StringDateTimeIntervalAndLocation[]
  getAvailableDurations: () => number[]
  isCacheValid: () => boolean
}

function createLocationObject(locationString?: string): LocationObject {
  if (!locationString) {
    return { street: 'TBD', city: 'Los Angeles', zip: '90210' }
  }

  return {
    street: locationString.split(',')[0]?.trim() || locationString,
    city: locationString.split(',')[1]?.trim() || 'Los Angeles',
    zip: '90210',
  }
}

function hasConflict(
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

export async function getAdjacentSlotAvailability(
  options: AdjacentSlotOptions
): Promise<AvailabilitySlot[]> {
  const {
    currentEvent,
    appointmentDuration = 60,
    slotInterval = 15,
    adjacencyBuffer = 30,
  } = options

  if (!currentEvent.start?.dateTime || !currentEvent.end?.dateTime) {
    throw new Error('Current event must have start and end dateTime')
  }

  const eventStartTime = parseISO(currentEvent.start.dateTime)
  const eventEndTime = parseISO(currentEvent.end.dateTime)
  const eventLocation = createLocationObject(currentEvent.location)

  const beforeSlotEndTime = subMinutes(eventStartTime, adjacencyBuffer)
  const afterSlotStartTime = addMinutes(eventEndTime, adjacencyBuffer)

  const searchStartTime = subMinutes(eventStartTime, 24 * 60)
  const searchEndTime = addMinutes(eventEndTime, 24 * 60)

  const allEventsData = await fetchAllCalendarEvents({
    searchParams: {
      startDate: searchStartTime.toISOString(),
      endDate: searchEndTime.toISOString(),
    },
  })
  const existingEvents = allEventsData.allEvents || []

  const availabilitySlots: AvailabilitySlot[] = []

  let beforeSlotTime = subMinutes(beforeSlotEndTime, appointmentDuration)
  while (isBefore(beforeSlotTime, beforeSlotEndTime)) {
    const slotEnd = addMinutes(beforeSlotTime, appointmentDuration)

    if (!isAfter(slotEnd, beforeSlotEndTime)) {
      const conflictCheck = hasConflict(beforeSlotTime, slotEnd, existingEvents)

      availabilitySlots.push({
        start: new Date(beforeSlotTime),
        end: new Date(slotEnd),
        startISO: beforeSlotTime.toISOString(),
        endISO: slotEnd.toISOString(),
        location: eventLocation,
        available: !conflictCheck.hasConflict,
        conflictingEvent: conflictCheck.conflictingEvent,
        duration: appointmentDuration,
        type: 'before',
      })
    }

    beforeSlotTime = subMinutes(beforeSlotTime, slotInterval)
  }

  let afterSlotTime = new Date(afterSlotStartTime)
  const maxAfterTime = addMinutes(afterSlotStartTime, 24 * 60)
  while (isBefore(afterSlotTime, maxAfterTime)) {
    const slotEnd = addMinutes(afterSlotTime, appointmentDuration)

    const conflictCheck = hasConflict(afterSlotTime, slotEnd, existingEvents)

    availabilitySlots.push({
      start: new Date(afterSlotTime),
      end: new Date(slotEnd),
      startISO: afterSlotTime.toISOString(),
      endISO: slotEnd.toISOString(),
      location: eventLocation,
      available: !conflictCheck.hasConflict,
      conflictingEvent: conflictCheck.conflictingEvent,
      duration: appointmentDuration,
      type: 'after',
    })

    afterSlotTime = addMinutes(afterSlotTime, slotInterval)
  }

  return availabilitySlots
}

export async function getAvailableAdjacentSlots(
  options: AdjacentSlotOptions
): Promise<AvailabilitySlot[]> {
  const allSlots = await getAdjacentSlotAvailability(options)
  return allSlots.filter((slot) => slot.available)
}

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

export async function createMultiDurationAvailability(
  options: MultiDurationAdjacentOptions
): Promise<MultiDurationAvailability> {
  const {
    currentEvent,
    durationOptions = [30, 60, 90, 120],
    slotInterval = 15,
    adjacencyBuffer = 30,
  } = options

  if (!currentEvent.start?.dateTime || !currentEvent.end?.dateTime) {
    throw new Error('Current event must have start and end dateTime')
  }

  const eventStartTime = parseISO(currentEvent.start.dateTime)
  const eventEndTime = parseISO(currentEvent.end.dateTime)
  const eventLocation = createLocationObject(currentEvent.location)

  const searchStartTime = subMinutes(eventStartTime, 24 * 60)
  const searchEndTime = addMinutes(eventEndTime, 24 * 60)

  const allEventsData = await fetchAllCalendarEvents({
    searchParams: {
      startDate: searchStartTime.toISOString(),
      endDate: searchEndTime.toISOString(),
    },
  })
  const existingEvents = allEventsData.allEvents || []

  const cache: AvailabilityCache = {
    currentEvent,
    existingEvents,
    eventStartTime,
    eventEndTime,
    eventLocation,
    slotInterval,
    adjacencyBuffer,
    cachedAt: new Date(),
    slotsByDuration: new Map(),
  }

  for (const duration of durationOptions) {
    const slots = calculateSlotsForDuration(cache, duration)
    cache.slotsByDuration.set(duration, slots)
  }

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

function calculateSlotsForDuration(cache: AvailabilityCache, duration: number): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = []

  const beforeSlotEndTime = subMinutes(cache.eventStartTime, cache.adjacencyBuffer)
  const afterSlotStartTime = addMinutes(cache.eventEndTime, cache.adjacencyBuffer)

  let beforeSlotTime = subMinutes(beforeSlotEndTime, duration)
  while (isBefore(beforeSlotTime, beforeSlotEndTime)) {
    const slotEnd = addMinutes(beforeSlotTime, duration)

    if (!isAfter(slotEnd, beforeSlotEndTime)) {
      const conflictCheck = hasConflict(beforeSlotTime, slotEnd, cache.existingEvents)

      slots.push({
        start: new Date(beforeSlotTime),
        end: new Date(slotEnd),
        startISO: beforeSlotTime.toISOString(),
        endISO: slotEnd.toISOString(),
        location: cache.eventLocation,
        available: !conflictCheck.hasConflict,
        conflictingEvent: conflictCheck.conflictingEvent,
        duration: duration,
        type: 'before',
      })
    }

    beforeSlotTime = subMinutes(beforeSlotTime, cache.slotInterval)
  }

  let afterSlotTime = new Date(afterSlotStartTime)
  const maxAfterTime = addMinutes(afterSlotStartTime, 24 * 60)
  while (isBefore(afterSlotTime, maxAfterTime)) {
    const slotEnd = addMinutes(afterSlotTime, duration)

    const conflictCheck = hasConflict(afterSlotTime, slotEnd, cache.existingEvents)

    slots.push({
      start: new Date(afterSlotTime),
      end: new Date(slotEnd),
      startISO: afterSlotTime.toISOString(),
      endISO: slotEnd.toISOString(),
      location: cache.eventLocation,
      available: !conflictCheck.hasConflict,
      conflictingEvent: conflictCheck.conflictingEvent,
      duration: duration,
      type: 'after',
    })

    afterSlotTime = addMinutes(afterSlotTime, cache.slotInterval)
  }

  return slots
}
