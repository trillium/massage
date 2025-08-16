import { LocationObject } from '@/lib/types'
import { unstable_cache } from 'next/cache'

export interface Coordinates {
  lat: number
  lng: number
}

export interface GeocodeResponse {
  success: boolean
  coordinates?: Coordinates
  error?: string
  cached?: boolean // Add flag to indicate if result was cached
  timestamp?: number // Add timestamp for cache tracking
}

/**
 * Internal geocoding function that performs the actual API call
 */
async function _geocodeLocation(location: string | LocationObject): Promise<GeocodeResponse> {
  try {
    // Convert LocationObject to address string if needed
    let address: string

    if (typeof location === 'string') {
      address = location
    } else {
      // Format LocationObject as address string
      const parts: string[] = []

      if (location.street?.trim()) {
        parts.push(location.street.trim())
      }

      if (location.city?.trim()) {
        parts.push(location.city.trim())
      }

      if (location.zip?.trim()) {
        parts.push(location.zip.trim())
      }

      if (parts.length === 0) {
        return {
          success: false,
          error: 'Invalid location: no valid address components found',
        }
      }

      address = parts.join(', ')
    }

    // Check if address is empty or whitespace
    if (!address.trim()) {
      return {
        success: false,
        error: 'Invalid location: empty address provided',
      }
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return {
        success: false,
        error: 'Google Maps API key not configured',
      }
    }

    const encodedAddress = encodeURIComponent(address)
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`

    console.log(`🌍 Making geocoding API call for: "${address}"`)
    const response = await fetch(geocodeUrl)

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error: ${response.status} ${response.statusText}`,
      }
    }

    const data = await response.json()

    if (data.status !== 'OK') {
      return {
        success: false,
        error: `Geocoding failed: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`,
      }
    }

    if (!data.results || data.results.length === 0) {
      return {
        success: false,
        error: 'No results found for the provided address',
      }
    }

    const result = data.results[0]
    const coordinates = result.geometry?.location

    if (
      !coordinates ||
      typeof coordinates.lat !== 'number' ||
      typeof coordinates.lng !== 'number'
    ) {
      return {
        success: false,
        error: 'Invalid coordinates returned from geocoding service',
      }
    }

    return {
      success: true,
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng,
      },
      cached: false, // Fresh API call
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Geocoding error:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown geocoding error occurred',
    }
  }
}

/**
 * Converts a location string or LocationObject into latitude/longitude coordinates
 * using the Google Maps Geocoding API. Results are cached for 5 minutes.
 *
 * @param location - Either a string address or LocationObject with street, city, zip
 * @returns Promise<GeocodeResponse> - Contains coordinates or error information
 */
const _cachedGeocodeLocation = unstable_cache(_geocodeLocation, ['geocode-location'], {
  revalidate: 60 * 5, // Cache for 5 minutes
  tags: ['geocoding'],
})

export async function geocodeLocation(location: string | LocationObject): Promise<GeocodeResponse> {
  const addressString =
    typeof location === 'string'
      ? location
      : [location.street, location.city, location.zip].filter(Boolean).join(', ')

  console.log(`🔍 Geocoding request for: "${addressString}"`)

  const startTime = Date.now()
  const result = await _cachedGeocodeLocation(location)
  const duration = Date.now() - startTime

  if (result.success) {
    // If the call was very fast (< 50ms), it's likely cached
    const wasCached = duration < 50
    console.log(
      `${wasCached ? '⚡ CACHED' : '🌍 API CALL'} geocoding result (${duration}ms): ${result.coordinates?.lat}, ${result.coordinates?.lng}`
    )

    return {
      ...result,
      cached: wasCached,
      timestamp: Date.now(),
    }
  }

  console.log(`❌ Geocoding failed (${duration}ms): ${result.error}`)
  return result
}

/**
 * Batch geocode multiple locations
 * Note: Be mindful of API rate limits when using this function
 *
 * @param locations - Array of location strings or LocationObjects
 * @param delay - Delay between requests in milliseconds (default: 100ms)
 * @returns Promise<GeocodeResponse[]> - Array of geocode responses
 */
export async function geocodeLocations(
  locations: (string | LocationObject)[],
  delay: number = 100
): Promise<GeocodeResponse[]> {
  const results: GeocodeResponse[] = []

  for (const location of locations) {
    const result = await geocodeLocation(location)
    results.push(result)

    // Add delay to respect API rate limits
    if (delay > 0 && locations.indexOf(location) < locations.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return results
}
