import { AppointmentProps } from '@/lib/types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { H3 } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'

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

const LABEL_HEADING = 'Mock Calendar Event Object'
const LABEL_SUMMARY = 'View Raw Event Data (Click to expand)'

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
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    iCalUID: `mock_${Date.now()}@google.com`,
    sequence: 0,
    reminders: { useDefault: true },
  }

  return (
    <Box>
      <H3 className="mb-2 dark:text-white">{LABEL_HEADING}</H3>
      <details className="rounded bg-surface-200 dark:bg-surface-700">
        <summary className="cursor-pointer p-3 text-sm font-medium text-accent-700 hover:bg-surface-300 dark:text-accent-300 dark:hover:bg-surface-600">
          {LABEL_SUMMARY}
        </summary>
        <pre className="overflow-auto p-3 text-xs text-accent-600 dark:text-accent-400">
          {JSON.stringify(mockEvent, null, 2)}
        </pre>
      </details>
    </Box>
  )
}
