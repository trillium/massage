import { add, areIntervalsOverlapping, sub } from 'date-fns'

import type { DateTimeInterval, StringDateTimeIntervalAndLocation } from '../types'
import { SLOT_PADDING, LEAD_TIME } from '../../config'
import { formatDatetimeToString } from '../helpers'

/**
 * Takes an array of potential slots and an array of busy slots and returns
 * an array of available slots.
 *
 * @param {Object} obj - An object containing potential slots,
 *  busy slots, and padding.
 *
 * @param {DateTimeIntervalAndLocation[]} obj.potential - Potential slots.
 * @param {DateTimeInterval[]} obj.busy - Busy slots.
 * @param {number} [obj.padding] - Padding to apply to busy slots.
 *
 * @returns {DateTimeIntervalAndLocation[]} An array of available slots and location.
 */
export default function getAvailability({
  potential: potentialParam,
  busy,
  padding = SLOT_PADDING,
  leadTime = LEAD_TIME,
}: {
  potential?: StringDateTimeIntervalAndLocation[]
  busy?: DateTimeInterval[]
  padding?: number
  leadTime?: number
}): StringDateTimeIntervalAndLocation[] {
  // Our final array of available slots
  const openSlots: StringDateTimeIntervalAndLocation[] = []

  if (potentialParam === undefined || busy === undefined) {
    return []
  }

  // Create a DateTimeInterval that starts now and ends leadTime minutes from now
  const now = new Date()

  if (leadTime > 0) {
    const leadTimeBuffer = {
      start: now,
      end: add(now, { minutes: leadTime }),
    }

    //add leadTimeBuffer to front of busy array
    busy?.unshift(leadTimeBuffer)
  }

  const potential = potentialParam.filter((slot) => {
    const slotStartDate = new Date(slot.start)
    return slotStartDate > now
  }) // filter out slots that are in the past

  // Make a deep copy of the potential array
  const remainingSlots = [...potential]

  for (let i = 0; i < potential.length; i++) {
    const freeSlot = potential[i]

    // Check if the free slot overlaps with any busy slot
    let isFree = true
    for (let j = 0; j < busy.length; j++) {
      const busySlot = busy[j]
      // apply padding to busySlot .start and .end times eg:
      //   appointment is 10:00am to 11:00am,  padding is 30min
      //   10:00am - 30min = 09:30am (now includes front padding)
      //   11:00am + 30min = 11:30am (now includes back padding)
      const busyStart = sub(busySlot.start, { minutes: padding })
      const busyEnd = add(busySlot.end, { minutes: padding })

      // Convert string dates to Date objects for comparison
      const freeSlotInterval = {
        start: new Date(freeSlot.start),
        end: new Date(freeSlot.end),
      }

      if (areIntervalsOverlapping(freeSlotInterval, { start: busyStart, end: busyEnd })) {
        isFree = false
        break
      }
    }

    // If the free slot is not booked, add it to the result
    if (isFree) {
      openSlots.push(freeSlot)
    }

    // Remove the free slot from the remainingSlots array
    const index = remainingSlots.indexOf(freeSlot)
    if (index !== -1) {
      remainingSlots.splice(index, 1)
    }
  }

  return openSlots
}
