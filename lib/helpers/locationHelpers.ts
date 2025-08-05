import { LocationObject } from '@/lib/types'

/**
 * Flattens a LocationObject into a formatted address string
 * @param location - LocationObject containing street, city, and zip
 * @returns Formatted address string (e.g., "123 Main St, Los Angeles, 90210")
 */
export function flattenLocation(location: LocationObject | null | undefined): string {
  if (!location) {
    return ''
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
 * Flattens a LocationObject into a formatted address string with custom separators
 * @param location - LocationObject containing street, city, and zip
 * @param separator - Custom separator string (default: ', ')
 * @returns Formatted address string with custom separator
 */
export function flattenLocationWithSeparator(
  location: LocationObject | null | undefined,
  separator: string = ', '
): string {
  if (!location) {
    return ''
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
