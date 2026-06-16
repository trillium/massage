'use client'

import { useMemo, useState, useCallback } from 'react'
import { addDays, eachDayOfInterval, endOfWeek, startOfWeek } from 'date-fns'

import CalendarNav from './CalendarNav'
import DayButton from './DayButton'
import Day from 'lib/day'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { format } from 'date-fns-tz'

import type { StringDateTimeIntervalAndLocation } from 'lib/types'
import { useReduxAvailability, useAppDispatch } from '@/redux/hooks'
import { setSelectedDate } from '@/redux/slices/availabilitySlice'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

interface CalendarProps {
  slots?: StringDateTimeIntervalAndLocation[]
  start?: string
  end?: string
  timeZone?: string
  onDaySelect?: (date: Day) => void
  forceEnableFutureDates?: boolean
  selectedDate?: Day | null
  weeksDisplayOverride?: number
  paginate?: boolean
  maxVisibleWeeks?: number
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
  paginate = false,
  maxVisibleWeeks = 5,
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

  const { offers, maximumAvailability } = useMemo(() => {
    let maxAvail = 0
    const byDate = slots.reduce<Record<string, StringDateTimeIntervalAndLocation[]>>(
      (acc, slot) => {
        const date = format(slot.start, 'yyyy-MM-dd', { timeZone })
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(slot)
        if (acc[date].length > maxAvail) {
          maxAvail = acc[date].length
        }
        return acc
      },
      {}
    )
    return { offers: byDate, maximumAvailability: maxAvail }
  }, [slots, timeZone])

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

  const effectivePageWeeks = paginate
    ? Math.min(weeksDisplayOverride, maxVisibleWeeks)
    : weeksDisplayOverride

  const [pageOffset, setPageOffset] = useState(0)

  const safeStartIndex = paginate ? pageOffset * effectivePageWeeks * 7 : 0

  const visibleDays = paginate
    ? days.slice(safeStartIndex, safeStartIndex + effectivePageWeeks * 7)
    : days.slice(0, weeksDisplayOverride * 7)

  const totalPages = paginate ? Math.ceil(days.length / (effectivePageWeeks * 7)) : 1
  const prevDisabled = paginate ? pageOffset <= 0 : true
  const nextDisabled = paginate ? pageOffset >= totalPages - 1 : true

  const handlePrev = useCallback(() => {
    setPageOffset((p) => Math.max(0, p - 1))
  }, [])

  const handleNext = useCallback(() => {
    setPageOffset((p) => Math.min(totalPages - 1, p + 1))
  }, [totalPages])

  const pageStartDate =
    visibleDays.length > 0 ? new Date(visibleDays[0].toString() + 'T12:00:00') : startDate
  const lastVisible =
    visibleDays.length > 0
      ? new Date(visibleDays[visibleDays.length - 1].toString() + 'T12:00:00')
      : startDate

  return (
    <Box
      className="focus-within:ring-primary-500 active:ring-primary-500 isolate mt-6 grid grid-cols-7 overflow-hidden rounded-md border-2 border-accent-300 text-xs leading-6 text-accent-500 focus-within:ring-2 active:ring-2 dark:border-accent-700 dark:text-accent-400"
      role="grid"
      aria-label="Calendar"
    >
      {paginate && (
        <CalendarNav
          pageStartDate={pageStartDate}
          pageEndDate={lastVisible}
          onPrev={handlePrev}
          onNext={handleNext}
          prevDisabled={prevDisabled}
          nextDisabled={nextDisabled}
        />
      )}
      {weekdays.map((weekday) => (
        <Stack direction="row" justify="center" className="text-accent-500" key={weekday} role="columnheader" aria-label={weekday}>
          {weekday}
        </Stack>
      ))}
      {visibleDays.map((day) => {
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
    </Box>
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
