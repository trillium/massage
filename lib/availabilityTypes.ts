import { LocationObject } from './locationTypes'
import { GoogleCalendarV3Event } from './calendarTypes'

/**
 * Used to represent a period of time in a day that
 * is available for a meeting (provided it's not booked).
 */
export type AvailabilitySlot = {
  /** Starting hour and minute (in the owner's timezone) */
  start: { hour: number; minute?: number }
  /** Ending hour and minute (in the owner's timezone) */
  end: { hour: number; minute?: number }
}

export interface CalendarAvailabilitySlot {
  start: Date
  end: Date
  startISO: string
  endISO: string
  location?: LocationObject
  available: boolean
  conflictingEvent?: GoogleCalendarV3Event
  duration: number
}

/**
 * A map of day of week (0-6) to availability slots.
 */
export type AvailabilitySlotsMap = {
  /**  */
  [key: number]: AvailabilitySlot[]
}

/**
 * Contains a start Date and end Date in string format that
 * is suitable for serialization from server-side code to
 * client-side.
 */
export type StringInterval = {
  /** Starting time in ISO format */
  start: string
  /** Ending time in ISO format */
  end: string
}

/**
 * Represents an interval of time between start and end
 * with an optional location.
 */
export type StringIntervalAndLocation = StringInterval & {
  location?: LocationObject
}

/**
 * Represents an interval of time between start and end.
 */
export type DateTimeInterval = {
  /** Starting date */
  start: Date
  /** Ending date */
  end: Date
}

export type DateTimeAndTimeZone = {
  dateTime: string
  timeZone: string
}

export type GoogleCalendarDateTime = {
  dateTime?: string
  date?: string
  timeZone?: string
}

/**
 * Represents an interval of time between start and end.
 */
export type StringDateTimeInterval = {
  /** Starting date */
  start: string
  /** Ending date */
  end: string
}

/**
 * Represents an interval of time between start and end
 * with an optional location.
 */
export type DateTimeIntervalAndLocation = DateTimeInterval & {
  location?: LocationObject
}

export type StringDateTimeIntervalAndLocation = StringDateTimeInterval & {
  location?: LocationObject
  className?: string
}

/**
 * Represents an interval of time between start and end
 * with a timezone.
 */
export type DateTimeIntervalWithTimezone = DateTimeInterval & {
  /** An IANA timezone string */
  timeZone: string
}

export type IntervalType = {
  start: string
  end: string
}

export type Day = {
  year: number
  month: number
  day: number
}

export type DayWithStartEnd = Day & {
  start: string
  end: string
}

export interface SlotSearchOptions {
  currentEvent: GoogleCalendarV3Event
  appointmentDuration?: number
  slotInterval?: number
}

export interface MultiDurationSearchOptions {
  currentEvent: GoogleCalendarV3Event
  durationOptions?: number[]
  slotInterval?: number
}

export interface AvailabilityCacheBase {
  currentEvent: GoogleCalendarV3Event
  existingEvents: GoogleCalendarV3Event[]
  slotInterval: number
  cachedAt: Date
  slotsByDuration: Map<number, CalendarAvailabilitySlot[]>
}

export interface MultiDurationAvailability {
  cache: AvailabilityCacheBase
  getSlotsForDuration: (duration: number) => CalendarAvailabilitySlot[]
  getAvailableSlotsForDuration: (duration: number) => CalendarAvailabilitySlot[]
  getTimeListFormatForDuration: (duration: number) => StringDateTimeIntervalAndLocation[]
  getAvailableDurations: () => number[]
  isCacheValid: () => boolean
}
