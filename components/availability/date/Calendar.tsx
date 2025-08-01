'use client'

import { addDays, eachDayOfInterval, endOfWeek, startOfWeek } from 'date-fns'

import DayButton from './DayButton'
import Day from 'lib/day'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { format } from 'date-fns-tz'

import type { StringDateTimeIntervalAndLocation } from 'lib/types'
import { useReduxAvailability } from '@/redux/hooks'

interface CalendarProps {
  slots?: StringDateTimeIntervalAndLocation[]
  start?: string
  end?: string
  timeZone?: string
}

export default function Calendar({
  slots: slotsProp,
  start: startProp,
  end: endProp,
  timeZone: timeZoneProp,
}: CalendarProps) {
  const { slots: slotsRedux } = useReduxAvailability()
  const {
    start: startRedux,
    end: endRedux,
    timeZone: timeZoneRedux,
  } = useSelector((state: RootState) => state.availability)

  const slots = slotsProp || slotsRedux || []
  const start = startProp || startRedux
  const end = endProp || endRedux
  const timeZone = timeZoneProp || timeZoneRedux

  let maximumAvailability = 0
  const availabilityByDate = slots.reduce<Record<string, StringDateTimeIntervalAndLocation[]>>(
    (acc, slot) => {
      // Gives us the same YYYY-MM-DD format as Day.toString()
      const date = format(slot.start, 'yyyy-MM-dd', { timeZone })

      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(slot)

      if (acc[date].length > maximumAvailability) {
        maximumAvailability = acc[date].length
      }
      return acc
    },
    {}
  )

  const offers = availabilityByDate

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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

  // Remove cases where the first week is empty.
  // (Usually timezone changing related)
  const firstWeek = days.at(6)
  if (firstWeek && firstWeek.toInterval(timeZone).start < now.toInterval(timeZone).start) {
    days.splice(0, 7)
  }

  return (
    <div
      className="isolate mt-6 grid grid-cols-7 overflow-hidden rounded-md border-2 border-slate-300 text-xs leading-6 text-gray-500 focus-within:ring-2 focus-within:ring-primary-500 active:ring-2 active:ring-primary-500 dark:border-slate-700 dark:text-gray-400"
      role="grid"
      aria-label="Calendar"
    >
      {weekdays.map((weekday) => (
        <div
          key={weekday}
          className="flex justify-center text-slate-500"
          role="columnheader"
          aria-label={weekday}
        >
          {weekday}
        </div>
      ))}
      {days.slice(0, 21).map((day) => {
        const availabilityTest = offers[day.toString()] ?? []
        return (
          <DayButton
            key={day.toString()}
            date={day}
            availabilityScore={availabilityScore({
              openSlots: offers[day.toString()]?.length ?? 0,
              maximumAvailability,
            })}
            hasAvailability={availabilityTest.length > 0}
          />
        )
      })}
    </div>
  )
}

function availabilityScore({
  openSlots,
  maximumAvailability,
}: {
  openSlots: number
  maximumAvailability: number
}) {
  return openSlots === 0
    ? 0
    : openSlots / maximumAvailability <= 1 / 3
      ? 1
      : openSlots / maximumAvailability <= 2 / 3
        ? 2
        : 3
}
