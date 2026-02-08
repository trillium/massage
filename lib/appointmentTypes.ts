import { LocationObject } from './locationTypes'
import { SlugConfigurationType } from './configTypes'

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
  /** Location object with street, city, and zip, or a location string */
  location: LocationObject | string
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
  /** URL where this booking was made from */
  bookingUrl?: string
  /** Promotional offer applied to this booking */
  promo?: string
  /** Full slug configuration object */
  slugConfiguration?: SlugConfigurationType
  source?: string
}

export type EmailProps = {
  dateSummary: string
  email: string
  firstName: string
  lastName: string
  location: LocationObject | string
  approveUrl: string
  timeZone: string
  price?: string
  phone: string
  duration: string
  bookingUrl?: string
  promo?: string
  slugConfiguration?: SlugConfigurationType // Full slug configuration object
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
