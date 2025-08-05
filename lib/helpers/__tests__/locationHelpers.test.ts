import { describe, it, expect } from 'vitest'
import { flattenLocation, flattenLocationWithSeparator } from '../locationHelpers'
import { LocationObject } from '@/lib/types'

describe('locationHelpers', () => {
  describe('flattenLocation', () => {
    it('should flatten a complete location object', () => {
      const location: LocationObject = {
        street: '123 Main St',
        city: 'Los Angeles',
        zip: '90210',
      }

      const result = flattenLocation(location)
      expect(result).toBe('123 Main St, Los Angeles, 90210')
    })

    it('should handle missing street', () => {
      const location: LocationObject = {
        street: '',
        city: 'Los Angeles',
        zip: '90210',
      }

      const result = flattenLocation(location)
      expect(result).toBe('Los Angeles, 90210')
    })

    it('should handle missing city', () => {
      const location: LocationObject = {
        street: '123 Main St',
        city: '',
        zip: '90210',
      }

      const result = flattenLocation(location)
      expect(result).toBe('123 Main St, 90210')
    })

    it('should handle missing zip', () => {
      const location: LocationObject = {
        street: '123 Main St',
        city: 'Los Angeles',
        zip: '',
      }

      const result = flattenLocation(location)
      expect(result).toBe('123 Main St, Los Angeles')
    })

    it('should handle only street', () => {
      const location: LocationObject = {
        street: '123 Main St',
        city: '',
        zip: '',
      }

      const result = flattenLocation(location)
      expect(result).toBe('123 Main St')
    })

    it('should handle empty location object', () => {
      const location: LocationObject = {
        street: '',
        city: '',
        zip: '',
      }

      const result = flattenLocation(location)
      expect(result).toBe('')
    })

    it('should handle null location', () => {
      const result = flattenLocation(null)
      expect(result).toBe('')
    })

    it('should handle undefined location', () => {
      const result = flattenLocation(undefined)
      expect(result).toBe('')
    })

    it('should trim whitespace from fields', () => {
      const location: LocationObject = {
        street: '  123 Main St  ',
        city: '  Los Angeles  ',
        zip: '  90210  ',
      }

      const result = flattenLocation(location)
      expect(result).toBe('123 Main St, Los Angeles, 90210')
    })
  })

  describe('flattenLocationWithSeparator', () => {
    it('should use custom separator', () => {
      const location: LocationObject = {
        street: '123 Main St',
        city: 'Los Angeles',
        zip: '90210',
      }

      const result = flattenLocationWithSeparator(location, ' | ')
      expect(result).toBe('123 Main St | Los Angeles | 90210')
    })

    it('should use no separator', () => {
      const location: LocationObject = {
        street: '123 Main St',
        city: 'Los Angeles',
        zip: '90210',
      }

      const result = flattenLocationWithSeparator(location, '')
      expect(result).toBe('123 Main StLos Angeles90210')
    })

    it('should default to comma separator when no separator provided', () => {
      const location: LocationObject = {
        street: '123 Main St',
        city: 'Los Angeles',
        zip: '90210',
      }

      const result = flattenLocationWithSeparator(location)
      expect(result).toBe('123 Main St, Los Angeles, 90210')
    })
  })
})
