import { GoogleCalendarV3Event } from '@/lib/types'
import { formatDateTime } from './formatDateTime'

interface EventListProps {
  events: GoogleCalendarV3Event[]
  color: 'green' | 'orange'
  label: string
  emptyMessage: string
  patternString?: string
}

export function EventList({ events, color, label, emptyMessage, patternString }: EventListProps) {
  const dotColor = color === 'green' ? 'bg-green-500' : 'bg-orange-500'
  const borderColor =
    color === 'green'
      ? 'border-green-200 dark:border-green-700'
      : 'border-orange-200 dark:border-orange-700'

  return (
    <div>
      <h4 className="mb-3 flex items-center text-base font-medium text-gray-900 dark:text-white">
        <div className={`mr-2 h-3 w-3 rounded-full ${dotColor}`}></div>
        {label} ({events.length})
      </h4>
      {events.length === 0 ? (
        <div
          className={
            color === 'green'
              ? 'rounded-lg bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
              : 'rounded-lg bg-gray-50 p-3 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }
        >
          {emptyMessage}
          {patternString && <code className="font-mono text-xs"> {patternString}</code>}
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className={`rounded-md border ${borderColor} p-3 text-sm`}>
              <div className="font-medium text-gray-900 dark:text-white">{event.summary}</div>
              <div className="mt-1 text-gray-600 dark:text-gray-400">
                {formatDateTime(event.start.dateTime)} - {formatDateTime(event.end.dateTime)}
              </div>
              {event.description && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  {event.description.substring(0, 100)}
                  {event.description.length > 100 && '...'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
