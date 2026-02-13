import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createLocationObject,
  parseLocationFromParams,
  mergeParamsWithLocation,
  updateUrlWithLocation,
} from '../parseLocationFromSlug'
import { LocationObject } from '@/lib/types'

describe('parseLocationFromSlug', () => {
  describe('createLocationObject', () => {
    it('should create a location object with all provided fields', () => {
      const result = createLocationObject('123 Main St', 'Los Angeles', '90210')

      expect(result).toEqual({
        street: '123 Main St',
        city: 'Los Angeles',
        zip: '90210',
      })
    })

    it('should create a location object with empty strings', () => {
      const result = createLocationObject('', '', '')

      expect(result).toEqual({
        street: '',
        city: '',
        zip: '',
      })
    })
  })

  describe('parseLocationFromParams', () => {
    it('should parse all location parameters from URLSearchParams', () => {
      const params = new URLSearchParams('street=123+Main+St&city=Los+Angeles&zip=90210')
      const result = parseLocationFromParams(params)

      expect(result).toEqual({
        street: '123 Main St',
        city: 'Los Angeles',
        zip: '90210',
      })
    })

    it('should handle missing parameters with empty strings', () => {
      const params = new URLSearchParams('city=Los+Angeles')
      const result = parseLocationFromParams(params)

      expect(result).toEqual({
        street: '',
        city: 'Los Angeles',
        zip: '',
      })
    })

    it('should handle empty URLSearchParams', () => {
      const params = new URLSearchParams('')
      const result = parseLocationFromParams(params)

      expect(result).toEqual({
        street: '',
        city: '',
        zip: '',
      })
    })

    it('should handle URL-encoded special characters', () => {
      const params = new URLSearchParams(
        'street=123%20Main%20St%20%23A&city=Los%20Angeles&zip=90210-1234'
      )
      const result = parseLocationFromParams(params)

      expect(result).toEqual({
        street: '123 Main St #A',
        city: 'Los Angeles',
        zip: '90210-1234',
      })
    })

    it('should handle multiple values by taking the first one', () => {
      const params = new URLSearchParams('city=Los+Angeles&city=San+Diego&zip=90210')
      const result = parseLocationFromParams(params)

      expect(result).toEqual({
        street: '',
        city: 'Los Angeles',
        zip: '90210',
      })
    })
  })

  describe('mergeParamsWithLocation', () => {
    it('should preserve location params when adding new params', () => {
      const result = mergeParamsWithLocation('street=123+Main+St&city=LA&zip=90210', {
        duration: '60',
        selectedDate: '2026-03-01',
      })
      const params = new URLSearchParams(result)

      expect(params.get('duration')).toBe('60')
      expect(params.get('selectedDate')).toBe('2026-03-01')
      expect(params.get('street')).toBe('123 Main St')
      expect(params.get('city')).toBe('LA')
      expect(params.get('zip')).toBe('90210')
    })

    it('should work when no location params exist', () => {
      const result = mergeParamsWithLocation('', { duration: '90' })
      const params = new URLSearchParams(result)

      expect(params.get('duration')).toBe('90')
      expect(params.has('street')).toBe(false)
      expect(params.has('city')).toBe(false)
      expect(params.has('zip')).toBe(false)
    })

    it('should work when only partial location params exist', () => {
      const result = mergeParamsWithLocation('city=LA&zip=90210', { duration: '60' })
      const params = new URLSearchParams(result)

      expect(params.get('duration')).toBe('60')
      expect(params.has('street')).toBe(false)
      expect(params.get('city')).toBe('LA')
      expect(params.get('zip')).toBe('90210')
    })

    it('should not let newParams overwrite location keys', () => {
      const result = mergeParamsWithLocation('city=LA', { city: 'should-not-win' })
      const params = new URLSearchParams(result)

      expect(params.get('city')).toBe('LA')
    })

    it('should handle empty newParams with location preserved', () => {
      const result = mergeParamsWithLocation('street=123+Main&city=LA&zip=90210', {})
      const params = new URLSearchParams(result)

      expect(params.get('street')).toBe('123 Main')
      expect(params.get('city')).toBe('LA')
      expect(params.get('zip')).toBe('90210')
    })

    it('should drop non-location params from currentSearch', () => {
      const result = mergeParamsWithLocation('city=LA&oldParam=stale', { duration: '60' })
      const params = new URLSearchParams(result)

      expect(params.get('duration')).toBe('60')
      expect(params.get('city')).toBe('LA')
      expect(params.has('oldParam')).toBe(false)
    })
  })

  describe('updateUrlWithLocation', () => {
    // Mock window.location and history
    const mockLocation = {
      pathname: '/test',
      search: '',
    }
    const mockHistory = {
      replaceState: vi.fn(),
    }

    beforeEach(() => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      })

      // Mock window.history
      Object.defineProperty(window, 'history', {
        value: mockHistory,
        writable: true,
      })

      // Reset mocks
      mockHistory.replaceState.mockClear()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should add location parameters to URL', () => {
      mockLocation.search = ''
      const location: LocationObject = {
        street: '123 Main St',
        city: 'Los Angeles',
        zip: '90210',
      }

      updateUrlWithLocation(location)

      expect(mockHistory.replaceState).toHaveBeenCalledWith(
        {},
        '',
        '/test?street=123+Main+St&city=Los+Angeles&zip=90210'
      )
    })

    it('should update existing location parameters', () => {
      mockLocation.search = '?city=San+Diego&zip=92101&other=value'
      const location: LocationObject = {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        zip: '90210',
      }

      updateUrlWithLocation(location)

      // Should preserve other params and update location ones
      const call = mockHistory.replaceState.mock.calls[0]
      const newUrl = call[2] as string
      const urlParams = new URLSearchParams(newUrl.split('?')[1])

      expect(urlParams.get('street')).toBe('456 Oak Ave')
      expect(urlParams.get('city')).toBe('Los Angeles')
      expect(urlParams.get('zip')).toBe('90210')
      expect(urlParams.get('other')).toBe('value')
    })

    it('should remove empty location parameters', () => {
      mockLocation.search = '?street=123+Main+St&city=Los+Angeles&zip=90210'
      const location: LocationObject = {
        street: '',
        city: 'Los Angeles',
        zip: '',
      }

      updateUrlWithLocation(location)

      const call = mockHistory.replaceState.mock.calls[0]
      const newUrl = call[2] as string
      const urlParams = new URLSearchParams(newUrl.split('?')[1])

      expect(urlParams.has('street')).toBe(false)
      expect(urlParams.get('city')).toBe('Los Angeles')
      expect(urlParams.has('zip')).toBe(false)
    })

    it('should handle completely empty location object', () => {
      mockLocation.search = '?street=123+Main+St&city=Los+Angeles&zip=90210&other=value'
      const location: LocationObject = {
        street: '',
        city: '',
        zip: '',
      }

      updateUrlWithLocation(location)

      const call = mockHistory.replaceState.mock.calls[0]
      const newUrl = call[2] as string

      expect(newUrl).toBe('/test?other=value')
    })

    it('should create URL without query string when all params are removed', () => {
      mockLocation.search = '?street=123+Main+St&city=Los+Angeles&zip=90210'
      const location: LocationObject = {
        street: '',
        city: '',
        zip: '',
      }

      updateUrlWithLocation(location)

      expect(mockHistory.replaceState).toHaveBeenCalledWith({}, '', '/test')
    })
  })
})
