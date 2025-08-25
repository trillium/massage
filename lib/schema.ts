import { paymentMethod } from '@/data/paymentMethods'
import { z } from 'zod'

const paymentMethodValues = paymentMethod.map((method) => method.value) as [string, ...string[]]

const LocationSchema = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, { message: 'Invalid US zip code.' }),
})

const BaseRequestSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    start: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Start must be a valid date.',
    }),
    end: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'End must be a valid date.',
    }),
    timeZone: z.string(),
    location: LocationSchema,
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
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required'),
  message: z.string().min(1, 'Message is required'),
})

export const AdminAccessRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  requestReason: z.string().min(10, 'Please provide a reason (minimum 10 characters)'),
})

export type AppointmentRequestType = z.infer<typeof AppointmentRequestSchema>
export type OnSiteRequestType = z.infer<typeof OnSiteRequestSchema>
