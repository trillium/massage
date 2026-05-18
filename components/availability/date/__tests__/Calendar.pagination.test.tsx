import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { addDays, format, startOfWeek, eachDayOfInterval, endOfWeek } from 'date-fns'

import Calendar from '../Calendar'
import { availabilitySlice } from '@/redux/slices/availabilitySlice'
import { modalSlice } from '@/redux/slices/modalSlice'
import { bookingFormSlice } from '@/redux/slices/bookingFormSlice'
import { reviewFormSlice } from '@/redux/slices/reviewFormSlice'
import { readySlice } from '@/redux/slices/readySlice'
import { eventContainersSlice } from '@/redux/slices/eventContainersSlice'
import { configSlice } from '@/redux/slices/configSlice'
import { contactFormSlice } from '@/redux/slices/contactFormSlice'
import { combineSlices } from '@reduxjs/toolkit'
import type { StringDateTimeIntervalAndLocation } from 'lib/types'

vi.mock('config', () => ({
  ALLOWED_DURATIONS: [60, 90, 120],
  LEAD_TIME: 180,
  OWNER_TIMEZONE: 'America/Los_Angeles',
  DEFAULT_PRICING: { 60: 100, 90: 140, 120: 180 },
}))

const rootReducer = combineSlices(
  bookingFormSlice,
  reviewFormSlice,
  availabilitySlice,
  modalSlice,
  readySlice,
  eventContainersSlice,
  configSlice,
  contactFormSlice
)

function makeStore(slots: StringDateTimeIntervalAndLocation[], start: string, end: string) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: {
      availability: {
        start,
        end,
        timeZone: 'America/Los_Angeles',
        duration: 60,
        slots,
        selectedDate: undefined,
        selectedTime: undefined,
        driveTime: null,
        adjacencyBuffer: 30,
      },
    },
  })
}

function generateSlots(startDate: Date, totalDays: number): StringDateTimeIntervalAndLocation[] {
  const slots: StringDateTimeIntervalAndLocation[] = []
  for (let i = 0; i < totalDays; i++) {
    const day = addDays(startDate, i)
    if (day.getDay() === 0 || day.getDay() === 6) continue

    const dateStr = format(day, 'yyyy-MM-dd')
    slots.push({
      start: `${dateStr}T10:00:00-07:00`,
      end: `${dateStr}T11:00:00-07:00`,
    })
    slots.push({
      start: `${dateStr}T14:00:00-07:00`,
      end: `${dateStr}T15:00:00-07:00`,
    })
  }
  return slots
}

