/**
 * @file CustomFieldsEndToEnd.test.ts
 * @description End-to-end test to verify that hotel-june configuration
 * properly loads custom fields through the entire system flow
 */

import { describe, it, expect } from 'vitest'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'

describe('Custom Fields End-to-End', () => {
  describe('hotel-june booking page', () => {
    it('should load custom fields configuration for hotel-june slug', async () => {
      const pageConfig = await createPageConfiguration({
        bookingSlug: 'hotel-june',
        resolvedParams: {},
        mocked: {
          start: '2025-08-06',
          end: '2025-08-07',
          busy: [],
          timeZone: 'America/Los_Angeles',
        },
      })

      expect(pageConfig.configuration).toBeDefined()
      expect(pageConfig.configuration?.customFields).toEqual({
        showHotelField: true,
        showNotesField: true,
      })
      expect(pageConfig.configuration?.customFields?.showParkingField).toBeUndefined()
    })

    it('should have the correct hotel-june configuration properties', async () => {
      const pageConfig = await createPageConfiguration({
        bookingSlug: 'hotel-june',
        resolvedParams: {},
        mocked: {
          start: '2025-08-06',
          end: '2025-08-07',
          busy: [],
          timeZone: 'America/Los_Angeles',
        },
      })

      const config = pageConfig.configuration
      expect(config?.bookingSlug).toEqual(['hotel-june'])
      expect(config?.type).toBe('fixed-location')
      expect(config?.title).toBe('Book an in-room massage at Hotel June!')
      expect(config?.text).toBe('Please provide your room number.')
      expect(config?.locationIsReadOnly).toBe(true)
      expect(config?.location).toEqual({
        street: 'Hotel June West LA, 8639 Lincoln Blvd',
        city: 'Los Angeles',
        zip: '90045',
      })
    })
  })

  describe('other booking pages', () => {
    it('should not have custom fields for foo slug', async () => {
      const pageConfig = await createPageConfiguration({
        bookingSlug: 'foo',
        resolvedParams: {},
        mocked: {
          start: '2025-08-06',
          end: '2025-08-07',
          busy: [],
          timeZone: 'America/Los_Angeles',
        },
      })

      expect(pageConfig.configuration?.customFields).toBeUndefined()
    })

    it('should not have custom fields for midnight-runners slug', async () => {
      const pageConfig = await createPageConfiguration({
        bookingSlug: 'midnight-runners',
        resolvedParams: {},
        mocked: {
          start: '2025-08-06',
          end: '2025-08-07',
          busy: [],
          timeZone: 'America/Los_Angeles',
        },
      })

      expect(pageConfig.configuration?.customFields).toBeUndefined()
    })
  })

  describe('configuration inheritance', () => {
    it('should maintain custom fields when overrides are applied', async () => {
      const pageConfig = await createPageConfiguration({
        bookingSlug: 'hotel-june',
        resolvedParams: {},
        overrides: {
          title: 'Overridden Title',
        },
        mocked: {
          start: '2025-08-06',
          end: '2025-08-07',
          busy: [],
          timeZone: 'America/Los_Angeles',
        },
      })

      expect(pageConfig.configuration?.title).toBe('Overridden Title')
      expect(pageConfig.configuration?.customFields).toEqual({
        showHotelField: true,
        showNotesField: true,
      })
    })

    it('should allow overriding custom fields', async () => {
      const pageConfig = await createPageConfiguration({
        bookingSlug: 'hotel-june',
        resolvedParams: {},
        overrides: {
          customFields: {
            showHotelField: false,
            showParkingField: true,
            showNotesField: true,
          },
        },
        mocked: {
          start: '2025-08-06',
          end: '2025-08-07',
          busy: [],
          timeZone: 'America/Los_Angeles',
        },
      })

      expect(pageConfig.configuration?.customFields).toEqual({
        showHotelField: false,
        showParkingField: true,
        showNotesField: true,
      })
    })
  })
})
