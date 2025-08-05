import { paymentMethod } from '@/data/paymentMethods'
import { OnSiteRequestSchema } from './schema'

import { z } from 'zod'

/**
 * Used to represent a period of time in a day that
 * is available for a meeting (provided it's not booked).
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
  /** Location object with street, city, and zip */
  location: LocationObject
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
  location: LocationObject
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
  instantConfirm?: boolean
  acceptingPayment?: boolean
  showHotelField?: boolean
  showParkingField?: boolean
  showNotesField?: boolean
}

export type ChairAppointmentBlockCalendarProps = ChairAppointmentBlockProps & AppointmentProps

export type ReviewType = {
  rating: 1 | 2 | 3 | 4 | 5
  date: string
  comment?: string
  name: string
  source: string
  type?: string
  helpful?: number
  spellcheck?: string
}

export type RatingType = 1 | 2 | 3 | 4 | 5 | undefined | ''
export type RatingTypeStrict = 1 | 2 | 3 | 4 | 5

export type RatingCount = {
  1: number
  2: number
  3: number
  4: number
  5: number
  sum: number
  average: number
  averageStr: string
  length: number
}

export type PaymentMethodType = (typeof paymentMethod)[number]['value'] | null

export type LocationObject = {
  street: string
  city: string
  zip: string
}

export type AttendeeType = {
  email: string
  organizer: boolean
  self: boolean
  responseStatus: string
}

export type GoogleCalendarFetchDataReturnType = {
  kind: string
  etag: string
  summary: string
  description: string
  updated: string
  timeZone: string
  accessRole: string
  defaultReminders: { method: string; minutes: number }[]
  items: GoogleCalendarV3Event[]
}

export type GoogleCalendarV3Event = {
  // Define the properties of the event according to Google Calendar API V3
  id: string
  /* The calendar appointment name */
  summary: string
  /* The calendar appointment text */
  description?: string
  start: DateTimeAndTimeZone
  end: DateTimeAndTimeZone
  location?: string
  attendees?: AttendeeType[]
  kind: string
  etag: string
  status: string
  htmlLink: string
  created: string
  updated: string
  creator: object
  organizer: object
  recurringEventId: string
  originalStartTime: object
  iCalUID: string
  sequence: number
  reminders: object
  eventType: string
}

export type AllowedDurationsType = number[]

export type OnSiteRequestType = z.infer<typeof OnSiteRequestSchema>

export type PricingType = { [key: number]: number }

export type DiscountType = {
  type: 'percent' | 'dollar'
  amountDollars?: number
  amountPercent?: number
}

/**
 * Defines the type of booking configuration for different slug behaviors:
 * - 'area-wide': General availability across a service area, not tied to specific locations or resources
 * - 'fixed-location': Bookings at a predetermined, fixed location (e.g., spa, clinic)
 * - 'scheduled-site': Bookings tied to specific containers/resources with their own schedules (e.g., specific therapists)
 * - null: Default/fallback configuration
 */
export type SlugType = 'area-wide' | 'fixed-location' | 'scheduled-site' | null

export type CustomFieldsType = {
  showHotelField?: boolean
  showParkingField?: boolean
  showNotesField?: boolean
}

export type SlugConfigurationType = {
  bookingSlug: string | string[] | null // this must be unique and cannot conflict with current app pages
  type: SlugType
  title: string | null
  text: string | null
  location: LocationObject | null
  locationIsReadOnly?: boolean
  eventContainer: string | null
  promoEndDate?: string | null // Format: YYYY-MM-DD
  pricing: PricingType | null
  discount: DiscountType | null
  leadTimeMinimum: number | null // in minutes
  instantConfirm?: boolean
  acceptingPayment?: boolean
  allowedDurations: AllowedDurationsType | null
  customFields?: CustomFieldsType
}

export type SearchParamsType = { [key: string]: string | string[] | undefined }

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

/**
 * Represents form data from the booking form
 */
export type BookingFormData = {
  /** firstName of the requester */
  firstName?: string
  /** lastName of the requester */
  lastName?: string
  /** Email address of the requester */
  email?: string
  /** Location object with street, city, and zip */
  location?: LocationObject
  /** Whether the location can be edited */
  locationIsReadOnly?: boolean
  /** Phone number of the requester */
  phone?: string
  /** Payment method of the requester */
  paymentMethod?: PaymentMethodType
  /** City of the requester */
  city?: string
  /** Zip code of the requester */
  zipCode?: string
  /** Hotel room number */
  hotelRoomNumber?: string
  /** Parking instructions */
  parkingInstructions?: string
  /** Additional notes */
  additionalNotes?: string
}
