import { paymentMethod } from '@/data/paymentMethods'
import { z } from 'zod'

const paymentMethodValues = paymentMethod.map((method) => method.value) as [string, ...string[]]

export const LocationSchema = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, { message: 'Invalid US zip code.' }),
})

const BaseRequestSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    start: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Start must be a valid date.',
    }),
    end: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'End must be a valid date.',
    }),
    timeZone: z.string(),
    locationObject: LocationSchema.optional(),
    locationString: z.string().optional(),
    duration: z.string().refine((value) => !Number.isNaN(Number.parseInt(value)), {
      message: 'Duration must be a valid integer.',
    }),
    price: z
      .string()
      .refine((value) => !Number.isNaN(Number.parseInt(value)), {
        message: 'Price must be a valid integer.',
      })
      .optional(),
    phone: z.string(),
    eventBaseString: z.string(),
    eventMemberString: z.string().optional(),
    eventContainerString: z.string().optional(),
    instantConfirm: z.boolean().optional(),
    hotelRoomNumber: z.string().optional(),
    parkingInstructions: z.string().optional(),
    additionalNotes: z.string().optional(),
    bookingUrl: z.string().optional(),
    promo: z.string().optional(),
  })
  .strict() // Disallow unknown keys
  .refine((data) => data.locationObject !== undefined || data.locationString !== undefined, {
    message: 'Either locationObject or locationString must be provided.',
  })

export const AppointmentRequestSchema = BaseRequestSchema.extend({
  paymentMethod: z.enum(paymentMethodValues).optional(),
})

export const OnSiteRequestSchema = BaseRequestSchema.extend({
  paymentMethod: z.enum(paymentMethodValues),
  eventContainerString: z.string(), // Make this field required
  allowedDurations: z.array(z.number()),
  eventName: z.string(),
  sessionDuration: z.string().optional(),
  pricing: z.record(z.string(), z.number()).optional(),
  paymentOptions: z.string(),
  leadTime: z.number(),
})

export const ContactFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required'),
  message: z.string().min(1, 'Message is required'),
})

export const AdminAccessRequestSchema = z.object({
  email: z.email('Invalid email address'),
  requestReason: z.string().min(10, 'Please provide a reason (minimum 10 characters)'),
})

// Schema for the booked data structure passed to admin booked page
const DateTimeAndTimeZoneSchema = z.object({
  dateTime: z.string(),
  timeZone: z.string(),
})

export const BookedDataSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    timeZone: z.string(),
    locationObject: LocationSchema.optional(),
    locationString: z.string().optional(),
    duration: z.string(),
    phone: z.string(),
    eventBaseString: z.string(),
    eventMemberString: z.string().optional(),
    eventContainerString: z.string().optional(),
    price: z.string().optional(),
    paymentMethod: z.string().optional(),
    hotelRoomNumber: z.string().optional(),
    parkingInstructions: z.string().optional(),
    additionalNotes: z.string().optional(),
    bookingUrl: z.string().optional(),
    promo: z.string().optional(),
    // Additional fields for booked data
    attendees: z.array(
      z.object({
        email: z.email(),
        name: z.string().optional(),
      })
    ),
    dateTime: z.string(),
    start: DateTimeAndTimeZoneSchema,
    end: DateTimeAndTimeZoneSchema,
  })
  .refine((data) => data.locationObject !== undefined || data.locationString !== undefined, {
    message: 'Either locationObject or locationString must be provided.',
  })

export type OnSiteRequestType = z.infer<typeof OnSiteRequestSchema>
