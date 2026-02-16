import { format, toZonedTime } from 'date-fns-tz'
import { addMinutes, set } from 'date-fns'
import { StringDateTimeInterval } from '@/lib/types'

type SelectedDay = { year: number; month: number; day: number }
type SelectedBooking = { duration?: string }

export const generateTimeSlots = ({
  selectedDay,
  selectedBooking,
}: {
  selectedDay: SelectedDay | null
  selectedBooking: SelectedBooking | null
}): StringDateTimeInterval[] => {
  const slots: StringDateTimeInterval[] = []

  // Set timezone to America/Los_Angeles
  const timeZone = 'America/Los_Angeles'

  // Create base date properly in LA timezone
  let baseDate: Date
  if (selectedDay && selectedDay.year && selectedDay.month && selectedDay.day) {
    // Create date directly in LA timezone using the year, month, day values
    // Note: Date constructor expects 0-based month, but selectedDay.month is 1-based
    const dateString = `${selectedDay.year}-${String(selectedDay.month).padStart(2, '0')}-${String(selectedDay.day).padStart(2, '0')}`
    baseDate = new Date(`${dateString}T00:00:00`)
  } else {
    baseDate = new Date() // fallback to today
  }

  const zonedBaseDate = toZonedTime(baseDate, timeZone)

  // Use selectedBooking.duration (string, in minutes) or default to 15
  const durationMinutes =
    selectedBooking && selectedBooking.duration ? parseInt(selectedBooking.duration, 10) : 15

  // Start at 8:00 AM
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
