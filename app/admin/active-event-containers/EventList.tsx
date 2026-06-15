import { GoogleCalendarV3Event } from '@/lib/types'
import admin from '@/data/admin.json'
import { formatDateTime } from './formatDateTime'
import { H4 } from '@/components/ui/heading'

import { Code } from '@/components/ui/code'

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
      <H4 className="mb-3 flex items-center dark:text-white">
        <div className={`mr-2 h-3 w-3 rounded-full ${dotColor}`}></div>
        {label} {admin.activeEventContainers.eventCountOpen}
        {events.length}
        {admin.activeEventContainers.eventCountClose}
      </H4>
      {events.length === 0 ? (
        <div
          className={
            color === 'green'
              ? 'rounded-lg bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
              : 'rounded-lg bg-surface-100 p-3 text-accent-600 dark:bg-surface-700 dark:text-accent-400'
          }
        >
          {emptyMessage}
          {patternString && (
            <Code className="font-mono text-xs">
              {admin.activeEventContainers.patternStringSpace}
              {patternString}
            </Code>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className={`rounded-md border ${borderColor} p-3 text-sm`}>
              <div className="font-medium text-accent-900 dark:text-white">{event.summary}</div>
              <div className="mt-1 text-accent-600 dark:text-accent-400">
                {formatDateTime(event.start.dateTime)}
                {admin.activeEventContainers.eventTimesSeparator}
                {formatDateTime(event.end.dateTime)}
              </div>
              {event.description && (
                <div className="mt-1 text-xs text-accent-500 dark:text-accent-500">
                  {event.description.substring(0, 100)}
                  {event.description.length > 100 &&
                    admin.activeEventContainers.descriptionEllipsis}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
