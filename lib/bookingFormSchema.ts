import { z } from 'zod'
import { createLocationSchema } from 'components/booking/fields/validations/locationValidation'
import { paymentMethod } from '@/data/paymentMethods'

const paymentMethodValues = paymentMethod.map((method) => method.value) as [string, ...string[]]

export const createBookingFormSchema = (config?: {
  cities?: string[]
  zipCodes?: string[]
  allowTelegramContact?: boolean
}) => {
  const allowTelegram = config?.allowTelegramContact === true
  const phoneSchema = allowTelegram
    ? z
        .string()
        .optional()
        .refine(
          (value) => value === undefined || value === '' || /^[+]?[(]?[\d\s\-()]{10,}$/.test(value),
          'Please enter a valid phone number'
        )
    : z
        .string()
        .min(1, 'Phone number is required')
        .regex(/^[+]?[(]?[\d\s\-()]{10,}$/, 'Please enter a valid phone number')

  const base = z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    phone: phoneSchema,
    telegramHandle: z.string().optional(),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    location: createLocationSchema(config),
    paymentMethod: z.enum(paymentMethodValues),
    hotelRoomNumber: z.string().optional(),
    parkingInstructions: z.string().optional(),
    additionalNotes: z.string().optional(),
    start: z.string(),
    end: z.string(),
    duration: z.number(),
    price: z.union([z.string(), z.number()]).optional(),
    timeZone: z.string(),
    eventBaseString: z.string(),
    eventMemberString: z.string().optional(),
    bookingUrl: z.string().optional(),
    promo: z.string().optional(),
    instantConfirm: z.boolean().optional(),
    rescheduleEventId: z.string().optional(),
    rescheduleToken: z.string().optional(),
    raffleOptIn: z.boolean().optional(),
    raffleZipCode: z.string().optional(),
    raffleInterestedIn: z.array(z.string()).optional(),
    edgeMemberType: z.enum(['attendee', 'volunteer', 'team']).optional(),
    requestSooner: z.boolean().optional(),
  })

  if (!allowTelegram) return base

  return base.refine(
    (data) => (data.phone?.trim() ?? '') !== '' || (data.telegramHandle?.trim() ?? '') !== '',
    {
      message: 'Either phone or telegram handle must be provided.',
      path: ['phone'],
    }
  )
}

export type BookingFormValues = z.infer<ReturnType<typeof createBookingFormSchema>>
