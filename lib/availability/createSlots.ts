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
  containers?: GoogleCalendarV3Event[]
}

export function createSlots({
  start,
  end,
  busy,
  leadTime = LEAD_TIME,
  duration,
  containers,
}: CreateSlotsType): StringDateTimeIntervalAndLocation[] {
  const startOfInterval = start.start
  const endOfInterval = end.end

  const potential = getPotentialTimes({
    start,
    end,
    duration: duration,
    availabilitySlots: OWNER_AVAILABILITY,
    containers: containers,
  })

  const offers = getAvailability({
    busy: mapStringsToDates(busy),
    potential,
    leadTime,
  })

  const slots = offers.filter((slot, index) => {
    return slot.start >= startOfInterval && slot.end <= endOfInterval
  })

  return slots
}
