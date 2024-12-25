import { dumpData } from "../dataLoading"
import { AppointmentProps, ChairAppointmentBlockCalendarProps } from "../types"

/**
 * Creates a title "summary" for a calendar event.
 *
 * @function
 * @returns {string} Returns the summary string for an event.
 */
function eventSummary({
  eventContainerString,
}: {
  eventContainerString: string
}) {
  return eventContainerString
}

/**
 * Creates a description for a calendar event.
 *
 * @function
 * @returns {string} Returns the summary string for an event.
 */
function eventDescription(props: ChairAppointmentBlockCalendarProps) {
  return dumpData(props)
}

const templates = {
  eventSummary,
  eventDescription,
}

export default templates
