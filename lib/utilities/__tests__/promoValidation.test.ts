import {
  isPromoExpired,
  isPromoActive,
  getDaysUntilExpiration,
  getPromoExpirationMessage,
} from '../promoValidation'
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'

describe('Promo Validation', () => {
  // Mock Date.now() to have a consistent test environment
  const mockDate = new Date('2025-07-27T12:00:00Z')

  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  describe('isPromoExpired', () => {
    it('should return false for future dates', () => {
      expect(isPromoExpired('2025-12-31')).toBe(false)
    })

    it('should return true for past dates', () => {
      expect(isPromoExpired('2025-01-01')).toBe(true)
    })

    it('should return false for today', () => {
      expect(isPromoExpired('2025-07-27')).toBe(false)
    })

    it('should return false for null/undefined dates', () => {
      expect(isPromoExpired(null)).toBe(false)
      expect(isPromoExpired(undefined)).toBe(false)
    })
  })

  describe('isPromoActive', () => {
    it('should return true for future dates', () => {
      expect(isPromoActive('2025-12-31')).toBe(true)
    })

    it('should return false for past dates', () => {
      expect(isPromoActive('2025-01-01')).toBe(false)
    })

    it('should return true for null/undefined dates', () => {
      expect(isPromoActive(null)).toBe(true)
      expect(isPromoActive(undefined)).toBe(true)
    })
  })

  describe('getDaysUntilExpiration', () => {
    it('should return correct days for future dates', () => {
      expect(
        getDaysUntilExpiration({
          promoEndDate: '2025-07-30',
          today: new Date('2025-07-27T12:00:00-07:00'),
        })
      ).toBe(4)
    })

    it('should return 0 for past dates', () => {
      expect(
        getDaysUntilExpiration({
          promoEndDate: '2025-07-25',
          today: new Date('2025-07-27T12:00:00-07:00'),
        })
      ).toBe(0)
    })

    it('should return null for null/undefined dates', () => {
      expect(getDaysUntilExpiration({ promoEndDate: null })).toBe(null)
      expect(getDaysUntilExpiration({ promoEndDate: undefined })).toBe(null)
    })
  })

  describe('getPromoExpirationMessage', () => {
    it('should return message for expired promos', () => {
      const message = getPromoExpirationMessage('2025-01-01')
      expect(message).toContain('This promotion expired on')
      expect(message).toContain('January 1, 2025')
    })

    it('should return null for active promos', () => {
      expect(getPromoExpirationMessage('2025-12-31')).toBe(null)
    })

    it('should return null for null/undefined dates', () => {
      expect(getPromoExpirationMessage(null)).toBe(null)
      expect(getPromoExpirationMessage(undefined)).toBe(null)
    })
  })
})
