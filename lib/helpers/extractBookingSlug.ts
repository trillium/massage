import { GoogleCalendarV3Event } from '@/lib/types'

/**
 * Helper function to extract booking slug from event data
 */
export function extractBookingSlug(event: GoogleCalendarV3Event): string | null {
  // Check description for eventBaseString patterns that might contain booking slug
  // Pattern: {bookingSlug}{eventBaseString} like "hotel-june__EVENT__"
  const eventStringMatch = event.description?.match(/([a-z0-9-]+)__EVENT__/)
  if (eventStringMatch) {
    return eventStringMatch[1]
  }

  // Look for other patterns that might indicate booking slug
  const summaryLower = (event.summary || '').toLowerCase()
  if (summaryLower.includes('hotel june') || summaryLower.includes('hotel-june')) {
    return 'hotel-june'
  }

  // Check for playa vista indicators
  if (summaryLower.includes('playa') || event.description?.toLowerCase().includes('playa')) {
    return 'playa-vista'
  }

  // Check for free 30 indicators
  if (
    summaryLower.includes('free') &&
    (summaryLower.includes('30') || summaryLower.includes('thirty'))
  ) {
    return 'free-30'
  }

  return null
}
