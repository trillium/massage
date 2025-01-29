import { fromZonedTime } from 'date-fns-tz'
import { formatDatetimeToString } from './helpers'
import { Day, DayWithStartEnd } from './types'

export function createDay(year: number, month: number, day: number): DayWithStartEnd {
  validateYearMonthDay(year, month, day)
  const { start, end } = dayToInterval({ year, month, day })

  return {
    year,
    month,
    day,
    start: formatDatetimeToString(start),
    end: formatDatetimeToString(end),
  }
}

export function dayToString(day: Day): string {
  const yearStr = day.year.toString().padStart(4, '0')
  const monthStr = day.month.toString().padStart(2, '0')
  const dayStr = day.day.toString().padStart(2, '0')
  return `${yearStr}-${monthStr}-${dayStr}`
}

export function dayToInterval(day: Day, timeZone?: string): { start: Date; end: Date } {
  const start = new Date(day.year, day.month - 1, day.day, 0, 0, 0, 0)
  const end = new Date(day.year, day.month - 1, day.day, 23, 59, 59, 999)
  return {
    start: timeZone ? fromZonedTime(start, timeZone) : new Date(start),
    end: timeZone ? fromZonedTime(end, timeZone) : new Date(end),
  }
}

export function getDay(day: Day): number {
  return day.day
}

export function validateYearMonthDay(year: number, month: number, day: number): void {
  if (month === undefined) {
    throw new Error('Missing month')
  }
  if (day === undefined) {
    throw new Error('Missing day')
  }

  if (month < 1 || month > 12) {
    throw new Error(`Invalid month ${month}`)
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  if (day < 1 || day > daysInMonth) {
    throw new Error(`Invalid day ${day} for month ${month}`)
  }
}

export function todayWithOffset(days = 0): DayWithStartEnd {
  const today = new Date()
  if (days) {
    today.setDate(today.getDate() + days)
  }
  return createDay(today.getFullYear(), today.getMonth() + 1, today.getDate())
}

export function dayFromString(input: string): DayWithStartEnd {
  const [year, month, day] = input.split('-').map(Number)
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    throw new TypeError(`Invalid date string: ${input}`)
  }
  validateYearMonthDay(year, month, day)
  return createDay(year, month, day)
}

export function dayFromDate(input: Date): DayWithStartEnd {
  const year = input.getUTCFullYear()
  const month = input.getUTCMonth() + 1
  const day = input.getUTCDate()
  return createDay(year, month, day)
}
