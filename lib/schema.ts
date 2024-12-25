import { paymentMethod } from "@/data/paymentMethods"
import { z } from "zod"

const paymentMethodValues = paymentMethod.map((method) => method.value) as [
  string,
  ...string[]
]

export const AppointmentRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  start: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Start must be a valid date.",
  }),
  end: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "End must be a valid date.",
  }),
  timeZone: z.string(),
  location: z.string(),
  duration: z
    .string()
    .refine((value) => !Number.isNaN(Number.parseInt(value)), {
      message: "Duration must be a valid integer.",
    }),
  price: z.string().refine((value) => !Number.isNaN(Number.parseInt(value)), {
    message: "Price must be a valid integer.",
  }),
  phone: z.string(),
  paymentMethod: z.enum(paymentMethodValues).optional(),
  eventBaseString: z.string(),
  eventMemberString: z.string().optional(),
  eventContainerString: z.string().optional(),
})

export const OnSiteRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  start: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Start must be a valid date.",
  }),
  end: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "End must be a valid date.",
  }),
  timeZone: z.string(),
  location: z.string(),
  duration: z
    .string()
    .refine((value) => !Number.isNaN(Number.parseInt(value)), {
      message: "Duration must be a valid integer.",
    }),
  price: z.string().refine((value) => !Number.isNaN(Number.parseInt(value)), {
    message: "Price must be a valid integer.",
  }),
  phone: z.string(),
  paymentMethod: z.enum(paymentMethodValues),
  eventBaseString: z.string(),
  eventMemberString: z.string().optional(),
  eventContainerString: z.string(),
  allowedDurations: z.array(z.number()),
  eventName: z.string(),
  sessionDuration: z.string().optional(),
  pricing: z.record(z.number()).optional(),
  paymentOptions: z.string(),
  leadTime: z.number(),
});