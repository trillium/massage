/**
 * Creates a booking URL with location parameters extracted from a location string
 */
export function createBookingUrl(bookingSlug: string | null, location?: string): string {
  const baseUrl = bookingSlug ? `/${bookingSlug}` : '/book'

  if (!location) {
    return baseUrl
  }

  // Extract city and zip from location string if possible
  const params = new URLSearchParams()

  // Try to parse location string for common patterns
  // Example: "Hotel June West LA, 8639 Lincoln Blvd, Los Angeles, CA 90045"
  // Example: "123 Main St, Los Angeles, CA 90210"
  const cityMatch = location.match(/,\s*([^,]+),\s*[A-Z]{2}\s*(\d{5})/i)
  if (cityMatch) {
    const city = cityMatch[1].trim()
    const zip = cityMatch[2]
    params.set('city', city)
    params.set('zip', zip)
  } else {
    // If we can't parse it cleanly, try to extract city from common patterns
    const simpleCityMatch = location.match(/,\s*([^,\d]+)/i)
    if (simpleCityMatch) {
      params.set('city', simpleCityMatch[1].trim())
    }
  }

  // Extract street address (everything before first comma)
  const streetMatch = location.match(/^([^,]+)/)
  if (streetMatch) {
    params.set('street', streetMatch[1].trim())
  }

  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}
