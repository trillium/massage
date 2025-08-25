import { LocationObject } from '@/lib/types'

/**
 * Create a full location object with street address
 */
export function createLocationObject(street: string, city: string, zip: string): LocationObject {
  return {
    street,
    city,
    zip,
  }
}

/**
 * Create a full location object with street address
 */
export function stringToLocationObject(address: string): LocationObject {
  const [street, city, zip] = address.split(',').map((part) => part.trim())
  return {
    street: street || '',
    city: city || '',
    zip: zip || '',
  }
}

/**
 * Parse URL search parameters to extract location information
 */
export function parseLocationFromParams(searchParams: URLSearchParams): LocationObject {
  return {
    street: searchParams.get('street') || '',
    city: searchParams.get('city') || '',
    zip: searchParams.get('zip') || '',
  }
}

/**
 * Update URL with location object parameters
 */
export function updateUrlWithLocation(location: LocationObject): void {
  const params = new URLSearchParams(window.location.search)

  if (location.street) params.set('street', location.street)
  else params.delete('street')

  if (location.city) params.set('city', location.city)
  else params.delete('city')

  if (location.zip) params.set('zip', location.zip)
  else params.delete('zip')

  const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
  window.history.replaceState({}, '', newUrl)
}
