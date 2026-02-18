import { AppointmentProps } from '@/lib/types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'

interface MockCalendarEventJsonProps {
  summary: string
  description: string
  submittedData: Partial<AppointmentProps>
  attendees: {
    email?: string
    displayName: string
    responseStatus: string
    organizer?: boolean
  }[]
}

export default function MockCalendarEventJson({
  summary,
  description,
  submittedData,
  attendees,
}: MockCalendarEventJsonProps) {
  const mockEvent = {
    id: `mock_event_${Date.now()}`,
    summary,
    description,
    start: {
      dateTime: submittedData.start,
      timeZone: submittedData.timeZone,
    },
    end: {
      dateTime: submittedData.end,
      timeZone: submittedData.timeZone,
    },
    location: submittedData.location ? flattenLocation(submittedData.location) : undefined,
    attendees,
    creator: {
      email: 'trillium@trilliummassage.la',
      displayName: 'Trillium Smith, LMT',
    },
    organizer: {
      email: 'trillium@trilliummassage.la',
      displayName: 'Trillium Smith, LMT',
    },
    status: 'confirmed',
    kind: 'calendar#event',
    etag: `"mock_etag_${Date.now()}"`,
    htmlLink: `https://calendar.google.com/calendar/event?eid=mock_${Date.now()}`,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    iCalUID: `mock_${Date.now()}@google.com`,
    sequence: 0,
    reminders: { useDefault: true },
  }

  return (
    <div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        Mock Calendar Event Object
      </h3>
      <details className="rounded bg-gray-100 dark:bg-gray-700">
        <summary className="cursor-pointer p-3 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600">
          View Raw Event Data (Click to expand)
        </summary>
        <pre className="overflow-auto p-3 text-xs text-gray-600 dark:text-gray-400">
          {JSON.stringify(mockEvent, null, 2)}
        </pre>
      </details>
    </div>
  )
}
