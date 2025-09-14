import { dumpData } from '../../../dataLoading'
import { ChairAppointmentBlockCalendarProps } from '../../../types'

/**
 * Creates a description for an onsite calendar event.
 *
 * @function
 * @returns {string} Returns the description string for an onsite event.
 */
function onsiteEventDescription(props: ChairAppointmentBlockCalendarProps) {
  return dumpData(props)
}

export default onsiteEventDescription
