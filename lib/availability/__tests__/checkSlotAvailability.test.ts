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

function calendarEvent(
  summary: string,
  start: string,
  end: string,
  description?: string
): GoogleCalendarV3Event {
  return {
    id: `evt-${Math.random()}`,
    summary,
    description,
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

  describe('SCaLE 23x double-booking scenario', () => {
    const scale23xParams = {
      ...baseParams,
      start: '2026-03-08T17:40:00Z',
      end: '2026-03-08T17:45:00Z',
      padding: 0,
      eventBaseString: 'scale23x',
    }

    it('rejects a second booking when a confirmed member event exists at the same time', async () => {
      mockGetEventsBySearchQuery.mockResolvedValue([
        calendarEvent(
          'scale23x__EVENT__CONTAINER__',
          '2026-03-08T17:30:00Z',
          '2026-03-09T00:30:00Z'
        ),
        calendarEvent(
          '5 minute massage with Test Test - TrilliumMassage',
          '2026-03-08T17:40:00Z',
          '2026-03-08T17:45:00Z',
          'scale23x__EVENT__MEMBER__'
        ),
      ])

      const result = await checkSlotAvailability(scale23xParams)

      expect(result).toEqual({ available: false })
    })

    it('allows booking when no member events overlap', async () => {
      mockGetEventsBySearchQuery.mockResolvedValue([
        calendarEvent(
          'scale23x__EVENT__CONTAINER__',
          '2026-03-08T17:30:00Z',
          '2026-03-09T00:30:00Z'
        ),
        calendarEvent(
          '5 minute massage with Earlier Client - TrilliumMassage',
          '2026-03-08T17:30:00Z',
          '2026-03-08T17:35:00Z',
          'scale23x__EVENT__MEMBER__'
        ),
      ])

      const result = await checkSlotAvailability(scale23xParams)

      expect(result).toEqual({ available: true })
    })
  })

  describe('with active holds', () => {
    const mockGetActiveHolds =
      vi.fn<
        (start: string, end: string, excludeSessionId?: string) => Promise<DateTimeInterval[]>
      >()

    const holdParams = {
      ...baseParams,
      getActiveHoldsFn: mockGetActiveHolds,
    }

    beforeEach(() => {
      mockGetBusyTimes.mockResolvedValue([])
    })

    it('returns available when no active holds overlap', async () => {
      mockGetActiveHolds.mockResolvedValue([])

      const result = await checkSlotAvailability(holdParams)

      expect(result).toEqual({ available: true })
    })

    it('returns unavailable when an active hold overlaps', async () => {
      mockGetActiveHolds.mockResolvedValue([
        busyInterval('2024-06-15T10:00:00Z', '2024-06-15T11:00:00Z'),
      ])

      const result = await checkSlotAvailability(holdParams)

      expect(result).toEqual({ available: false })
    })

    it('passes sessionId to getActiveHoldsFn for exclusion', async () => {
      mockGetActiveHolds.mockResolvedValue([])
      const sessionId = 'abc-123'

      await checkSlotAvailability({ ...holdParams, sessionId })

      expect(mockGetActiveHolds).toHaveBeenCalledWith(
        '2024-06-15T10:00:00Z',
        '2024-06-15T11:00:00Z',
        sessionId
      )
    })

    it('checks holds with zero padding (no buffer on holds)', async () => {
      mockGetActiveHolds.mockResolvedValue([
        busyInterval('2024-06-15T11:00:00Z', '2024-06-15T12:00:00Z'),
      ])

      const result = await checkSlotAvailability(holdParams)

      expect(result).toEqual({ available: true })
    })

    it('rejects if calendar is clear but hold exists', async () => {
      mockGetActiveHolds.mockResolvedValue([
        busyInterval('2024-06-15T10:30:00Z', '2024-06-15T11:30:00Z'),
      ])

      const result = await checkSlotAvailability(holdParams)

      expect(result).toEqual({ available: false })
    })

    it('works with event containers and holds together', async () => {
      mockGetEventsBySearchQuery.mockResolvedValue([])
      mockGetActiveHolds.mockResolvedValue([
        busyInterval('2024-06-15T10:15:00Z', '2024-06-15T10:45:00Z'),
      ])

      const result = await checkSlotAvailability({
        ...holdParams,
        eventBaseString: 'scale23x',
      })

      expect(result).toEqual({ available: false })
    })

    it('skips hold check when getActiveHoldsFn is not provided', async () => {
      const result = await checkSlotAvailability(baseParams)

      expect(result).toEqual({ available: true })
      expect(mockGetActiveHolds).not.toHaveBeenCalled()
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

    it('returns unavailable if getActiveHoldsFn throws', async () => {
      const mockGetActiveHolds = vi.fn().mockRejectedValue(new Error('DB down'))
      mockGetBusyTimes.mockResolvedValue([])

      const result = await checkSlotAvailability({
        ...baseParams,
        getActiveHoldsFn: mockGetActiveHolds,
      })

      expect(result).toEqual({ available: false })
    })
  })
})
