import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkSlotAvailability } from '../checkSlotAvailability'
import type { DateTimeInterval } from '@/lib/types'
import type { GoogleCalendarV3Event } from '@/lib/calendarTypes'

const mockGetBusyTimes = vi.fn<(args: DateTimeInterval) => Promise<DateTimeInterval[]>>()
const mockGetEventsBySearchQuery =
  vi.fn<
    (args: {
      query: string
      start?: string | Date
      end?: string | Date
    }) => Promise<GoogleCalendarV3Event[]>
  >()

const PADDING = 15

const baseParams = {
  start: '2024-06-15T10:00:00Z',
  end: '2024-06-15T11:00:00Z',
  padding: PADDING,
  getBusyTimesFn: mockGetBusyTimes,
  getEventsBySearchQueryFn: mockGetEventsBySearchQuery,
}

function busyInterval(start: string, end: string): DateTimeInterval {
  return { start: new Date(start), end: new Date(end) }
}

function calendarEvent(summary: string, start: string, end: string): GoogleCalendarV3Event {
  return {
    id: `evt-${Math.random()}`,
    summary,
    start: { dateTime: start },
    end: { dateTime: end },
    kind: 'calendar#event',
    etag: '',
    status: 'confirmed',
    htmlLink: '',
    created: '',
    updated: '',
    iCalUID: '',
    sequence: 0,
    reminders: {},
  }
}

describe('checkSlotAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('without event containers (general busy-time check)', () => {
    it('returns available when no busy times overlap', async () => {
      mockGetBusyTimes.mockResolvedValue([
        busyInterval('2024-06-15T08:00:00Z', '2024-06-15T09:00:00Z'),
      ])

      const result = await checkSlotAvailability(baseParams)

      expect(result).toEqual({ available: true })
      expect(mockGetBusyTimes).toHaveBeenCalledOnce()
    })

    it('returns unavailable when busy time overlaps the slot', async () => {
      mockGetBusyTimes.mockResolvedValue([
        busyInterval('2024-06-15T10:30:00Z', '2024-06-15T11:30:00Z'),
      ])

      const result = await checkSlotAvailability(baseParams)

      expect(result).toEqual({ available: false })
    })

    it('returns unavailable when busy time overlaps with padding', async () => {
      mockGetBusyTimes.mockResolvedValue([
        busyInterval('2024-06-15T11:00:00Z', '2024-06-15T12:00:00Z'),
      ])

      const result = await checkSlotAvailability(baseParams)

      expect(result).toEqual({ available: false })
    })

    it('returns available with empty busy times', async () => {
      mockGetBusyTimes.mockResolvedValue([])

      const result = await checkSlotAvailability(baseParams)

      expect(result).toEqual({ available: true })
    })

    it('calls getBusyTimes when no eventBaseString provided', async () => {
      mockGetBusyTimes.mockResolvedValue([])

      await checkSlotAvailability(baseParams)

      expect(mockGetBusyTimes).toHaveBeenCalledWith({
        start: new Date('2024-06-15T10:00:00Z'),
        end: new Date('2024-06-15T11:00:00Z'),
      })
      expect(mockGetEventsBySearchQuery).not.toHaveBeenCalled()
    })
  })

  describe('with event containers (search-query check)', () => {
    const containerParams = {
      ...baseParams,
      eventBaseString: 'scale23x',
    }

    it('fetches all events with empty query for local filtering', async () => {
      mockGetEventsBySearchQuery.mockResolvedValue([])

      await checkSlotAvailability(containerParams)

      expect(mockGetEventsBySearchQuery).toHaveBeenCalledWith({
        query: '',
        start: '2024-06-15T10:00:00Z',
        end: '2024-06-15T11:00:00Z',
      })
    })

    it('returns available when no member events overlap', async () => {
      mockGetEventsBySearchQuery.mockResolvedValue([
        calendarEvent('scale23x__EVENT__MEMBER__', '2024-06-15T08:00:00Z', '2024-06-15T09:00:00Z'),
        calendarEvent('other__EVENT__MEMBER__', '2024-06-15T10:30:00Z', '2024-06-15T11:30:00Z'),
      ])

      const result = await checkSlotAvailability(containerParams)

      expect(result).toEqual({ available: true })
    })

    it('returns unavailable when member event overlaps', async () => {
      mockGetEventsBySearchQuery.mockResolvedValue([
        calendarEvent('scale23x__EVENT__MEMBER__', '2024-06-15T10:15:00Z', '2024-06-15T11:15:00Z'),
        calendarEvent('other__EVENT__MEMBER__', '2024-06-15T08:00:00Z', '2024-06-15T09:00:00Z'),
      ])

      const result = await checkSlotAvailability(containerParams)

      expect(result).toEqual({ available: false })
    })

    it('filters matching members from mixed results', async () => {
      mockGetEventsBySearchQuery.mockResolvedValue([
        calendarEvent('scale23x__EVENT__MEMBER__', '2024-06-15T10:15:00Z', '2024-06-15T11:15:00Z'),
        calendarEvent('other__EVENT__MEMBER__', '2024-06-15T10:15:00Z', '2024-06-15T11:15:00Z'),
        calendarEvent(
          'scale23x__EVENT__CONTAINER__',
          '2024-06-15T09:00:00Z',
          '2024-06-15T17:00:00Z'
        ),
        calendarEvent('Team Lunch', '2024-06-15T12:00:00Z', '2024-06-15T13:00:00Z'),
      ])

      const result = await checkSlotAvailability(containerParams)

      expect(result).toEqual({ available: false })
    })

    it('uses local filtering instead of getBusyTimes when blockingScope is general', async () => {
      mockGetEventsBySearchQuery.mockResolvedValue([
        calendarEvent('Team Lunch', '2024-06-15T10:30:00Z', '2024-06-15T11:30:00Z'),
      ])

      const result = await checkSlotAvailability({
        ...containerParams,
        blockingScope: 'general',
      })

      expect(result).toEqual({ available: false })
      expect(mockGetEventsBySearchQuery).toHaveBeenCalled()
      expect(mockGetBusyTimes).not.toHaveBeenCalled()
    })
  })

  describe('error handling (fail-closed)', () => {
    it('returns unavailable if getBusyTimes throws', async () => {
      mockGetBusyTimes.mockRejectedValue(new Error('API down'))

      const result = await checkSlotAvailability(baseParams)

      expect(result).toEqual({ available: false })
    })

    it('returns unavailable if getEventsBySearchQuery throws', async () => {
      mockGetEventsBySearchQuery.mockRejectedValue(new Error('API down'))

      const result = await checkSlotAvailability({
        ...baseParams,
        eventBaseString: 'scale23x',
      })

      expect(result).toEqual({ available: false })
    })
  })
})
