import { z } from "zod"

import {
  VALID_DURATIONS,
  DEFAULT_APPOINTMENT_INTERVAL,
  DEFAULT_DURATION,
  DEFAULT_PRICING,
} from "@/config"
import getBusyTimes from "@/lib/availability/getBusyTimes"
import {
  getDateRangeInterval,
  mapDatesToStrings,
} from "@/lib/availability/helpers"
import Day from "@/lib/day"

export async function fetchData({
  searchParams,
}: {
  searchParams: URLSearchParams
}) {
  const schema = z.object({
    duration: z
      .enum([
        ...(VALID_DURATIONS.map(String) as [string, ...string[]]),
        DEFAULT_APPOINTMENT_INTERVAL.toString(),
      ])
      .optional()
      .default(String(DEFAULT_DURATION))
      .transform(Number),
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
    console.error("Failed to parse searchParams:", error)
  }

  if (duration == undefined) {
    // if validation faisl 
    duration = DEFAULT_DURATION
  }

  // Offer two weeks of availability.
  const start = Day.todayWithOffset(0)
  const end = Day.todayWithOffset(14)

  const busy = await getBusyTimes(
    getDateRangeInterval({
      start,
      end,
      timeZone,
    })
  )

  return {
    props: {
      start: start.toString(),
      end: end.toString(),
      busy: mapDatesToStrings(busy),
      duration,
      ...(timeZone && { timeZone }),
      ...(selectedDate && { selectedDate }),
      price: DEFAULT_PRICING[DEFAULT_DURATION],
    },
  }
}
