import { LocationObject } from '@/lib/types'
import { addMinutes, subMinutes, isBefore, isAfter, parseISO } from 'date-fns'
import { fetchAllCalendarEvents } from '@/lib/fetch/fetchContainersByQuery'
import { stringToLocationObject } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import {
  hasConflict,
  SEARCH_WINDOW_MINUTES,
  createMultiDurationAvailabilityObject,
} from './availabilityHelpers'
import type {
  AdjacentSlotOptions,
  MultiDurationAdjacentOptions,
  AvailabilitySlot,
  AvailabilityCache,
  MultiDurationAvailability,
} from './adjacentSlotTypes'

export type {
  AdjacentSlotOptions,
  MultiDurationAdjacentOptions,
  AvailabilitySlot,
  AvailabilityCache,
  MultiDurationAvailability,
}

function parseEventLocation(locationString?: string): LocationObject {
  if (!locationString) return { street: '', city: '', zip: '' }
  return stringToLocationObject(locationString)
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
  const eventLocation = parseEventLocation(currentEvent.location)

  const beforeSlotEndTime = subMinutes(eventStartTime, adjacencyBuffer)
  const afterSlotStartTime = addMinutes(eventEndTime, adjacencyBuffer)

  const searchStartTime = subMinutes(eventStartTime, SEARCH_WINDOW_MINUTES)
  const searchEndTime = addMinutes(eventEndTime, SEARCH_WINDOW_MINUTES)

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
  const maxAfterTime = addMinutes(afterSlotStartTime, SEARCH_WINDOW_MINUTES)
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
  const eventLocation = parseEventLocation(currentEvent.location)

  const searchStartTime = subMinutes(eventStartTime, SEARCH_WINDOW_MINUTES)
  const searchEndTime = addMinutes(eventEndTime, SEARCH_WINDOW_MINUTES)

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

  return createMultiDurationAvailabilityObject(cache, calculateSlotsForDuration)
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
  const maxAfterTime = addMinutes(afterSlotStartTime, SEARCH_WINDOW_MINUTES)
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
