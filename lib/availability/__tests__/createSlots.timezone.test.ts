import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { createSlots } from '@/lib/availability/createSlots'
import { createDay } from '@/lib/dayAsObject'
import { formatDatetimeToString } from '@/lib/helpers'
import type { GoogleCalendarV3Event } from '@/lib/types'

const nextYear = new Date().getFullYear() + 1

function fakeContainerEvent(
  startDateTime: string,
  endDateTime: string,
  location?: string
): GoogleCalendarV3Event {
  return {
    id: 'tz-test',
    summary: 'Container Event',
    start: { dateTime: startDateTime },
    end: { dateTime: endDateTime },
    kind: 'calendar#event',
    etag: '"etag"',
    status: 'confirmed',
    htmlLink: '',
    created: '',
    updated: '',
    ...(location && { location }),
  }
}

function freezeTimeToWellBeforeSlots() {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(`${nextYear}-01-01T00:00:00Z`))
}

describe('createSlots timezone safety', () => {
  beforeEach(() => {
    freezeTimeToWellBeforeSlots()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('UTC vs offset-formatted timestamps produce identical slots', () => {
    it('keeps slots when container uses UTC and boundary uses local offset', () => {
      const day = createDay(nextYear, 6, 15)

      const utcContainer = fakeContainerEvent(
        `${nextYear}-06-15T20:00:00Z`,
        `${nextYear}-06-15T23:00:00Z`
      )

      const pacificContainer = fakeContainerEvent(
        `${nextYear}-06-15T13:00:00-07:00`,
        `${nextYear}-06-15T16:00:00-07:00`
      )

      const slotsFromUtc = createSlots({
        start: day,
        end: day,
        busy: [],
        leadTime: 0,
        duration: 60,
        containers: [utcContainer],
      })

      const slotsFromPacific = createSlots({
        start: day,
        end: day,
        busy: [],
        leadTime: 0,
        duration: 60,
        containers: [pacificContainer],
      })

      expect(slotsFromUtc.length).toBeGreaterThan(0)
      expect(slotsFromPacific.length).toBeGreaterThan(0)
      expect(slotsFromUtc.length).toBe(slotsFromPacific.length)

      for (let i = 0; i < slotsFromUtc.length; i++) {
        expect(new Date(slotsFromUtc[i].start).getTime()).toBe(
          new Date(slotsFromPacific[i].start).getTime()
        )
        expect(new Date(slotsFromUtc[i].end).getTime()).toBe(
          new Date(slotsFromPacific[i].end).getTime()
        )
      }
    })

    it('produces identical results for Eastern offset format', () => {
      const day = createDay(nextYear, 6, 15)

      const utcContainer = fakeContainerEvent(
        `${nextYear}-06-15T18:00:00Z`,
        `${nextYear}-06-15T21:00:00Z`
      )

      const easternContainer = fakeContainerEvent(
        `${nextYear}-06-15T14:00:00-04:00`,
        `${nextYear}-06-15T17:00:00-04:00`
      )

      const slotsUtc = createSlots({
        start: day,
        end: day,
        busy: [],
        leadTime: 0,
        duration: 60,
        containers: [utcContainer],
      })

      const slotsEastern = createSlots({
        start: day,
        end: day,
        busy: [],
        leadTime: 0,
        duration: 60,
        containers: [easternContainer],
      })

      expect(slotsUtc.length).toBeGreaterThan(0)
      expect(slotsUtc.length).toBe(slotsEastern.length)
    })
  })

  describe('container events spanning UTC midnight', () => {
    it('produces slots for a Pacific evening container that crosses midnight UTC', () => {
      const day = createDay(nextYear, 6, 15)

      const eveningContainer = fakeContainerEvent(
        `${nextYear}-06-15T16:30:00-07:00`,
        `${nextYear}-06-15T21:30:00-07:00`
      )

      const slots = createSlots({
        start: day,
        end: day,
        busy: [],
        leadTime: 0,
        duration: 90,
        containers: [eveningContainer],
      })

      expect(slots.length).toBeGreaterThan(0)

      const containerStartMs = new Date(`${nextYear}-06-15T16:30:00-07:00`).getTime()
      const containerEndMs = new Date(`${nextYear}-06-15T21:30:00-07:00`).getTime()

      for (const slot of slots) {
        const slotStartMs = new Date(slot.start).getTime()
        const slotEndMs = new Date(slot.end).getTime()
        expect(slotStartMs).toBeGreaterThanOrEqual(containerStartMs)
        expect(slotEndMs).toBeLessThanOrEqual(containerEndMs)
      }
    })

    it('does not silently filter to zero when UTC midnight falls inside the container', () => {
      const day = createDay(nextYear, 6, 15)

      const crossMidnightUtc = fakeContainerEvent(
        `${nextYear}-06-15T23:00:00Z`,
        `${nextYear}-06-16T04:00:00Z`
      )

      const twoDay = createDay(nextYear, 6, 16)

      const slots = createSlots({
        start: day,
        end: twoDay,
        busy: [],
        leadTime: 0,
        duration: 60,
        containers: [crossMidnightUtc],
      })

      expect(slots.length).toBeGreaterThan(0)
    })
  })

  describe('boundary filter uses Date comparison not string comparison', () => {
    it('does not filter out slots whose string representations differ but represent the same range', () => {
      const day = createDay(nextYear, 7, 10)

      const container = fakeContainerEvent(
        `${nextYear}-07-10T10:00:00-07:00`,
        `${nextYear}-07-10T14:00:00-07:00`
      )

      const slots = createSlots({
        start: day,
        end: day,
        busy: [],
        leadTime: 0,
        duration: 60,
        containers: [container],
      })

      expect(slots.length).toBeGreaterThan(0)

      const dayStartMs = new Date(day.start).getTime()
      const dayEndMs = new Date(day.end).getTime()

      for (const slot of slots) {
        expect(new Date(slot.start).getTime()).toBeGreaterThanOrEqual(dayStartMs)
        expect(new Date(slot.end).getTime()).toBeLessThanOrEqual(dayEndMs)
      }
    })

    it('regression: UTC boundary strings vs local-offset slot strings must compare by instant', () => {
      const startDay = createDay(nextYear, 8, 20)
      const endDay = createDay(nextYear, 8, 20)

      const utcNoon = `${nextYear}-08-20T19:00:00Z`
      const utcEvening = `${nextYear}-08-20T22:00:00Z`
      const pacificNoon = `${nextYear}-08-20T12:00:00-07:00`
      const pacificEvening = `${nextYear}-08-20T15:00:00-07:00`

      expect(new Date(utcNoon).getTime()).toBe(new Date(pacificNoon).getTime())
      expect(new Date(utcEvening).getTime()).toBe(new Date(pacificEvening).getTime())

      const slotsUtc = createSlots({
        start: startDay,
        end: endDay,
        busy: [],
        leadTime: 0,
        duration: 60,
        containers: [fakeContainerEvent(utcNoon, utcEvening)],
      })

      const slotsPacific = createSlots({
        start: startDay,
        end: endDay,
        busy: [],
        leadTime: 0,
        duration: 60,
        containers: [fakeContainerEvent(pacificNoon, pacificEvening)],
      })

      expect(slotsUtc.length).toBe(slotsPacific.length)
      expect(slotsUtc.length).toBeGreaterThan(0)
    })
  })

  describe('cross-timezone equivalence of the same instant', () => {
    it('all offset formats for the same instant produce the same slot count', () => {
      const day = createDay(nextYear, 9, 5)
      const instantStartEpoch = new Date(`${nextYear}-09-05T20:00:00Z`).getTime()
      const instantEndEpoch = new Date(`${nextYear}-09-05T23:00:00Z`).getTime()

      const formats = [
        {
          start: `${nextYear}-09-05T20:00:00Z`,
          end: `${nextYear}-09-05T23:00:00Z`,
        },
        {
          start: `${nextYear}-09-05T13:00:00-07:00`,
          end: `${nextYear}-09-05T16:00:00-07:00`,
        },
        {
          start: `${nextYear}-09-05T16:00:00-04:00`,
          end: `${nextYear}-09-05T19:00:00-04:00`,
        },
        {
          start: `${nextYear}-09-05T15:00:00-05:00`,
          end: `${nextYear}-09-05T18:00:00-05:00`,
        },
        {
          start: `${nextYear}-09-06T05:00:00+09:00`,
          end: `${nextYear}-09-06T08:00:00+09:00`,
        },
      ]

      for (const fmt of formats) {
        expect(new Date(fmt.start).getTime()).toBe(instantStartEpoch)
        expect(new Date(fmt.end).getTime()).toBe(instantEndEpoch)
      }

      const slotCounts = formats.map((fmt) => {
        const slots = createSlots({
          start: day,
          end: day,
          busy: [],
          leadTime: 0,
          duration: 60,
          containers: [fakeContainerEvent(fmt.start, fmt.end)],
        })
        return slots.length
      })

      const uniqueCounts = new Set(slotCounts)
      expect(uniqueCounts.size).toBe(1)
      expect(slotCounts[0]).toBeGreaterThan(0)
    })
  })
})
