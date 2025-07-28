import { format } from 'date-fns'

/**
 * Formats a Date object to a string in the format "yyyy-MM-dd'T'HH:mm:ssXXX".
 *
 * @param {Date} datetimeObj - The Date object to format.
 * @returns {string} The formatted date string.
 */
export function formatDatetimeToString(datetimeObj: Date): string {
  return format(datetimeObj, "yyyy-MM-dd'T'HH:mm:ssXXX")
}

export function normalizeYYYYMMDD(date: string): string {
  const match = date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (!match) return date
  const [, year, month, day] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}
