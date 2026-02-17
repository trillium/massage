import type { GoogleCalendarV3Event } from '@/lib/types'

type CalendarEventProps = GoogleCalendarV3Event & {
  handleSetStartEnd: ({ start, end }: { start: string; end: string }) => void
}

export default function CalendarEvent({
  summary,
  description,
  start,
  end,
  location,
  handleSetStartEnd,
}: CalendarEventProps) {
  const startDateTime = start.dateTime
    ? new Date(start.dateTime).toLocaleString('en-US', {
        timeZone: start.timeZone,
      })
    : start.date
      ? new Date(start.date).toLocaleDateString('en-US')
      : 'No start time'

  const endDateTime = end.dateTime
    ? new Date(end.dateTime).toLocaleString('en-US', {
        timeZone: end.timeZone,
      })
    : end.date
      ? new Date(end.date).toLocaleDateString('en-US')
      : 'No end time'

  return (
    <li className="pb-2">
      <h3 className="text-primary-400 font-bold">{summary}</h3>
      <div className="px-4">
        <p>{startDateTime}</p>
        <p>{endDateTime}</p>
        {location && <p>{location}</p>}
        {description && <p>{description}</p>}
      </div>
      <button
        className="border-primary-400 hover:bg-primary-400 m-4 rounded-md border px-4 py-2 hover:font-bold"
        onClick={() => {
          const startTime = start.dateTime || start.date || ''
          const endTime = end.dateTime || end.date || ''
          if (startTime && endTime) {
            handleSetStartEnd({ start: startTime, end: endTime })
          }
        }}
        disabled={!start.dateTime && !start.date}
      >
        Set Start/End
      </button>
    </li>
  )
}
