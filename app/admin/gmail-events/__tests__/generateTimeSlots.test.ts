import { describe, test, expect } from 'vitest'
import { generateTimeSlots } from '../generateTimeSlots'
import Day from '@/lib/day'

describe('generateTimeSlots', () => {
  test('should generate time slots starting at 8am in Los Angeles timezone for September 2, 2025', () => {
    const selectedDay = new Day(2025, 9, 2)

    const selectedBooking = {
      duration: '60',
    }

    const slots = generateTimeSlots({ selectedDay, selectedBooking })

    expect(slots.length).toBeGreaterThan(0)

    expect(slots[0].start).toMatch(/^2025-09-02T08:00:00/)
    expect(slots[0].end).toMatch(/^2025-09-02T09:00:00/)

    expect(slots[1].start).toMatch(/^2025-09-02T08:15:00/)
    expect(slots[1].end).toMatch(/^2025-09-02T09:15:00/)

    slots.forEach((slot, index) => {
      expect(slot.start, `Slot ${index} start should be on 2025-09-02`).toMatch(/^2025-09-02T/)
      expect(slot.end, `Slot ${index} end should be on 2025-09-02 or 2025-09-03`).toMatch(
        /^2025-09-0[23]T/
      )
    })

    expect(slots[0].start).toMatch(/^2025-09-02T08:00:00[+-]\d{2}:\d{2}$/)
    expect(slots[0].end).toMatch(/^2025-09-02T09:00:00[+-]\d{2}:\d{2}$/)
  })

  test('should generate time slots with 15-minute default duration when no booking specified', () => {
    const selectedDay = new Day(2025, 9, 9)

    const slots = generateTimeSlots({ selectedDay, selectedBooking: null })

    expect(slots.length).toBeGreaterThan(0)

    expect(slots[0].start).toMatch(/^2025-09-09T08:00:00/)
    expect(slots[0].end).toMatch(/^2025-09-09T08:15:00/)

    expect(slots[1].start).toMatch(/^2025-09-09T08:15:00/)
    expect(slots[1].end).toMatch(/^2025-09-09T08:30:00/)
  })

  test('should generate time slots with custom duration', () => {
    const selectedDay = new Day(2025, 9, 15)

    const selectedBooking = {
      duration: '90',
    }

    const slots = generateTimeSlots({ selectedDay, selectedBooking })

    expect(slots.length).toBeGreaterThan(0)

    expect(slots[0].start).toMatch(/^2025-09-15T08:00:00/)
    expect(slots[0].end).toMatch(/^2025-09-15T09:30:00/)

    expect(slots[1].start).toMatch(/^2025-09-15T08:15:00/)
    expect(slots[1].end).toMatch(/^2025-09-15T09:45:00/)
  })

  test('should handle different months correctly', () => {
    const selectedDay = new Day(2025, 1, 15)

    const slots = generateTimeSlots({ selectedDay, selectedBooking: null })

    expect(slots.length).toBeGreaterThan(0)

    slots.forEach((slot, index) => {
      expect(slot.start, `Slot ${index} start should be on 2025-01-15`).toMatch(/^2025-01-15T/)
    })

    expect(slots[0].start).toMatch(/^2025-01-15T08:00:00/)
  })

  test('should handle end of year correctly', () => {
    const selectedDay = new Day(2025, 12, 31)

    const slots = generateTimeSlots({ selectedDay, selectedBooking: null })

    expect(slots.length).toBeGreaterThan(0)

    slots.forEach((slot, index) => {
      expect(slot.start, `Slot ${index} start should be on 2025-12-31`).toMatch(/^2025-12-31T/)
    })

    expect(slots[0].start).toMatch(/^2025-12-31T08:00:00/)
  })

  test('should generate slots until 11pm (23:00)', () => {
    const selectedDay = new Day(2025, 9, 2)

    const selectedBooking = {
      duration: '15',
    }

    const slots = generateTimeSlots({ selectedDay, selectedBooking })

    const lastValidSlot = slots[slots.length - 1]

    expect(lastValidSlot.start).toMatch(/^2025-09-02T22:45:00/)
    expect(lastValidSlot.end).toMatch(/^2025-09-02T23:00:00/)
  })

  test('should fallback to current date when selectedDay is null or undefined', () => {
    const slots = generateTimeSlots({ selectedDay: null, selectedBooking: null })

    expect(slots.length).toBeGreaterThan(0)

    expect(slots[0].start).toMatch(/T08:00:00[+-]\d{2}:\d{2}$/)
    expect(slots[0].end).toMatch(/T08:15:00[+-]\d{2}:\d{2}$/)
  })

  test('should properly handle Los Angeles timezone offsets', () => {
    const selectedDayDST = new Day(2025, 9, 2)

    const slotsDST = generateTimeSlots({ selectedDay: selectedDayDST, selectedBooking: null })

    expect(slotsDST[0].start).toMatch(/^2025-09-02T08:00:00-07:00$/)

    const selectedDayStandard = new Day(2025, 1, 15)

    const slotsStandard = generateTimeSlots({
      selectedDay: selectedDayStandard,
      selectedBooking: null,
    })

    expect(slotsStandard[0].start).toMatch(/^2025-01-15T08:00:00-08:00$/)
  })

  test('should verify actual timezone output and date handling', () => {
    const selectedDay = new Day(2025, 9, 2)

    const slots = generateTimeSlots({ selectedDay, selectedBooking: { duration: '60' } })

    expect(slots[0].start, 'First slot should start on the selected date').toMatch(/^2025-09-02/)
    expect(slots[1].start, 'Second slot should start on the selected date').toMatch(/^2025-09-02/)
    expect(slots[2].start, 'Third slot should start on the selected date').toMatch(/^2025-09-02/)

    expect(slots[0].start).toMatch(/T08:00:00/)
    expect(slots[1].start).toMatch(/T08:15:00/)
    expect(slots[2].start).toMatch(/T08:30:00/)

    const selectedDayJan = new Day(2025, 1, 15)

    const slotsJan = generateTimeSlots({
      selectedDay: selectedDayJan,
      selectedBooking: { duration: '60' },
    })

    expect(slotsJan[0].start, 'January slot should be on correct date').toMatch(
      /^2025-01-15T08:00:00/
    )
    expect(slotsJan[1].start, 'January slot should be on correct date').toMatch(
      /^2025-01-15T08:15:00/
    )
    expect(slotsJan[2].start, 'January slot should be on correct date').toMatch(
      /^2025-01-15T08:30:00/
    )
  })
})
