import { z } from 'zod'

import {
  VALID_DURATIONS,
  DEFAULT_APPOINTMENT_INTERVAL,
  DEFAULT_DURATION,
  DEFAULT_PRICING,
} from 'config'
import { SearchParamsType } from '@/lib/types'

export function validateSearchParams({
  searchParams,
  allowedDurations,
}: {
  searchParams: SearchParamsType
  allowedDurations?: number[]
}) {
  const durationsToValidate = allowedDurations || VALID_DURATIONS
  const defaultDuration = durationsToValidate.includes(DEFAULT_DURATION)
    ? DEFAULT_DURATION
    : durationsToValidate[Math.floor(durationsToValidate.length / 2)] || DEFAULT_DURATION

  const schema = z.object({
    duration: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return defaultDuration
        const num = Number(val)
        return durationsToValidate.includes(num) ? num : defaultDuration
      }),
    timeZone: z.string().optional(),
    selectedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u)
      .optional(),
  })

  let duration: number | undefined = undefined
  let timeZone: string | undefined = undefined
  let selectedDate: string | undefined = undefined

  try {
    const parsedParams = schema.parse(searchParams)
    try {
      duration = parsedParams.duration
    } catch {
      duration = undefined
    }

    try {
      timeZone = parsedParams.timeZone
    } catch {
      timeZone = undefined
    }

    try {
      selectedDate = parsedParams.selectedDate
    } catch {
      selectedDate = undefined
    }
  } catch (error) {
    console.error('Failed to parse searchParams:', error)
  }

  if (duration == undefined) {
    // if validation fails
    duration = defaultDuration
  }

  return {
    duration,
    ...(timeZone && { timeZone }),
    ...(selectedDate && { selectedDate }),
    price: DEFAULT_PRICING[defaultDuration] || DEFAULT_PRICING[DEFAULT_DURATION],
  }
}
