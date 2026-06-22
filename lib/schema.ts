import { paymentMethod } from '@/data/paymentMethods'
import { z } from 'zod'
import { siteConfig } from '@/lib/siteConfig'

const paymentMethodValues = paymentMethod.map((method) => method.value) as [string, ...string[]]

const hasAtLeastOneContact = (data: { phoneNumber?: string; telegramHandle?: string }) =>
  Boolean(data.phoneNumber?.trim()) || Boolean(data.telegramHandle?.trim())

export const AT_LEAST_ONE_CONTACT_MESSAGE = 'Provide at least a phone number or Telegram handle'

export const LocationSchema = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string().regex(/^(\d{5}(-\d{4})?)?$/, { message: 'Invalid US zip code.' }),
})

const sharedBookingOptionalFields = {
  eventMemberString: z.string().optional(),
  eventContainerString: z.string().optional(),
  hotelRoomNumber: z.string().optional(),
  parkingInstructions: z.string().optional(),
  additionalNotes: z.string().optional(),
  bookingUrl: z.string().optional(),
  promo: z.string().optional(),
  edgeMemberType: z.enum(['attendee', 'volunteer', 'team']).optional(),
  requestSooner: z.boolean().optional(),
}

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
    duration: z.string().refine((value) => !Number.isNaN(Number.parseInt(value, 10)), {
      message: 'Duration must be a valid integer.',
    }),
    price: z
      .string()
      .refine((value) => !Number.isNaN(Number.parseInt(value, 10)), {
        message: 'Price must be a valid integer.',
      })
      .optional(),
    phoneNumber: z.string().optional(),
    telegramHandle: z.string().optional(),
    eventBaseString: z.string(),
    ...sharedBookingOptionalFields,
    instantConfirm: z.boolean().optional(),
    slugConfiguration: z.any().optional(),
    rescheduleEventId: z.string().optional(),
    rescheduleToken: z.string().optional(),
    sessionId: z.string().uuid().optional(),
  })
  .strict()
  .refine((data) => data.locationObject !== undefined || data.locationString !== undefined, {
    message: 'Either locationObject or locationString must be provided.',
  })
  .refine(hasAtLeastOneContact, {
    message: AT_LEAST_ONE_CONTACT_MESSAGE,
    path: ['phoneNumber'],
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

export const ContactFormSchema = z
  .object({
    subject: z.string().min(1, 'Subject is required'),
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email format'),
    phoneNumber: z.string().optional(),
    telegramHandle: z.string().optional(),
    message: z.string().min(1, 'Message is required'),
  })
  .refine(hasAtLeastOneContact, {
    message: AT_LEAST_ONE_CONTACT_MESSAGE,
    path: ['phoneNumber'],
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
    phoneNumber: z.string().optional(),
    telegramHandle: z.string().optional(),
    eventBaseString: z.string(),
    ...sharedBookingOptionalFields,
    price: z.string().optional(),
    paymentMethod: z.string().optional(),
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
  .refine(hasAtLeastOneContact, {
    message: AT_LEAST_ONE_CONTACT_MESSAGE,
    path: ['phoneNumber'],
  })

export type OnSiteRequestType = z.infer<typeof OnSiteRequestSchema>

const RaffleInterestedInEnum = z.enum(['in_home', 'in_office'])

export const RAFFLE_INTEREST_OPTIONS = siteConfig.serviceLocationOptions

export const RAFFLE_INTEREST_LABELS: Record<string, string> = Object.fromEntries(
  RAFFLE_INTEREST_OPTIONS.map(({ value, label }) => [value, label])
)

export const RaffleEntrySchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email format'),
    phoneNumber: z.string().optional(),
    telegramHandle: z.string().optional(),
    is_local: z.boolean().optional().default(false),
    zip_code: z.string().nullable().optional(),
    interested_in: z.array(RaffleInterestedInEnum),
  })
  .refine(hasAtLeastOneContact, {
    message: AT_LEAST_ONE_CONTACT_MESSAGE,
    path: ['phoneNumber'],
  })

export const CreateReviewSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  text: z.string(),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Start must be a valid date.',
  }),
  rating: z.union([z.number(), z.string()]).refine(
    (value) => {
      const parsedValue = typeof value === 'string' ? Number.parseInt(value, 10) : value
      return !Number.isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 5
    },
    {
      message: 'Rating must be a valid integer 1 - 5.',
    }
  ),
  price: z
    .string()
    .refine((value) => !Number.isNaN(Number.parseInt(value, 10)), {
      message: 'Rating must be a valid integer 1 - 5.',
    })
    .optional(),
  source: z.string(),
  type: z.string(),
  dateSummary: z.string().optional(),
})
