// availability.test.ts

import { describe, test, expect } from 'vitest'
import { dayFromString } from '../../dayAsObject'
import getPotentialTimes from '../getPotentialTimes'
import type { AvailabilitySlotsMap } from '../../types'
import { formatDatetimeToString } from '../../helpers'

describe('getPotentialTimes', () => {
  const start = dayFromString('2023-03-13') // 2023-03-13 is Monday
  const end = dayFromString('2023-03-17') // 2023-03-17 is Friday

  const availabilitySlots: AvailabilitySlotsMap = {
    1: [
      // 3 hours
      // 3 slots at 60 appointment interval
      // 5 slots at 30 appointment interval
      { start: { hour: 9, minute: 0 }, end: { hour: 12, minute: 0 } },
      // 4 hours
      // 4 slots at 60 appointment interval
      // 7 slots at 30 appointment interval
      { start: { hour: 13, minute: 0 }, end: { hour: 17, minute: 0 } },
    ],
    // 5 hours
    // 5 slots at 60 appointment interval
    // 9 slots at 30 appointment interval
    3: [{ start: { hour: 10, minute: 0 }, end: { hour: 15, minute: 0 } }],
    // 4 hours
    // 4 slots at 60 appointment interval
    // 7 slots at 30 appointment interval
    5: [{ start: { hour: 14, minute: 0 }, end: { hour: 18, minute: 0 } }],
  }

  test('should return correct durations for given availability slots at 60m appointment interval', () => {
    const duration = 60
    const defaultAppointmentInterval = 60
    const result = getPotentialTimes({
      start,
      end,
      duration,
      availabilitySlots,
      defaultAppointmentInterval,
    })

    expect(result).toHaveLength(16)

    expect(result[0].start).toStrictEqual(formatDatetimeToString(new Date('2023-03-13T09:00:00')))
    expect(result[0].end).toStrictEqual(formatDatetimeToString(new Date('2023-03-13T10:00:00')))
    expect(result[15].start).toStrictEqual(formatDatetimeToString(new Date('2023-03-17T17:00:00')))
    expect(result[15].end).toStrictEqual(formatDatetimeToString(new Date('2023-03-17T18:00:00')))
  })

  test('should return correct durations for given availability slots at 30m appointment interval', () => {
    const duration = 60
    const defaultAppointmentInterval = 30
    const result = getPotentialTimes({
      start,
      end,
      duration,
      availabilitySlots,
      defaultAppointmentInterval,
    })

    expect(result).toHaveLength(28)

    expect(result[0].start).toStrictEqual(formatDatetimeToString(new Date('2023-03-13T09:00:00')))
    expect(result[0].end).toStrictEqual(formatDatetimeToString(new Date('2023-03-13T10:00:00')))
    expect(result[27].start).toStrictEqual(formatDatetimeToString(new Date('2023-03-17T17:00:00')))
    expect(result[27].end).toStrictEqual(formatDatetimeToString(new Date('2023-03-17T18:00:00')))
  })

  test('should return an empty array if no availability slots are provided', () => {
    const duration = 60
    const result = getPotentialTimes({
      start,
      end,
      duration,
      availabilitySlots: {},
    })

    expect(result).toHaveLength(0)
  })

  test('should return an empty array if the date range is invalid', () => {
    const duration = 60
    const invalidEnd = dayFromString('2023-03-10')
    const result = getPotentialTimes({
      start,
      end: invalidEnd,
      duration,
      availabilitySlots,
    })

    expect(result).toHaveLength(0)
  })

  test('should return an empty array if the duration is 0', () => {
    const result = getPotentialTimes({
      start,
      end,
      duration: 0,
      availabilitySlots,
    })

    expect(result).toHaveLength(0)
  })

  test('should return an empty array if the duration is negative', () => {
    const result = getPotentialTimes({
      start,
      end,
      duration: -60,
      availabilitySlots,
    })

    expect(result).toHaveLength(0)
  })

  test('should return correct durations for non-contiguous availability slots and 60m duration/appointment interval', () => {
    const duration = 60
    const defaultAppointmentInterval = 60

    const nonContiguousSlots: AvailabilitySlotsMap = {
      // 1.5 hour = 1 hour slot, 3 half hour slots
      1: [{ start: { hour: 9, minute: 0 }, end: { hour: 10, minute: 30 } }],
      // 2.5 hours = 2 hour slots; 6 half hour slots
      3: [{ start: { hour: 14, minute: 0 }, end: { hour: 16, minute: 30 } }],
    }

    const result = getPotentialTimes({
      start,
      end,
      duration,
      availabilitySlots: nonContiguousSlots,
      defaultAppointmentInterval,
    })

    expect(result).toHaveLength(3)
    expect(result[0].start).toStrictEqual(formatDatetimeToString(new Date('2023-03-13T09:00:00')))
    expect(result[0].end).toStrictEqual(formatDatetimeToString(new Date('2023-03-13T10:00:00')))
    expect(result[2].start).toStrictEqual(formatDatetimeToString(new Date('2023-03-15T15:00:00')))
    expect(result[2].end).toStrictEqual(formatDatetimeToString(new Date('2023-03-15T16:00:00')))
  })

  test('should account for defaultAppointmentInterval less than the chosen duration', () => {
    const defaultAppointmentInterval = 30 // 30 minutes
    const duration = 60 // 60 minutes
    const ninetyMinuteSingleDaySlot: AvailabilitySlotsMap = {
      1: [
        // 90 minutes
        { start: { hour: 1, minute: 0 }, end: { hour: 2, minute: 30 } },
      ],
    }

    const result = getPotentialTimes({
      start,
      end,
      duration,
      availabilitySlots: ninetyMinuteSingleDaySlot,
      defaultAppointmentInterval,
    })

    const startDate = start.start.split('T')[0] // Get just the date part (YYYY-MM-DD)
    expect(result[0].start).toStrictEqual(formatDatetimeToString(new Date(`${startDate}T01:00:00`))) // "2023-03-13T01:00:00"
    expect(result[0].end).toStrictEqual(formatDatetimeToString(new Date(`${startDate}T02:00:00`))) // "2023-03-13T02:00:00"
    expect(result[1].start).toStrictEqual(formatDatetimeToString(new Date(`${startDate}T01:30:00`))) // "2023-03-13T01:30:00"
    expect(result[1].end).toStrictEqual(formatDatetimeToString(new Date(`${startDate}T02:30:00`))) // "2023-03-13T02:30:00"
    expect(result).toHaveLength(2)
  })
})
