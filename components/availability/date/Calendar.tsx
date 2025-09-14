'use client'

import { addDays, eachDayOfInterval, endOfWeek, startOfWeek } from 'date-fns'

import DayButton from './DayButton'
import Day from 'lib/day'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { format } from 'date-fns-tz'

import type { StringDateTimeIntervalAndLocation } from 'lib/types'
import { useReduxAvailability, useAppDispatch } from '@/redux/hooks'
import { setSelectedDate } from '@/redux/slices/availabilitySlice'

interface CalendarProps {
  slots?: StringDateTimeIntervalAndLocation[]
  start?: string
  end?: string
  timeZone?: string
  onDaySelect?: (date: Day) => void
  forceEnableFutureDates?: boolean
  selectedDate?: Day | null
  weeksDisplayOverride?: number
}

export default function Calendar({
  slots: slotsProp,
  start: startProp,
  end: endProp,
  timeZone: timeZoneProp,
  onDaySelect,
  forceEnableFutureDates = false,
  selectedDate: selectedDateProp,
  weeksDisplayOverride = 3,
}: CalendarProps) {
  const { slots: slotsRedux, selectedDate } = useReduxAvailability()
  const {
    start: startRedux,
    end: endRedux,
    timeZone: timeZoneRedux,
  } = useSelector((state: RootState) => state.availability)

  const dispatch = useAppDispatch()

  const slots = slotsProp || slotsRedux || []
  const start = startProp || startRedux
  const end = endProp || endRedux
  const timeZone = timeZoneProp || timeZoneRedux

  const handleDaySelect = (date: Day) => {
    if (onDaySelect) {
      onDaySelect(date)
    } else {
      dispatch(setSelectedDate(date.toString()))
    }
  }

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
      className="focus-within:ring-primary-500 active:ring-primary-500 isolate mt-6 grid grid-cols-7 overflow-hidden rounded-md border-2 border-slate-300 text-xs leading-6 text-gray-500 focus-within:ring-2 active:ring-2 dark:border-slate-700 dark:text-gray-400"
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
      {days.slice(0, weeksDisplayOverride * 7).map((day) => {
        const availabilityTest = offers[day.toString()] ?? []

        // Determine which selected date to use - props override Redux
        const activeSelectedDate = selectedDateProp || selectedDate
        const isSelected = activeSelectedDate
          ? day.toString() === activeSelectedDate.toString()
          : false

        // Determine if day should have availability
        let hasAvailability = availabilityTest.length > 0

        // Override availability for future dates if forceEnableFutureDates is true
        if (forceEnableFutureDates) {
          const dayInterval = day.toInterval(timeZone)
          const nowInterval = now.toInterval(timeZone)
          // Enable if day is today or in the future
          hasAvailability = dayInterval.start >= nowInterval.start
        }

        return (
          <DayButton
            key={day.toString()}
            date={day}
            availabilityScore={availabilityScore({
              openSlots: offers[day.toString()]?.length ?? 0,
              maximumAvailability,
            })}
            hasAvailability={hasAvailability}
            isSelected={isSelected}
            onDaySelect={handleDaySelect}
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
