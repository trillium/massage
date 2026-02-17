import { format, toZonedTime } from 'date-fns-tz'
import { addMinutes, set } from 'date-fns'
import { StringDateTimeInterval } from '@/lib/types'
import Day from '@/lib/day'

type SelectedBooking = { duration?: string }

export const generateTimeSlots = ({
  selectedDay,
  selectedBooking,
}: {
  selectedDay: Day | null
  selectedBooking: SelectedBooking | null
}): StringDateTimeInterval[] => {
  const slots: StringDateTimeInterval[] = []

  const timeZone = 'America/Los_Angeles'

  let baseDate: Date
  if (selectedDay) {
    const dateString = selectedDay.toString()
    baseDate = new Date(`${dateString}T00:00:00`)
  } else {
    baseDate = new Date()
  }

  const zonedBaseDate = toZonedTime(baseDate, timeZone)

  const durationMinutes =
    selectedBooking && selectedBooking.duration ? parseInt(selectedBooking.duration, 10) : 15

  for (let hour = 8; hour < 23; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const start = set(zonedBaseDate, {
        hours: hour,
        minutes: minute,
        seconds: 0,
        milliseconds: 0,
      })
      const startInTimeZone = format(start, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone })

      const end = addMinutes(start, durationMinutes)
      const endInTimeZone = format(end, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone })

      slots.push({
        start: startInTimeZone,
        end: endInTimeZone,
      })
    }
  }
  return slots
}
