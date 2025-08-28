import { describe, test, expect } from 'vitest'
import { generateTimeSlots } from '../generateTimeSlots'

describe('generateTimeSlots', () => {
  test('should generate time slots starting at 8am in Los Angeles timezone for September 2, 2025', () => {
    const selectedDay = {
      year: 2025,
      month: 9,
      day: 2,
      toString: () => '2025-09-02',
    }

    const selectedBooking = {
      duration: '60', // 60 minutes
    }

    const slots = generateTimeSlots({ selectedDay, selectedBooking })

    // Should have slots from 8am to 11pm (15 hours) with 15-minute intervals
    // That's 15 * 4 = 60 slots per hour * 15 hours = 900 slots, but actually fewer due to duration
    expect(slots.length).toBeGreaterThan(0)

    // First slot should start at 8:00 AM on the selected date in LA timezone
    expect(slots[0].start).toMatch(/^2025-09-02T08:00:00/)
    expect(slots[0].end).toMatch(/^2025-09-02T09:00:00/) // 60 minutes later

    // Second slot should start at 8:15 AM
    expect(slots[1].start).toMatch(/^2025-09-02T08:15:00/)
    expect(slots[1].end).toMatch(/^2025-09-02T09:15:00/)

    // Verify all slots are on the correct date (September 2, 2025)
    slots.forEach((slot, index) => {
      expect(slot.start, `Slot ${index} start should be on 2025-09-02`).toMatch(/^2025-09-02T/)
      expect(slot.end, `Slot ${index} end should be on 2025-09-02 or 2025-09-03`).toMatch(
        /^2025-09-0[23]T/
      )
    })

    // Verify timezone format (should include timezone offset)
    expect(slots[0].start).toMatch(/^2025-09-02T08:00:00[+-]\d{2}:\d{2}$/)
    expect(slots[0].end).toMatch(/^2025-09-02T09:00:00[+-]\d{2}:\d{2}$/)
  })

  test('should generate time slots with 15-minute default duration when no booking specified', () => {
    const selectedDay = {
      year: 2025,
      month: 9,
      day: 9,
      toString: () => '2025-09-09',
    }

    const slots = generateTimeSlots({ selectedDay, selectedBooking: null })

    expect(slots.length).toBeGreaterThan(0)

    // First slot should start at 8:00 AM and end at 8:15 AM (15 minutes default)
    expect(slots[0].start).toMatch(/^2025-09-09T08:00:00/)
    expect(slots[0].end).toMatch(/^2025-09-09T08:15:00/)

    // Second slot should start at 8:15 AM and end at 8:30 AM
    expect(slots[1].start).toMatch(/^2025-09-09T08:15:00/)
    expect(slots[1].end).toMatch(/^2025-09-09T08:30:00/)
  })

  test('should generate time slots with custom duration', () => {
    const selectedDay = {
      year: 2025,
      month: 9,
      day: 15,
      toString: () => '2025-09-15',
    }

    const selectedBooking = {
      duration: '90', // 90 minutes
    }

    const slots = generateTimeSlots({ selectedDay, selectedBooking })

    expect(slots.length).toBeGreaterThan(0)

    // First slot should start at 8:00 AM and end at 9:30 AM (90 minutes)
    expect(slots[0].start).toMatch(/^2025-09-15T08:00:00/)
    expect(slots[0].end).toMatch(/^2025-09-15T09:30:00/)

    // Second slot should start at 8:15 AM and end at 9:45 AM
    expect(slots[1].start).toMatch(/^2025-09-15T08:15:00/)
    expect(slots[1].end).toMatch(/^2025-09-15T09:45:00/)
  })

  test('should handle different months correctly', () => {
    const selectedDay = {
      year: 2025,
      month: 1, // January
      day: 15,
      toString: () => '2025-01-15',
    }

    const slots = generateTimeSlots({ selectedDay, selectedBooking: null })

    expect(slots.length).toBeGreaterThan(0)

    // All slots should be on January 15, 2025
    slots.forEach((slot, index) => {
      expect(slot.start, `Slot ${index} start should be on 2025-01-15`).toMatch(/^2025-01-15T/)
    })

    // First slot should still start at 8:00 AM
    expect(slots[0].start).toMatch(/^2025-01-15T08:00:00/)
  })

  test('should handle end of year correctly', () => {
    const selectedDay = {
      year: 2025,
      month: 12, // December
      day: 31,
      toString: () => '2025-12-31',
    }

    const slots = generateTimeSlots({ selectedDay, selectedBooking: null })

    expect(slots.length).toBeGreaterThan(0)

    // All slots should start on December 31, 2025
    slots.forEach((slot, index) => {
      expect(slot.start, `Slot ${index} start should be on 2025-12-31`).toMatch(/^2025-12-31T/)
    })

    // First slot should still start at 8:00 AM
    expect(slots[0].start).toMatch(/^2025-12-31T08:00:00/)
  })

  test('should generate slots until 11pm (23:00)', () => {
    const selectedDay = {
      year: 2025,
      month: 9,
      day: 2,
      toString: () => '2025-09-02',
    }

    const selectedBooking = {
      duration: '15', // 15 minutes to get maximum number of slots
    }

    const slots = generateTimeSlots({ selectedDay, selectedBooking })

    // Find the last slot that starts before 11pm
    const lastValidSlot = slots[slots.length - 1]

    // Last slot should start at 22:45 (10:45 PM) to end before 11:00 PM
    expect(lastValidSlot.start).toMatch(/^2025-09-02T22:45:00/)
    expect(lastValidSlot.end).toMatch(/^2025-09-02T23:00:00/)
  })

  test('should fallback to current date when selectedDay is null or undefined', () => {
    const slots = generateTimeSlots({ selectedDay: null, selectedBooking: null })

    expect(slots.length).toBeGreaterThan(0)

    // Should generate slots for today starting at 8:00 AM
    // We can't test the exact date since it depends on when the test runs,
    // but we can verify the time format and that it starts at 8 AM
    expect(slots[0].start).toMatch(/T08:00:00[+-]\d{2}:\d{2}$/)
    expect(slots[0].end).toMatch(/T08:15:00[+-]\d{2}:\d{2}$/) // 15 minutes default
  })

  test('should properly handle Los Angeles timezone offsets', () => {
    // Test during daylight saving time (September)
    const selectedDayDST = {
      year: 2025,
      month: 9, // September - DST
      day: 2,
      toString: () => '2025-09-02',
    }

    const slotsDST = generateTimeSlots({ selectedDay: selectedDayDST, selectedBooking: null })

    // During DST, LA is UTC-7 (PDT)
    expect(slotsDST[0].start).toMatch(/^2025-09-02T08:00:00-07:00$/)

    // Test during standard time (January)
    const selectedDayStandard = {
      year: 2025,
      month: 1, // January - Standard time
      day: 15,
      toString: () => '2025-01-15',
    }

    const slotsStandard = generateTimeSlots({
      selectedDay: selectedDayStandard,
      selectedBooking: null,
    })

    // During standard time, LA is UTC-8 (PST)
    expect(slotsStandard[0].start).toMatch(/^2025-01-15T08:00:00-08:00$/)
  })

  test('should verify actual timezone output and date handling', () => {
    const selectedDay = {
      year: 2025,
      month: 9,
      day: 2,
      toString: () => '2025-09-02',
    }

    const slots = generateTimeSlots({ selectedDay, selectedBooking: { duration: '60' } })

    // Log first few slots for debugging
    console.log('First 3 slots for September 2, 2025:')
    slots.slice(0, 3).forEach((slot, i) => {
      console.log(`Slot ${i}: ${slot.start} - ${slot.end}`)
    })

    // Verify the date portion is correct - this is the critical test
    // The issue was that slots were starting on 2025-09-01 instead of 2025-09-02
    expect(slots[0].start, 'First slot should start on the selected date').toMatch(/^2025-09-02/)
    expect(slots[1].start, 'Second slot should start on the selected date').toMatch(/^2025-09-02/)
    expect(slots[2].start, 'Third slot should start on the selected date').toMatch(/^2025-09-02/)

    // Verify times are sequential starting at 8 AM
    expect(slots[0].start).toMatch(/T08:00:00/)
    expect(slots[1].start).toMatch(/T08:15:00/)
    expect(slots[2].start).toMatch(/T08:30:00/)

    // Test with January date to verify no timezone confusion across months
    const selectedDayJan = {
      year: 2025,
      month: 1,
      day: 15,
      toString: () => '2025-01-15',
    }

    const slotsJan = generateTimeSlots({
      selectedDay: selectedDayJan,
      selectedBooking: { duration: '60' },
    })

    console.log('First 3 slots for January 15, 2025:')
    slotsJan.slice(0, 3).forEach((slot, i) => {
      console.log(`Slot ${i}: ${slot.start} - ${slot.end}`)
    })

    // All January slots should be on the correct date
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
