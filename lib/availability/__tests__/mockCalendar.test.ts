import { describe, it, expect, beforeEach } from 'vitest'
import {
  MockCalendar,
  calendarEvent,
  containerEvent,
  memberEvent,
  regularEvent,
  resetEventCounter,
} from './mockCalendar'
import { checkSlotAvailability } from '../checkSlotAvailability'

describe('MockCalendar', () => {
  let cal: MockCalendar

  beforeEach(() => {
    resetEventCounter()
    cal = new MockCalendar()
  })

  describe('event factories', () => {
    it('creates events with unique ids', () => {
      const a = calendarEvent('A', '2026-03-10T10:00:00Z', '2026-03-10T11:00:00Z')
      const b = calendarEvent('B', '2026-03-10T12:00:00Z', '2026-03-10T13:00:00Z')
      expect(a.id).not.toBe(b.id)
    })

    it('creates container events with correct markers', () => {
      const c = containerEvent('scale23x', '2026-03-10T17:00:00Z', '2026-03-11T00:00:00Z')
      expect(c.summary).toContain('scale23x__EVENT__CONTAINER__')
      expect(c.description).toContain('scale23x__EVENT__CONTAINER__')
    })

    it('creates member events with marker in description', () => {
      const m = memberEvent('scale23x', '2026-03-10T17:00:00Z', '2026-03-10T17:30:00Z', 'Alice')
      expect(m.summary).toContain('Alice')
      expect(m.description).toContain('scale23x__EVENT__MEMBER__')
    })

    it('creates regular events without markers', () => {
      const r = regularEvent('Team Lunch', '2026-03-10T12:00:00Z', '2026-03-10T13:00:00Z')
      expect(r.summary).toBe('Team Lunch')
      expect(r.description).toBeUndefined()
    })
  })

  describe('search', () => {
    it('returns all events with empty query', () => {
      cal
        .addContainer('scale23x', '2026-03-10T17:00:00Z', '2026-03-11T00:00:00Z')
        .addMember('scale23x', '2026-03-10T17:00:00Z', '2026-03-10T17:30:00Z')
        .addRegular('Lunch', '2026-03-10T12:00:00Z', '2026-03-10T13:00:00Z')

      expect(cal.search('').length).toBe(3)
    })

    it('filters by query string in summary and description', () => {
      cal
        .addContainer('scale23x', '2026-03-10T17:00:00Z', '2026-03-11T00:00:00Z')
        .addMember('scale23x', '2026-03-10T17:00:00Z', '2026-03-10T17:30:00Z')
        .addMember('recharge', '2026-03-10T17:00:00Z', '2026-03-10T17:30:00Z')

      const scale = cal.search('scale23x__EVENT__')
      expect(scale.length).toBe(2)

      const members = cal.search('scale23x__EVENT__MEMBER__')
      expect(members.length).toBe(1)
    })

    it('filters by time range', () => {
      cal
        .addRegular('Morning', '2026-03-10T08:00:00Z', '2026-03-10T09:00:00Z')
        .addRegular('Afternoon', '2026-03-10T14:00:00Z', '2026-03-10T15:00:00Z')

      const morning = cal.search('', '2026-03-10T07:00:00Z', '2026-03-10T10:00:00Z')
      expect(morning.length).toBe(1)
      expect(morning[0].summary).toBe('Morning')
    })
  })

  describe('integration with checkSlotAvailability', () => {
    it('detects double booking via event containers', async () => {
      cal
        .addContainer('scale23x', '2026-03-10T17:00:00Z', '2026-03-11T00:00:00Z')
        .addMember('scale23x', '2026-03-10T18:00:00Z', '2026-03-10T18:30:00Z', 'Alice')

      const result = await checkSlotAvailability({
        start: '2026-03-10T18:00:00Z',
        end: '2026-03-10T18:30:00Z',
        padding: 0,
        eventBaseString: 'scale23x',
        getBusyTimesFn: cal.toGetBusyTimesFn(),
        getEventsBySearchQueryFn: cal.toGetEventsBySearchQueryFn(),
      })

      expect(result).toEqual({ available: false })
    })

    it('allows non-overlapping booking', async () => {
      cal
        .addContainer('scale23x', '2026-03-10T17:00:00Z', '2026-03-11T00:00:00Z')
        .addMember('scale23x', '2026-03-10T18:00:00Z', '2026-03-10T18:30:00Z', 'Alice')

      const result = await checkSlotAvailability({
        start: '2026-03-10T19:00:00Z',
        end: '2026-03-10T19:30:00Z',
        padding: 0,
        eventBaseString: 'scale23x',
        getBusyTimesFn: cal.toGetBusyTimesFn(),
        getEventsBySearchQueryFn: cal.toGetEventsBySearchQueryFn(),
      })

      expect(result).toEqual({ available: true })
    })

    it('blocks on regular events with general scope', async () => {
      cal
        .addContainer('free-30', '2026-03-10T09:00:00Z', '2026-03-10T17:00:00Z')
        .addRegular('Team Standup', '2026-03-10T10:00:00Z', '2026-03-10T10:30:00Z')

      const result = await checkSlotAvailability({
        start: '2026-03-10T10:00:00Z',
        end: '2026-03-10T10:30:00Z',
        padding: 0,
        eventBaseString: 'free-30',
        blockingScope: 'general',
        getBusyTimesFn: cal.toGetBusyTimesFn(),
        getEventsBySearchQueryFn: cal.toGetEventsBySearchQueryFn(),
      })

      expect(result).toEqual({ available: false })
    })

    it('ignores regular events with event scope', async () => {
      cal
        .addContainer('scale23x', '2026-03-10T17:00:00Z', '2026-03-11T00:00:00Z')
        .addRegular('Team Dinner', '2026-03-10T19:00:00Z', '2026-03-10T20:00:00Z')

      const result = await checkSlotAvailability({
        start: '2026-03-10T19:00:00Z',
        end: '2026-03-10T19:30:00Z',
        padding: 0,
        eventBaseString: 'scale23x',
        getBusyTimesFn: cal.toGetBusyTimesFn(),
        getEventsBySearchQueryFn: cal.toGetEventsBySearchQueryFn(),
      })

      expect(result).toEqual({ available: true })
    })

    it('respects padding between bookings', async () => {
      cal
        .addContainer('free-30', '2026-03-10T09:00:00Z', '2026-03-10T17:00:00Z')
        .addMember('free-30', '2026-03-10T10:00:00Z', '2026-03-10T10:30:00Z', 'Alice')

      const result = await checkSlotAvailability({
        start: '2026-03-10T10:35:00Z',
        end: '2026-03-10T11:05:00Z',
        padding: 15,
        eventBaseString: 'free-30',
        getBusyTimesFn: cal.toGetBusyTimesFn(),
        getEventsBySearchQueryFn: cal.toGetEventsBySearchQueryFn(),
      })

      expect(result).toEqual({ available: false })
    })

    it('isolates different container scopes', async () => {
      cal
        .addContainer('scale23x', '2026-03-10T17:00:00Z', '2026-03-11T00:00:00Z')
        .addContainer('recharge', '2026-03-10T17:00:00Z', '2026-03-11T00:00:00Z')
        .addMember('recharge', '2026-03-10T18:00:00Z', '2026-03-10T18:30:00Z', 'Bob')

      const result = await checkSlotAvailability({
        start: '2026-03-10T18:00:00Z',
        end: '2026-03-10T18:30:00Z',
        padding: 0,
        eventBaseString: 'scale23x',
        getBusyTimesFn: cal.toGetBusyTimesFn(),
        getEventsBySearchQueryFn: cal.toGetEventsBySearchQueryFn(),
      })

      expect(result).toEqual({ available: true })
    })
  })
})
