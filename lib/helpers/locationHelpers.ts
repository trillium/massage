import { LocationObject } from '@/lib/types'

/**
 * Flattens a LocationObject into a formatted address string, or returns the string if already provided
 * @param location - LocationObject containing street, city, and zip, or a string
 * @returns Formatted address string or the input string if already a string (e.g., "123 Main St, Los Angeles, 90210")
 */
export function flattenLocation(location: LocationObject | string | null | undefined): string {
  if (!location) {
    return ''
  }

  if (typeof location === 'string') {
    return location
  }

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

  return parts.join(', ')
}

/**
 * Flattens a LocationObject into a formatted address string with custom separators, or returns the string if already provided
 * @param location - LocationObject containing street, city, and zip, or a string
 * @param separator - Custom separator string (default: ', ')
 * @returns Formatted address string with custom separator or the input string if already a string
 */
export function flattenLocationWithSeparator(
  location: LocationObject | string | null | undefined,
  separator: string = ', '
): string {
  if (!location) {
    return ''
  }

  if (typeof location === 'string') {
    return location
  }

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

  return parts.join(separator)
}