describe('Calendar pagination with slot data', () => {
  const today = new Date()
  const startStr = format(today, 'yyyy-MM-dd')
  const endStr = format(addDays(today, 34), 'yyyy-MM-dd')
  const slots = generateSlots(today, 35)

  it('renders nav controls when paginate is true', () => {
    const store = makeStore(slots, startStr, endStr)
    render(
      <Provider store={store}>
        <Calendar paginate={true} weeksDisplayOverride={3} />
      </Provider>
    )

    expect(screen.getByLabelText('Previous page')).toBeInTheDocument()
    expect(screen.getByLabelText('Next page')).toBeInTheDocument()
  })

  it('does not render nav controls when paginate is false', () => {
    const store = makeStore(slots, startStr, endStr)
    render(
      <Provider store={store}>
        <Calendar paginate={false} />
      </Provider>
    )

    expect(screen.queryByLabelText('Previous page')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument()
  })

  it('prev button is disabled on first page', () => {
    const store = makeStore(slots, startStr, endStr)
    render(
      <Provider store={store}>
        <Calendar paginate={true} weeksDisplayOverride={3} />
      </Provider>
    )

    const prevBtn = screen.getByLabelText('Previous page')
    expect(prevBtn).toBeDisabled()
  })

  it('next button is enabled when more pages exist', () => {
    const store = makeStore(slots, startStr, endStr)
    render(
      <Provider store={store}>
        <Calendar paginate={true} weeksDisplayOverride={3} />
      </Provider>
    )

    const nextBtn = screen.getByLabelText('Next page')
    expect(nextBtn).not.toBeDisabled()
  })

  it('clicking next advances to page 2 and prev becomes enabled', () => {
    const store = makeStore(slots, startStr, endStr)
    render(
      <Provider store={store}>
        <Calendar paginate={true} weeksDisplayOverride={3} />
      </Provider>
    )

    const nextBtn = screen.getByLabelText('Next page')
    fireEvent.click(nextBtn)

    const prevBtn = screen.getByLabelText('Previous page')
    expect(prevBtn).not.toBeDisabled()
  })

  it('clicking prev from page 2 returns to page 1', () => {
    const store = makeStore(slots, startStr, endStr)
    render(
      <Provider store={store}>
        <Calendar paginate={true} weeksDisplayOverride={3} />
      </Provider>
    )

    fireEvent.click(screen.getByLabelText('Next page'))
    fireEvent.click(screen.getByLabelText('Previous page'))

    expect(screen.getByLabelText('Previous page')).toBeDisabled()
  })

  it('page 1 shows available days from the first weeks', () => {
    const store = makeStore(slots, startStr, endStr)
    render(
      <Provider store={store}>
        <Calendar paginate={true} weeksDisplayOverride={3} />
      </Provider>
    )

    const availableLabels = screen.getAllByLabelText(/Available date/)
    expect(availableLabels.length).toBeGreaterThan(0)
  })

  it('page 2 also shows available days from later weeks', () => {
    const store = makeStore(slots, startStr, endStr)
    render(
      <Provider store={store}>
        <Calendar paginate={true} weeksDisplayOverride={3} />
      </Provider>
    )

    fireEvent.click(screen.getByLabelText('Next page'))

    const availableLabels = screen.getAllByLabelText(/Available date/)
    expect(availableLabels.length).toBeGreaterThan(0)
  })

  it('visible day count changes between pages', () => {
    const store = makeStore(slots, startStr, endStr)
    render(
      <Provider store={store}>
        <Calendar paginate={true} weeksDisplayOverride={3} />
      </Provider>
    )

    const page1Labels = screen.getAllByRole('radio')
    const page1Count = page1Labels.length

    fireEvent.click(screen.getByLabelText('Next page'))

    const page2Labels = screen.getAllByRole('radio')
    const page2Count = page2Labels.length

    expect(page1Count).toBe(3 * 7)
    expect(page2Count).toBeGreaterThan(0)
  })

  it('slots on page 2 dates still have availability indicators', () => {
    const longEnd = format(addDays(today, 41), 'yyyy-MM-dd')
    const longSlots = generateSlots(today, 42)
    const store = makeStore(longSlots, startStr, longEnd)

    render(
      <Provider store={store}>
        <Calendar paginate={true} weeksDisplayOverride={3} />
      </Provider>
    )

    fireEvent.click(screen.getByLabelText('Next page'))

    const allLabels = screen.getAllByLabelText(/date .* in calendar/)
    const availableOnPage2 = allLabels.filter((el) =>
      el.getAttribute('aria-label')?.includes('Available')
    )
    expect(availableOnPage2.length).toBeGreaterThan(0)
  })

  it('slots prop override works with pagination', () => {
    const directSlots = generateSlots(today, 28)
    const store = makeStore([], startStr, endStr)

    render(
      <Provider store={store}>
        <Calendar
          paginate={true}
          weeksDisplayOverride={3}
          slots={directSlots}
          start={startStr}
          end={format(addDays(today, 27), 'yyyy-MM-dd')}
        />
      </Provider>
    )

    const availableLabels = screen.getAllByLabelText(/Available date/)
    expect(availableLabels.length).toBeGreaterThan(0)
  })

  it('maxVisibleWeeks caps the number of weeks per page', () => {
    const store = makeStore(slots, startStr, endStr)
    render(
      <Provider store={store}>
        <Calendar paginate={true} weeksDisplayOverride={5} maxVisibleWeeks={2} />
      </Provider>
    )

    const radios = screen.getAllByRole('radio')
    expect(radios.length).toBe(2 * 7)
  })
})
