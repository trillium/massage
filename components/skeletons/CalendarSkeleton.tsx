import { addDays, eachDayOfInterval, endOfWeek, startOfWeek } from "date-fns"

import Day from "@/lib/day"

import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { DayButtonSkeleton } from "./DayButtonSkeleton"

export default function CalendarSkeleton({}: {}) {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const { start, end, timeZone } = useSelector(
    (state: RootState) => state.availability
  )
  const startDate = new Date(start)
  const endDate = new Date(end)

  // Handles when the date changes due to the selected timezone
  const now = Day.todayWithOffset(0)

  const days = eachDayOfInterval({
    start: startOfWeek(startDate),
    // add two extra days in case we end on a weekend to avoid
    // an incomplete row.
    end: endOfWeek(addDays(endDate, 2)),
  }).map((day) => Day.dayFromDate(day))
  const firstWeek = days.at(6)
  if (
    firstWeek &&
    firstWeek.toInterval(timeZone).start < now.toInterval(timeZone).start
  ) {
    days.splice(0, 7)
  }

  return (
    <div
      className="isolate mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500 dark:text-gray-400"
      role="grid"
      aria-label="Calendar">
      {weekdays.map((weekday) => (
        <div
          key={weekday}
          className="justify-center text-slate-500 flex"
          role="columnheader"
          aria-label={weekday}>
          {weekday}
        </div>
      ))}
      {days.slice(0, 21).map((day) => {
        return <DayButtonSkeleton key={day.toString()} />
      })}
    </div>
  )
}
