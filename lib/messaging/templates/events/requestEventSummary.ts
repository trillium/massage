import eventSummary from './eventSummary'

export default function requestEventSummary(props: { clientName: string; duration: string }) {
  return `REQUEST: ${eventSummary(props)}`
}
