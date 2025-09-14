/**
 * Creates a title "summary" for a calendar event.
 *
 * @function
 * @returns {string} Returns the summary string for an event.
 */
function eventSummary({ clientName, duration }: { clientName: string; duration: string }) {
  return `${duration} minute massage with ${clientName} - TrilliumMassage`
}

export default eventSummary
