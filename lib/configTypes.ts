import { LocationObject, LocationWarningType } from './locationTypes'
import { GoogleCalendarV3Event } from './calendarTypes'
import { OnSiteRequestSchema } from './schema'
import { AppointmentRequestSchema, BookedDataSchema } from './schema'
import { z } from 'zod'

export type AllowedDurationsType = number[]

export type OnSiteRequestType = z.infer<typeof OnSiteRequestSchema>

export type AppointmentRequestType = z.infer<typeof AppointmentRequestSchema>

export type BookedDataType = z.infer<typeof BookedDataSchema>

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
 * - 'next': Bookings immediately after a specific event
 * - 'adjacent': Bookings before or after a specific event with a buffer
 * - 'previous': Bookings immediately before a specific event
 * - 'next-previous': Bookings immediately before or after a specific event
 * - null: Default/fallback configuration
 */
export type SlugType =
  | 'area-wide'
  | 'fixed-location'
  | 'scheduled-site'
  | 'next'
  | 'adjacent'
  | 'previous'
  | 'next-previous'
  | null

export type CustomFieldsType = {
  showHotelField?: boolean
  showParkingField?: boolean
  showNotesField?: boolean
  showRaffleOptIn?: boolean
  showPromoField?: boolean
  showRoleField?: boolean
  forceRole?: 'attendee' | 'volunteer' | 'team'
  roleHints?: {
    attendee?: string | Record<number, string>
    volunteer?: string | Record<number, string>
    team?: string | Record<number, string>
  }
  roleBonus?: { attendee?: number; volunteer?: number; team?: number }
  showRequestSoonerField?: boolean
  locationFromContainer?: boolean
}

export type SlugConfigurationType = {
  bookingSlug: string | string[] | null // this must be unique and cannot conflict with current app pages
  type: SlugType
  title: string | null
  text: string | string[] | null
  location: LocationObject | null
  locationIsReadOnly?: boolean
  locationWarning?: LocationWarningType
  eventContainer: string | null
  blockingScope?: 'event' | 'general' // 'event' blocks only this event type, 'general' blocks all availability
  promoEndDate?: string | null // Format: YYYY-MM-DD
  pricing: PricingType | null
  pricingLabels?: { [key: number]: string }
  durationBonus?: number
  discount: DiscountType | null
  leadTimeMinimum: number | null // in minutes
  calendarWeeks?: number
  availabilityWindowMinutes?: number
  nextSlotOnly?: boolean
  showNextSlotCard?: boolean
  hideCalendar?: boolean
  hideLocation?: boolean
  heroImage?: { src: string; alt: string }
  instantConfirm?: boolean
  allowConcurrentBookings?: boolean
  acceptingPayment?: boolean
  defaultDuration?: number
  allowedDurations: AllowedDurationsType | null
  links?: { label: string; href: string }[]
  customFields?: CustomFieldsType
  ogDesign?: string
  nextEventFound?: boolean
  currentEvent?: GoogleCalendarV3Event
  targetDate?: string
  prefillFirstName?: string
  prefillLastName?: string
  prefillEmail?: string
  prefillPhone?: string
  prefillTelegram?: string
  rescheduleEventId?: string
  rescheduleToken?: string
}
