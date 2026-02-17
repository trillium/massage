import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PreviousSlotOptions } from '../getPreviousSlotAvailability'
import { GoogleCalendarV3Event } from '@/lib/types'

const mockFetchAllCalendarEvents = vi.fn()
vi.mock('@/lib/fetch/fetchContainersByQuery', () => ({
  fetchAllCalendarEvents: mockFetchAllCalendarEvents,
}))

describe('Previous Slot Availability System', () => {
  let mockCurrentEvent: GoogleCalendarV3Event
  let mockExistingEvents: GoogleCalendarV3Event[]

  let getPreviousSlotAvailability: typeof import('../getPreviousSlotAvailability').getPreviousSlotAvailability
  let getAvailablePreviousSlots: typeof import('../getPreviousSlotAvailability').getAvailablePreviousSlots
  let convertToTimeListFormat: typeof import('../getPreviousSlotAvailability').convertToTimeListFormat
  let createMultiDurationAvailability: typeof import('../getPreviousSlotAvailability').createMultiDurationAvailability

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    mockCurrentEvent = {
      kind: 'calendar#event',
      etag: 'etag-1',
      id: 'current-event-id',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=current-event-id',
      created: '2025-08-01T00:00:00.000Z',
      updated: '2025-08-01T00:00:00.000Z',
      summary: 'Current Event',
      description: '',
      location: '123 Main St, Los Angeles, CA',
      creator: { email: 'test@example.com' },
      organizer: { email: 'test@example.com' },
      start: {
        dateTime: '2025-08-14T15:00:00.000Z',
        timeZone: 'UTC',
      },
      end: {
        dateTime: '2025-08-14T16:00:00.000Z',
        timeZone: 'UTC',
      },
      iCalUID: 'current-event-id@google.com',
      sequence: 0,
      reminders: { useDefault: true },
      eventType: 'default',
    }

    mockExistingEvents = []

    mockFetchAllCalendarEvents.mockResolvedValue({
      allEvents: mockExistingEvents,
    })

    const mod = await import('../getPreviousSlotAvailability')
    getPreviousSlotAvailability = mod.getPreviousSlotAvailability
    getAvailablePreviousSlots = mod.getAvailablePreviousSlots
    convertToTimeListFormat = mod.convertToTimeListFormat
    createMultiDurationAvailability = mod.createMultiDurationAvailability
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic slot generation working backwards', () => {
    it('generates slots that END at event start time', async () => {
      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 60,
        slotInterval: 15,
        maxMinutesBefore: 60,
      }

      const slots = await getPreviousSlotAvailability(options)

      expect(slots.length).toBeGreaterThan(0)

      // First slot should end exactly at event start time
      const firstSlot = slots[0]
      expect(firstSlot.endISO).toBe('2025-08-14T15:00:00.000Z')
      expect(firstSlot.startISO).toBe('2025-08-14T14:00:00.000Z')
      expect(firstSlot.duration).toBe(60)
      expect(firstSlot.available).toBe(true)
    })

    it('uses default location, not event location', async () => {
      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 60,
        slotInterval: 15,
        maxMinutesBefore: 60,
      }

      const slots = await getPreviousSlotAvailability(options)

      expect(slots[0].location).toEqual({
        street: '',
        city: '',
        zip: '',
      })
    })

    it('respects maxMinutesBefore parameter (60 minute default)', async () => {
      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 60,
        slotInterval: 15,
        maxMinutesBefore: 60,
      }

      const slots = await getPreviousSlotAvailability(options)

      // Latest slot ends at 15:00 (event start)
      // With 60-min duration, it starts at 14:00
      // Earliest slot should start at or after (15:00 - 60 min) = 14:00
      const earliestSlot = slots[slots.length - 1]
      const earliestStart = new Date(earliestSlot.startISO)
      const minSearchTime = new Date('2025-08-14T14:00:00.000Z')

      expect(earliestStart.getTime()).toBeGreaterThanOrEqual(minSearchTime.getTime())
    })

    it('generates multiple slots with correct interval spacing', async () => {
      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 30,
        slotInterval: 15,
        maxMinutesBefore: 60,
      }

      const slots = await getPreviousSlotAvailability(options)

      // Should have multiple slots spaced 15 minutes apart
      expect(slots.length).toBeGreaterThan(1)

      // Check that slots are spaced correctly
      const slot1EndTime = new Date(slots[0].endISO)
      const slot2EndTime = new Date(slots[1].endISO)
      const timeDiff = (slot1EndTime.getTime() - slot2EndTime.getTime()) / (1000 * 60)
      expect(timeDiff).toBe(15)
    })
  })

  describe('Conflict detection', () => {
    it('returns all slots as available when there are no existing events', async () => {
      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 30,
        slotInterval: 15,
        maxMinutesBefore: 60,
      }

      mockExistingEvents.length = 0
      const slots = await getPreviousSlotAvailability(options)

      expect(slots.every((slot) => slot.available)).toBe(true)
    })

    it('correctly identifies conflicts with existing events', async () => {
      const conflictingEvent: GoogleCalendarV3Event = {
        ...mockCurrentEvent,
        id: 'conflicting-event-id',
        summary: 'Conflicting Event',
        start: { dateTime: '2025-08-14T14:15:00.000Z', timeZone: 'UTC' },
        end: { dateTime: '2025-08-14T14:45:00.000Z', timeZone: 'UTC' },
      }
      mockExistingEvents.push(conflictingEvent)

      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 60,
        slotInterval: 15,
        maxMinutesBefore: 120,
      }

      const slots = await getPreviousSlotAvailability(options)

      // Find slot that would conflict (14:00-15:00 overlaps with 14:15-14:45)
      const conflictingSlot = slots.find((slot) => slot.startISO === '2025-08-14T14:00:00.000Z')
      expect(conflictingSlot?.available).toBe(false)
      expect(conflictingSlot?.conflictingEvent?.id).toBe('conflicting-event-id')

      // Should have some available slots (earlier slots shouldn't conflict)
      const availableSlots = slots.filter((slot) => slot.available)
      expect(availableSlots.length).toBeGreaterThan(0)
    })

    it('handles slots that end exactly when another event starts', async () => {
      const adjacentEvent: GoogleCalendarV3Event = {
        ...mockCurrentEvent,
        id: 'adjacent-event-id',
        summary: 'Adjacent Event',
        start: { dateTime: '2025-08-14T14:00:00.000Z', timeZone: 'UTC' },
        end: { dateTime: '2025-08-14T15:00:00.000Z', timeZone: 'UTC' },
      }
      mockExistingEvents.push(adjacentEvent)

      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 60,
        slotInterval: 15,
        maxMinutesBefore: 120,
      }

      const slots = await getPreviousSlotAvailability(options)

      // Slot ending at 14:00 should be available (no overlap with event starting at 14:00)
      const adjacentSlot = slots.find((slot) => slot.endISO === '2025-08-14T14:00:00.000Z')
      expect(adjacentSlot?.available).toBe(true)
    })
  })

  describe('Available slots filtering', () => {
    it('getAvailablePreviousSlots filters out conflicting slots', async () => {
      const conflictingEvent: GoogleCalendarV3Event = {
        ...mockCurrentEvent,
        id: 'conflicting-event-id',
        summary: 'Conflicting Event',
        start: { dateTime: '2025-08-14T14:00:00.000Z', timeZone: 'UTC' },
        end: { dateTime: '2025-08-14T14:30:00.000Z', timeZone: 'UTC' },
      }
      mockExistingEvents.push(conflictingEvent)

      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 60,
        slotInterval: 15,
        maxMinutesBefore: 90,
      }

      const availableSlots = await getAvailablePreviousSlots(options)

      expect(availableSlots.every((slot) => slot.available)).toBe(true)

      const hasConflictingSlot = availableSlots.some(
        (slot) => slot.startISO === '2025-08-14T14:00:00.000Z'
      )
      expect(hasConflictingSlot).toBe(false)
    })
  })

  describe('TimeList format conversion', () => {
    it('convertToTimeListFormat produces correct structure', async () => {
      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 30,
        slotInterval: 30,
        maxMinutesBefore: 60,
      }

      const slots = await getPreviousSlotAvailability(options)
      const timeListFormat = convertToTimeListFormat(slots)

      expect(timeListFormat.length).toBeGreaterThan(0)
      expect(timeListFormat[0]).toHaveProperty('start')
      expect(timeListFormat[0]).toHaveProperty('end')
      expect(timeListFormat[0]).toHaveProperty('location')
      expect(typeof timeListFormat[0].start).toBe('string')
      expect(typeof timeListFormat[0].end).toBe('string')
      expect(timeListFormat[0].location).toEqual({
        street: '',
        city: '',
        zip: '',
      })
    })
  })

  describe('Multi-duration cache creation', () => {
    it('createMultiDurationAvailability creates cache with default durations', async () => {
      const options = {
        currentEvent: mockCurrentEvent,
        maxMinutesBefore: 150,
      }

      const multiDuration = await createMultiDurationAvailability(options)

      expect(multiDuration.cache).toBeDefined()
      expect(multiDuration.cache.currentEvent).toBe(mockCurrentEvent)
      expect(multiDuration.cache.existingEvents).toBe(mockExistingEvents)

      expect(typeof multiDuration.getSlotsForDuration).toBe('function')
      expect(typeof multiDuration.getAvailableSlotsForDuration).toBe('function')
      expect(typeof multiDuration.getTimeListFormatForDuration).toBe('function')
      expect(typeof multiDuration.getAvailableDurations).toBe('function')
      expect(typeof multiDuration.isCacheValid).toBe('function')

      const defaultDurations = [30, 60, 90, 120]
      for (const duration of defaultDurations) {
        const slots = multiDuration.getSlotsForDuration(duration)
        expect(slots.length).toBeGreaterThan(0)
        expect(slots[0].duration).toBe(duration)
      }
    })

    it('pre-calculates slots for specified durations', async () => {
      const options = {
        currentEvent: mockCurrentEvent,
        durationOptions: [60, 90],
        maxMinutesBefore: 120,
      }

      const multiDuration = await createMultiDurationAvailability(options)

      const slots60 = multiDuration.getSlotsForDuration(60)
      const slots90 = multiDuration.getSlotsForDuration(90)

      expect(slots60.length).toBeGreaterThan(0)
      expect(slots90.length).toBeGreaterThan(0)
      expect(slots60[0].duration).toBe(60)
      expect(slots90[0].duration).toBe(90)
    })

    it('getSlotsForDuration calculates new durations on demand', async () => {
      const options = {
        currentEvent: mockCurrentEvent,
        durationOptions: [60],
        maxMinutesBefore: 90,
      }

      const multiDuration = await createMultiDurationAvailability(options)

      const slots45 = multiDuration.getSlotsForDuration(45)
      expect(slots45.length).toBeGreaterThan(0)
      expect(slots45[0].duration).toBe(45)

      const cachedSlots45 = multiDuration.getSlotsForDuration(45)
      expect(cachedSlots45).toBe(slots45)
    })

    it('getAvailableDurations returns only durations with available slots', async () => {
      const conflictingEvent: GoogleCalendarV3Event = {
        ...mockCurrentEvent,
        id: 'conflicting-event-id',
        summary: 'Conflicting Event',
        start: { dateTime: '2025-08-14T14:00:00.000Z', timeZone: 'UTC' },
        end: { dateTime: '2025-08-14T14:45:00.000Z', timeZone: 'UTC' },
      }
      mockExistingEvents.push(conflictingEvent)

      const options = {
        currentEvent: mockCurrentEvent,
        durationOptions: [30, 60, 90],
        maxMinutesBefore: 90,
      }

      const multiDuration = await createMultiDurationAvailability(options)
      const availableDurations = multiDuration.getAvailableDurations()

      expect(Array.isArray(availableDurations)).toBe(true)
      expect(availableDurations.every((d) => typeof d === 'number')).toBe(true)

      const sortedDurations = [...availableDurations].sort((a, b) => a - b)
      expect(availableDurations).toEqual(sortedDurations)
    })
  })

  describe('Cache validity', () => {
    it('isCacheValid returns true for fresh cache', async () => {
      const options = {
        currentEvent: mockCurrentEvent,
        maxMinutesBefore: 60,
      }

      const multiDuration = await createMultiDurationAvailability(options)
      expect(multiDuration.isCacheValid()).toBe(true)
    })
  })

  describe('Input validation', () => {
    it('throws error when currentEvent missing start.dateTime', async () => {
      const invalidEvent = {
        ...mockCurrentEvent,
        start: {},
      }

      const options: PreviousSlotOptions = {
        currentEvent: invalidEvent as GoogleCalendarV3Event,
        appointmentDuration: 60,
        slotInterval: 15,
        maxMinutesBefore: 60,
      }

      await expect(getPreviousSlotAvailability(options)).rejects.toThrow(
        'Current event must have a start dateTime'
      )
    })

    it('throws error when createMultiDurationAvailability missing start.dateTime', async () => {
      const invalidEvent = {
        ...mockCurrentEvent,
        start: {},
      }

      const options = {
        currentEvent: invalidEvent as GoogleCalendarV3Event,
        maxMinutesBefore: 60,
      }

      await expect(createMultiDurationAvailability(options)).rejects.toThrow(
        'Current event must have a start dateTime'
      )
    })
  })

  describe('Custom parameters', () => {
    it('respects custom appointmentDuration', async () => {
      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 90,
        slotInterval: 15,
        maxMinutesBefore: 120,
      }

      const slots = await getPreviousSlotAvailability(options)

      expect(slots[0].duration).toBe(90)

      const slot1Start = new Date(slots[0].startISO)
      const slot1End = new Date(slots[0].endISO)
      const durationMinutes = (slot1End.getTime() - slot1Start.getTime()) / (1000 * 60)
      expect(durationMinutes).toBe(90)
    })

    it('respects custom slotInterval', async () => {
      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 30,
        slotInterval: 30,
        maxMinutesBefore: 90,
      }

      const slots = await getPreviousSlotAvailability(options)

      expect(slots.length).toBeGreaterThan(1)

      const slot1EndTime = new Date(slots[0].endISO)
      const slot2EndTime = new Date(slots[1].endISO)
      const timeDiff = (slot1EndTime.getTime() - slot2EndTime.getTime()) / (1000 * 60)
      expect(timeDiff).toBe(30)
    })

    it('respects custom maxMinutesBefore', async () => {
      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 30,
        slotInterval: 15,
        maxMinutesBefore: 120,
      }

      const slots = await getPreviousSlotAvailability(options)

      const earliestSlot = slots[slots.length - 1]
      const earliestStart = new Date(earliestSlot.startISO)
      const eventStart = new Date(mockCurrentEvent.start.dateTime!)
      const timeDiff = (eventStart.getTime() - earliestStart.getTime()) / (1000 * 60)

      expect(timeDiff).toBeLessThanOrEqual(120)
    })
  })

  describe('Edge cases', () => {
    it('handles very short maxMinutesBefore windows', async () => {
      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 30,
        slotInterval: 15,
        maxMinutesBefore: 30,
      }

      const slots = await getPreviousSlotAvailability(options)

      expect(slots.length).toBeGreaterThan(0)

      slots.forEach((slot) => {
        const slotStart = new Date(slot.startISO)
        const eventStart = new Date(mockCurrentEvent.start.dateTime!)
        const minutesBefore = (eventStart.getTime() - slotStart.getTime()) / (1000 * 60)
        expect(minutesBefore).toBeLessThanOrEqual(30)
      })
    })

    it('handles duration longer than maxMinutesBefore', async () => {
      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 90,
        slotInterval: 15,
        maxMinutesBefore: 60,
      }

      const slots = await getPreviousSlotAvailability(options)

      // No slots should fit because 90-min duration exceeds 60-min window
      expect(slots.length).toBe(0)
    })

    it('handles events with conflicts at exact boundaries', async () => {
      const boundaryEvent: GoogleCalendarV3Event = {
        ...mockCurrentEvent,
        id: 'boundary-event-id',
        summary: 'Boundary Event',
        start: { dateTime: '2025-08-14T12:00:00.000Z', timeZone: 'UTC' },
        end: { dateTime: '2025-08-14T13:00:00.000Z', timeZone: 'UTC' },
      }
      mockExistingEvents.push(boundaryEvent)

      const options: PreviousSlotOptions = {
        currentEvent: mockCurrentEvent,
        appointmentDuration: 60,
        slotInterval: 15,
        maxMinutesBefore: 120,
      }

      const slots = await getPreviousSlotAvailability(options)

      // Slot starting at 13:00 should be available (no overlap with event ending at 13:00)
      const slotStartingAt13 = slots.find((slot) => slot.startISO === '2025-08-14T13:00:00.000Z')
      expect(slotStartingAt13?.available).toBe(true)
    })
  })

  describe('TimeList format for multiple durations', () => {
    it('getTimeListFormatForDuration returns correct format per duration', async () => {
      const options = {
        currentEvent: mockCurrentEvent,
        durationOptions: [30, 60],
        maxMinutesBefore: 90,
      }

      const multiDuration = await createMultiDurationAvailability(options)

      const timeList30 = multiDuration.getTimeListFormatForDuration(30)
      const timeList60 = multiDuration.getTimeListFormatForDuration(60)

      expect(timeList30.length).toBeGreaterThan(0)
      expect(timeList60.length).toBeGreaterThan(0)

      expect(timeList30[0]).toHaveProperty('start')
      expect(timeList30[0]).toHaveProperty('end')
      expect(timeList30[0]).toHaveProperty('location')

      const duration30 =
        (new Date(timeList30[0].end).getTime() - new Date(timeList30[0].start).getTime()) /
        (1000 * 60)
      const duration60 =
        (new Date(timeList60[0].end).getTime() - new Date(timeList60[0].start).getTime()) /
        (1000 * 60)

      expect(duration30).toBe(30)
      expect(duration60).toBe(60)
    })
  })
})
