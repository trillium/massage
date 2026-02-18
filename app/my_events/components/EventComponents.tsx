'use client'

import React from 'react'
import clsx from 'clsx'
import { GoogleCalendarV3Event } from '@/lib/types'
import { categorizeEvents } from '@/lib/helpers/eventHelpers'
import { EventCard } from './EventCard'

export function CategorizedEventList({
  events,
  isAdmin = false,
  eventTokens = {},
}: {
  events: GoogleCalendarV3Event[]
  isAdmin?: boolean
  eventTokens?: Record<string, string>
}) {
  const { pendingEvents, futureEvents, todayEvents, pastEvents } = categorizeEvents(events)

  const handleDownloadJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute('href', dataStr)
    downloadAnchorNode.setAttribute('download', 'events.json')
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleDownloadJSON}
            className="rounded bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Download All Events (JSON)
          </button>
        </div>
      )}

      {pendingEvents.length > 0 && (
        <>
          <EventDelimiter
            title="Pending Requests"
            count={pendingEvents.length}
            color="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
          />
          {pendingEvents.map((event, index) => (
            <EventCard
              key={event.id || `pending-${index}`}
              event={event}
              index={index}
              keyPrefix="pending"
              colorClasses={{
                container: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
                button: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600',
              }}
              isPending
              token={event.id ? eventTokens[event.id] : undefined}
            />
          ))}
        </>
      )}

      {todayEvents.length > 0 && (
        <>
          <EventDelimiter
            title="Today's Events"
            count={todayEvents.length}
            color="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          />
          {todayEvents.map((event, index) => (
            <EventCard
              key={event.id || `today-${index}`}
              event={event}
              index={index}
              keyPrefix="today"
              colorClasses={{
                container: 'border-green-500 bg-green-50 dark:bg-green-900/20',
                button: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
              }}
              token={event.id ? eventTokens[event.id] : undefined}
            />
          ))}
        </>
      )}

      {futureEvents.length > 0 && (
        <>
          <EventDelimiter
            title="Future Events"
            count={futureEvents.length}
            color="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          />
          {futureEvents.map((event, index) => (
            <EventCard
              key={event.id || `future-${index}`}
              event={event}
              index={index}
              keyPrefix="future"
              colorClasses={{
                container: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
                button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
              }}
              token={event.id ? eventTokens[event.id] : undefined}
            />
          ))}
        </>
      )}

      {pastEvents.length > 0 && (
        <>
          <EventDelimiter
            title="Past Events"
            count={pastEvents.length}
            color="bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300"
          />
          {pastEvents.map((event, index) => (
            <EventCard
              key={event.id || `past-${index}`}
              event={event}
              index={index}
              keyPrefix="past"
              colorClasses={{
                container: 'border-gray-400 bg-gray-50 dark:bg-gray-800/50',
                button: 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700',
              }}
              token={event.id ? eventTokens[event.id] : undefined}
            />
          ))}
        </>
      )}
    </div>
  )
}

export function EventDelimiter({
  title,
  count,
  color,
}: {
  title: string
  count: number
  color: string
}) {
  return (
    <div className={clsx('mt-6 mb-4 first:mt-0')}>
      <div className={clsx('flex items-center rounded-lg p-3', color)}>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm opacity-75">
            {count} event{count !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
