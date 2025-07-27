import { formatLocalDate, formatLocalTime } from 'lib/availability/helpers'
import type { DateTimeIntervalWithTimezone } from 'lib/types'

/**
 * Converts a date-time interval to a human-readable string.
 *
 * @param {Object} interval - An object containing the start, end, and time zone of the interval.
 * @param {string|Date} interval.start - The start time of the interval.
 * @param {string|Date} interval.end - The end time of the interval.
 * @param {string} interval.timeZone - The time zone used to format the date and time.
 * @returns {string} A human-readable string representation of the date-time interval.
 */
export function intervalToHumanString({
  start,
  end,
  timeZone,
}: DateTimeIntervalWithTimezone): string {
  return `${formatLocalDate(start, {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'long',
    timeZone,
  })} – ${formatLocalTime(end, {
    hour: 'numeric',
    minute: 'numeric',
    timeZone,
    timeZoneName: 'longGeneric',
  })}`
}
