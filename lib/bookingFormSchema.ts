import { z } from 'zod'
import { createLocationSchema } from 'components/booking/fields/validations/locationValidation'
import { paymentMethod } from '@/data/paymentMethods'

const paymentMethodValues = paymentMethod.map((method) => method.value) as [string, ...string[]]

const phoneNumberRegex = /^[+]?[(]?[\d\s\-()]{10,}$/
const telegramHandleRegex = /^@?[a-zA-Z0-9_]{5,}$/

const hasAtLeastOneContact = (data: { phoneNumber?: string; telegramHandle?: string }) =>
  Boolean(data.phoneNumber?.trim()) || Boolean(data.telegramHandle?.trim())

export const AT_LEAST_ONE_CONTACT_MESSAGE = 'Provide at least a phone number or Telegram handle'

export const createBookingFormSchema = (config?: { cities?: string[]; zipCodes?: string[] }) => {
  return z
    .object({
      firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
      lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
      phoneNumber: z
        .string()
        .optional()
        .refine(
          (value) => value === undefined || value === '' || phoneNumberRegex.test(value),
          'Please enter a valid phone number'
        ),
      telegramHandle: z
        .string()
        .optional()
        .refine(
          (value) => value === undefined || value === '' || telegramHandleRegex.test(value),
          'Please enter a valid Telegram handle'
        ),
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
    .refine(hasAtLeastOneContact, {
      message: AT_LEAST_ONE_CONTACT_MESSAGE,
      path: ['phoneNumber'],
    })
}

export type BookingFormValues = z.infer<ReturnType<typeof createBookingFormSchema>>
