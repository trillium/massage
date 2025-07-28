/**
 * Utility functions for handling promotional configurations and date validation
 */

import { SlugConfigurationType } from '@/lib/types'
import { normalizeYYYYMMDD } from '../helpers'

/**
 * Checks if a promotional configuration has expired based on its promoEndDate
 * @param promoEndDate - The end date in YYYY-MM-DD format
 * @returns true if the promotion has expired, false otherwise
 */
export function isPromoExpired(promoEndDate: string | null | undefined): boolean {
  if (!promoEndDate) {
    return false // No end date means it doesn't expire
  }

  const normalized = normalizeYYYYMMDD(promoEndDate)

  const today = new Date()
  const endDate = new Date(normalized + 'T23:59:59') // End of day on the end date

  return today > endDate
}

/**
 * Checks if a promotional configuration is currently active
 * @param promoEndDate - The end date in YYYY-MM-DD format
 * @returns true if the promotion is active, false if expired
 */
export function isPromoActive(promoEndDate: string | null | undefined): boolean {
  return !isPromoExpired(promoEndDate)
}

/**
 * Gets a user-friendly message for expired promotions
 * @param promoEndDate - The end date in YYYY-MM-DD format
 * @returns A formatted message about the promotion expiration
 */
export function getPromoExpirationMessage(promoEndDate: string | null | undefined): string | null {
  if (!promoEndDate || isPromoActive(promoEndDate)) {
    return null
  }

  const endDate = new Date(
    new Date(promoEndDate + 'T23:59:59').toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
    })
  )
  const formattedDate = endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  })

  return `This promotion expired on ${formattedDate}.`
}

/**
 * Gets the number of days until a promotion expires
 * @param options - Object with promoEndDate and optional today (Date)
 * @returns Number of days until expiration, or null if no end date
 */
export function getDaysUntilExpiration({
  promoEndDate,
  today = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })),
}: {
  promoEndDate: string | null | undefined
  today?: Date
}): number | null {
  if (!promoEndDate) {
    return null
  }

  const endDate = new Date(
    new Date(promoEndDate + 'T23:59:59').toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
    })
  )
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}
