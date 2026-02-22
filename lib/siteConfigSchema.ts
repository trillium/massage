import { z } from 'zod'

const WorkdaySchema = z.object({
  startHour: z.number().min(0).max(23),
  endHour: z.number().min(0).max(23),
})

const PaymentMethodSchema = z.object({
  name: z.string(),
  value: z.string(),
  hint: z.string(),
})

export const SiteConfigSchema = z.object({
  business: z.object({
    name: z.string(),
    ownerName: z.string(),
    occupation: z.string(),
    tagline: z.string(),
    description: z.string(),
  }),
  contact: z.object({
    email: z.string().email(),
    instagram: z.string().url().optional(),
  }),
  domain: z.object({
    siteUrl: z.string().url(),
    siteRepo: z.string().url(),
  }),
  location: z.object({
    city: z.string(),
    state: z.string(),
    display: z.string(),
    neighborhood: z.string(),
    serviceArea: z.string(),
    mapLatitude: z.number(),
    mapLongitude: z.number(),
  }),
  scheduling: z.object({
    timezone: z.string(),
    leadTimeMinutes: z.number(),
    appointmentIntervalMinutes: z.number(),
    slotPadding: z.number(),
    defaultDuration: z.number(),
    allowedDurations: z.array(z.number()),
    validDurations: z.array(z.number()),
    workdays: z.record(z.string(), WorkdaySchema),
  }),
  pricing: z.object({
    baseHourlyRate: z.number(),
  }),
  calendars: z.array(z.string()),
  payments: z.array(PaymentMethodSchema),
  branding: z.object({
    siteLogo: z.string(),
    socialBanner: z.string(),
    avatar: z.string(),
  }),
  locale: z.string(),
  language: z.string(),
  eventBaseString: z.string(),
})

export type SiteConfig = z.infer<typeof SiteConfigSchema>
