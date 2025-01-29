import { paymentMethod } from '@/data/paymentMethods'
import { OnSiteRequestSchema } from './schema'

import { z } from 'zod'

/**
 * Used to represent a period of time in a day that
 * is available for a meeting (procided it's not booked).
 */
export type AvailabilitySlot = {
  /** Starting hour and minute (in the owner’s timezone) */
  start: { hour: number; minute?: number }
  /** Ending hour and minute (in the owner’s timezone) */
  end: { hour: number; minute?: number }
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
  location?: string
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

/**
 * Represents an interval of time between start and end
 * with an optional location.
 */
export type DateTimeIntervalAndLocation = DateTimeInterval & {
  location?: string
}

/**
 * Represents an interval of time between start and end
 * with a timezone.
 */
export type DateTimeIntervalWithTimezone = DateTimeInterval & {
  /** An IANA timezone string */
  timeZone: string
}

/**
 * Represents a meeting request that is sent to the owner.
 */
export type AppointmentProps = {
  /** Starting time string (in ISO format) */
  start: string
  /** Ending time string (in ISO format) */
  end: string
  /** Meeting title */
  summary: string
  /** Email address of the requester. */
  email: string
  /** Phone number of the requester. */
  phone: string
  /** Location of the appointment. */
  location: string
  /** Timezone of the requester. */
  timeZone: string
  /** A unique ID for generating Google Meet details */
  requestId: string
  /** First name of the requester */
  firstName: string
  /** Last name of the requester */
  lastName: string
  /** Duration of the appointment in minutes  */
  duration: string
  /** Strings to identify this event via calendar queries */
  eventBaseString: string
  eventMemberString?: string
  eventContainerString?: string
}

export type EmailProps = {
  dateSummary: string
  email: string
  firstName: string
  lastName: string
  location: string
  approveUrl: string
  timeZone: string
  price?: string
  phone: string
  duration: string
}

export type ChairAppointmentBlockProps = {
  eventContainerString: string
  allowedDurations: number[]
  eventName: string
  sessionDuration?: string
  pricing?: { [key: number]: number }
  paymentOptions: string
  leadTime: number
}

export type ChairAppointmentBlockCalendarProps = ChairAppointmentBlockProps & AppointmentProps

export type ReviewType = {
  rating: 1 | 2 | 3 | 4 | 5
  date: string
  comment: string | null
  name: string
  source: string
  type?: string
  helpful?: number
}

export type PaymentMethodType = (typeof paymentMethod)[number]['value'] | null

export type AttendeeType = {
  email: string
  organizer: boolean
  self: boolean
  responseStatus: string
}

export type GoogleCalendarV3Event = {
  // Define the properties of the event according to Google Calendar API V3
  id: string
  /* The calendar appointment name */
  summary: string
  /* The calendar appointment text */
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  location?: string
  attendees?: AttendeeType[]
}

export type AllowedDurationsType = number[]

export type OnSiteRequestType = z.infer<typeof OnSiteRequestSchema>

export type PricingType = { [key: number]: number }

export type DiscountType = {
  type: 'percent' | 'dollar'
  amount: string | number
}

export type SlugConfigurationType = {
  bookingSlug: string | null // this must be unique and cannot conflict with current app pages
  title?: string
  text?: string
  location?: string
  editLocation?: boolean
  eventContainer?: string
  price?: PricingType
  discount?: DiscountType
  leadTimeMinimum?: number // in minutes
  instantConfirm?: boolean
  acceptingPayment?: boolean
  allowedDurations?: AllowedDurationsType
}

export type SearchParamsType = { [key: string]: string | string[] | undefined }
