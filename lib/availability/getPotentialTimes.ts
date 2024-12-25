import { addMinutes, eachDayOfInterval, set } from "date-fns"

import type Day from "../day"
import type {
  AvailabilitySlotsMap,
  DateTimeInterval,
  DateTimeIntervalAndLocation,
} from "../types"
import mergeOverlappingIntervals from "./mergeOverlappingIntervals"
import { DEFAULT_APPOINTMENT_INTERVAL } from "../../config"

export default function getPotentialTimes({
  start,
  end,
  duration,
  availabilitySlots,
  defaultAppointmentInterval = DEFAULT_APPOINTMENT_INTERVAL,
  containers,
}: {
  start: Day
  end: Day
  duration: number
  availabilitySlots: AvailabilitySlotsMap
  defaultAppointmentInterval?: number
  containers?: DateTimeIntervalAndLocation[]
}): DateTimeInterval[] {
  const intervals: DateTimeInterval[] = []

  if (start >= end || duration <= 0) {
    return intervals
  }

  const INTERVAL =
    duration < defaultAppointmentInterval
      ? duration
      : defaultAppointmentInterval

  // Sort the slots by start time
  const days = eachDayOfInterval({
    start: start.toInterval("Etc/GMT").start,
    end: end.toInterval("Etc/GMT").end,
  })

  if (containers) {
    containers.forEach((slot) => {
      const slotStart = new Date(slot.start)
      const slotEnd = new Date(slot.end)
      let currentIntervalStart = slotStart

      while (
        // while the beginning of the current interval is before the end of the slot
        currentIntervalStart < slotEnd &&
        // and adding the duration to the beginning of the current interval is before the end of the slot
        addMinutes(currentIntervalStart, duration) <= slotEnd
      ) {
        // add the duration to the beginning of the current interval to get the end of the current interval
        const currentIntervalEnd = addMinutes(currentIntervalStart, duration)

        // add the current interval to the list of intervals
        intervals.push({
          start: currentIntervalStart,
          end: currentIntervalEnd,
          ...(slot.location && { location: slot.location }),
        })

        // set the beginning of the next interval to the end of the current interval plus INTERVAL time
        currentIntervalStart = addMinutes(currentIntervalStart, INTERVAL)
      }
    })
  } else {
    days.forEach((day) => {
      const dayOfWeek = day.getDay()

      const slotsForDay = availabilitySlots[dayOfWeek] ?? []

      for (const slot of slotsForDay) {
        const slotStart = mapTimeObjectToDate(day, slot.start)
        const slotEnd = mapTimeObjectToDate(day, slot.end)

        let currentIntervalStart = slotStart

        while (
          // while the beginning of the current interval is before the end of the slot
          currentIntervalStart < slotEnd &&
          // and adding the duration to the beginning of the current interval is before the end of the slot
          addMinutes(currentIntervalStart, duration) <= slotEnd
        ) {
          // add the duration to the beginning of the current interval to get the end of the current interval
          const currentIntervalEnd = addMinutes(currentIntervalStart, duration)

          // add the current interval to the list of intervals
          intervals.push({
            start: currentIntervalStart,
            end: currentIntervalEnd,
          })

          // set the beginning of the next interval to the end of the current interval plus INTERVAL time
          currentIntervalStart = addMinutes(currentIntervalStart, INTERVAL)
        }
      }
    })
  }
  // return intervals even if they overlap
  return intervals
}

function mapTimeObjectToDate(
  day: Date,
  values: {
    year?: number
    month?: number
    date?: number
    hour?: number
    hours?: number
    minute?: number
    minutes?: number
    seconds?: number
    milliseconds?: number
  }
) {
  const { hour, minute, ...rest } = values
  return set(day, {
    ...rest,
    hours: hour ?? values.hours,
    minutes: minute ?? values.minutes,
  })
}
