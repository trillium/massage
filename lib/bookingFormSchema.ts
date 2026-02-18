import { z } from 'zod'
import { createLocationSchema } from 'components/booking/fields/validations/locationValidation'
import { paymentMethod } from '@/data/paymentMethods'

const paymentMethodValues = paymentMethod.map((method) => method.value) as [string, ...string[]]

// Zod schema for booking form validation
export const createBookingFormSchema = (config?: { cities?: string[]; zipCodes?: string[] }) => {
  return z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^[\+]?[(]?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),
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
  })
}

export type BookingFormValues = z.infer<ReturnType<typeof createBookingFormSchema>>
