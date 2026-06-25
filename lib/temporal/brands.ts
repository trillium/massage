import { format as formatTz } from 'date-fns-tz'

declare const DateStringBrand: unique symbol
declare const ZonedSlotStringBrand: unique symbol

export type DateString = string & { readonly [DateStringBrand]: 'YYYY-MM-DD' }
export type ZonedSlotString = string & { readonly [ZonedSlotStringBrand]: 'ISO-zoned' }

const DATE_STRING_PATTERN = /^\d{4}-\d{2}-\d{2}$/u

export function isDateString(value: string): value is DateString {
  return DATE_STRING_PATTERN.test(value)
}

export function assertDateString(value: string): DateString {
  if (!isDateString(value)) {
    throw new TypeError(`Expected YYYY-MM-DD, received: ${value}`)
  }
  return value
}

export function asZonedSlotString(value: string): ZonedSlotString {
  return value as ZonedSlotString
}

export function toDateString(zoned: ZonedSlotString | string, timeZone: string): DateString {
  return formatTz(zoned, 'yyyy-MM-dd', { timeZone }) as DateString
}
