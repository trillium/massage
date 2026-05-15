import { OWNER_AVAILABILITY, LEAD_TIME } from 'config'
import getAvailability from 'lib/availability/getAvailability'
import getPotentialTimes from 'lib/availability/getPotentialTimes'
import { mapStringsToDates } from 'lib/availability/helpers'

import type {
  GoogleCalendarV3Event,
  StringDateTimeIntervalAndLocation,
  StringInterval,
  DayWithStartEnd,
} from 'lib/types'

type CreateSlotsType = {
  start: DayWithStartEnd
  end: DayWithStartEnd
  busy: StringInterval[]
  leadTime: number
  duration: number
  durationBonus?: number
  containers?: GoogleCalendarV3Event[]
}

export function createSlots({
  start,
  end,
  busy,
  leadTime = LEAD_TIME,
  duration,
  durationBonus = 0,
  containers,
}: CreateSlotsType): StringDateTimeIntervalAndLocation[] {
  const startOfInterval = start.start
  const endOfInterval = end.end

  const potential = getPotentialTimes({
    start,
    end,
    duration: duration + durationBonus,
    availabilitySlots: OWNER_AVAILABILITY,
    containers: containers,
  })

  const offers = getAvailability({
    busy: mapStringsToDates(busy),
    potential,
    leadTime,
  })

  const slots = offers.filter((slot) => {
    return (
      new Date(slot.start) >= new Date(startOfInterval) &&
      new Date(slot.end) <= new Date(endOfInterval)
    )
  })

  return slots
}
