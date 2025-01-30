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
