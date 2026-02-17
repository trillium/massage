import {
  GoogleCalendarV3Event,
  StringDateTimeIntervalAndLocation,
  LocationObject,
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
