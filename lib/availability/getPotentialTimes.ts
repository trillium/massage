import { addMinutes, eachDayOfInterval, set } from 'date-fns'

import { dayToInterval } from '../dayAsObject'
import { DEFAULT_APPOINTMENT_INTERVAL } from '../../config'
import { formatDatetimeToString } from '../helpers'
import type {
  AvailabilitySlotsMap,
  DayWithStartEnd,
  GoogleCalendarV3Event,
  StringDateTimeInterval,
} from '../types'

export default function getPotentialTimes({
  start,
  end,
  duration,
  availabilitySlots,
  defaultAppointmentInterval = DEFAULT_APPOINTMENT_INTERVAL,
  containers,
}: {
  start: DayWithStartEnd
  end: DayWithStartEnd
  duration: number
  availabilitySlots: AvailabilitySlotsMap
  defaultAppointmentInterval?: number
  containers?: GoogleCalendarV3Event[]
}): StringDateTimeInterval[] {
  const intervals: StringDateTimeInterval[] = []

  // Convert Day objects to intervals for validation
  const startInterval = dayToInterval(start, 'Etc/GMT')
  const endInterval = dayToInterval(end, 'Etc/GMT')

  if (startInterval.start >= endInterval.end || duration <= 0) {
    return intervals
  }

  const INTERVAL = duration < defaultAppointmentInterval ? duration : defaultAppointmentInterval

  const startOfInterval = startInterval.start
  const endOfInterval = endInterval.end

  // Sort the slots by start time
  const days = eachDayOfInterval({
    start: startOfInterval,
    end: endOfInterval,
  })

  // TODO - refactor this if/else block, lot of repeated code
  if (containers) {
    containers.forEach((slot) => {
      // Handle both dateTime and date formats from Google Calendar
      if (!slot.start.dateTime || !slot.end.dateTime) {
        // Skip all-day events or events without dateTime
        return
      }

      const slotStart = new Date(slot.start.dateTime)
      const slotEnd = new Date(slot.end.dateTime)

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
          start: formatDatetimeToString(currentIntervalStart),
          end: formatDatetimeToString(currentIntervalEnd),
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
            start: formatDatetimeToString(currentIntervalStart),
            end: formatDatetimeToString(currentIntervalEnd),
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
