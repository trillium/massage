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
 * - null: Default/fallback configuration
 */
export type SlugType =
  | 'area-wide'
  | 'fixed-location'
  | 'scheduled-site'
  | 'next'
  | 'previous'
  | 'next-previous'
  | null

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
  locationWarning?: LocationWarningType
  eventContainer: string | null
  blockingScope?: 'event' | 'general' // 'event' blocks only this event type, 'general' blocks all availability
  promoEndDate?: string | null // Format: YYYY-MM-DD
  pricing: PricingType | null
  discount: DiscountType | null
  leadTimeMinimum: number | null // in minutes
  instantConfirm?: boolean
  acceptingPayment?: boolean
  allowedDurations: AllowedDurationsType | null
  customFields?: CustomFieldsType
  nextEventFound?: boolean
  currentEvent?: GoogleCalendarV3Event
  targetDate?: string
}
