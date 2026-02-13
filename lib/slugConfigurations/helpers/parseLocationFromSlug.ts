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
 * Merge non-location params into a search string while preserving any existing location params.
 * This is the single source of truth for building URL search strings that include location.
 */
export function mergeParamsWithLocation(
  currentSearch: string,
  newParams: Record<string, string>
): string {
  const current = new URLSearchParams(currentSearch)

  const locationKeys = ['street', 'city', 'zip'] as const
  const preservedLocation: Record<string, string> = {}
  for (const key of locationKeys) {
    const val = current.get(key)
    if (val) preservedLocation[key] = val
  }

  const merged = new URLSearchParams({ ...newParams, ...preservedLocation })
  return merged.toString()
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
