import type { StringDateTimeIntervalAndLocation } from '@/lib/types'

type StyleRule = (slot: StringDateTimeIntervalAndLocation) => string | false

export function timeslotsSpecial(
  slots: StringDateTimeIntervalAndLocation[],
  rule: StyleRule
): StringDateTimeIntervalAndLocation[] {
  return slots.map((slot) => {
    const className = rule(slot)
    if (!className) return slot

    return {
      ...slot,
      className,
    }
  })
}
