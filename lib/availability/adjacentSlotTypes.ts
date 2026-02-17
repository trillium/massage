import {
  GoogleCalendarV3Event,
  StringDateTimeIntervalAndLocation,
  LocationObject,
  AvailabilityCacheBase,
  CalendarAvailabilitySlot,
  MultiDurationAvailability,
} from '@/lib/types'

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

export interface AvailabilitySlot extends CalendarAvailabilitySlot {
  type: 'before' | 'after'
}

export interface AvailabilityCache extends AvailabilityCacheBase {
  eventStartTime: Date
  eventEndTime: Date
  eventLocation: LocationObject
  adjacencyBuffer: number
}

export type { MultiDurationAvailability }
