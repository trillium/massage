'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { useSandbox } from '../SandboxProvider'
import { formatLocalDate, formatLocalTime } from '@/lib/availability/helpers'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import type { SandboxEvent, SandboxEmail } from '../api/sandboxStore'

function EventCard({
  event,
  onApprove,
  onDecline,
}: {
  event: SandboxEvent
  onApprove?: () => void
  onDecline?: () => void
}) {
  const { data, status } = event
  const timeZone = data.timeZone || 'America/Los_Angeles'
  const location = flattenLocation(data.locationObject || data.locationString || '')

  const statusColors = {
    pending: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30',
    confirmed: 'border-green-400 bg-green-50 dark:bg-green-950/30',
    declined: 'border-red-400 bg-red-50 dark:bg-red-950/30',
  }

  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    declined: 'Declined',
  }

  return (
    <div className={clsx('rounded-lg border-2 p-4', statusColors[status])}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {data.firstName} {data.lastName}
        </h3>
        <span
          className={clsx('rounded-full px-3 py-1 text-xs font-bold uppercase', {
            'bg-yellow-200 text-yellow-800': status === 'pending',
            'bg-green-200 text-green-800': status === 'confirmed',
            'bg-red-200 text-red-800': status === 'declined',
          })}
        >
          {statusLabels[status]}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
        <p>
          <span className="font-medium">Date:</span> {formatLocalDate(data.start, { timeZone })}
        </p>
        <p>
          <span className="font-medium">Time:</span> {formatLocalTime(data.start, { timeZone })} -{' '}
          {formatLocalTime(data.end, { timeZone, timeZoneName: 'shortGeneric' })}
        </p>
        <p>
          <span className="font-medium">Duration:</span> {data.duration} min
        </p>
        {data.price && (
          <p>
            <span className="font-medium">Price:</span> ${data.price}
          </p>
        )}
        <p>
          <span className="font-medium">Location:</span> {location}
        </p>
        <p>
          <span className="font-medium">Phone:</span> {data.phone}
        </p>
        <p>
          <span className="font-medium">Email:</span> {data.email}
        </p>
      </div>

      {status === 'pending' && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={onApprove}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  )
}

function EmailCard({ email }: { email: SandboxEmail }) {
  const [expanded, setExpanded] = useState(false)

  const typeLabels = {
    'admin-approval': 'Admin Approval Email',
    'client-request': 'Client Request Confirmation',
    'client-confirm': 'Client Booking Confirmed',
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <div>
          <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            {typeLabels[email.type]}
          </span>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">To: {email.to}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{email.subject}</p>
        </div>
        <span className="text-gray-400">{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>
      {expanded && (
        <div className="border-t border-gray-200 p-3 dark:border-gray-700">
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </div>
      )}
    </div>
  )
}

export default function AdminView() {
  const { state, approveEvent, declineEvent } = useSandbox()

  const pendingEvents = state.events.filter((e) => e.status === 'pending')
  const confirmedEvents = state.events.filter((e) => e.status === 'confirmed')
  const declinedEvents = state.events.filter((e) => e.status === 'declined')

  const hasEvents = state.events.length > 0
  const hasEmails = state.emails.length > 0

  return (
    <div className="space-y-8">
      {!hasEvents && !hasEmails && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            No appointments yet. Switch to &quot;Book a Massage&quot; to create one.
          </p>
        </div>
      )}

      {pendingEvents.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
            Pending Requests ({pendingEvents.length})
          </h2>
          <div className="space-y-3">
            {pendingEvents.map((event) => (
              <EventCard
                key={event.calendarEventId}
                event={event}
                onApprove={() => approveEvent(event.calendarEventId)}
                onDecline={() => declineEvent(event.calendarEventId)}
              />
            ))}
          </div>
        </section>
      )}

      {confirmedEvents.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
            Confirmed ({confirmedEvents.length})
          </h2>
          <div className="space-y-3">
            {confirmedEvents.map((event) => (
              <EventCard key={event.calendarEventId} event={event} />
            ))}
          </div>
        </section>
      )}

      {declinedEvents.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
            Declined ({declinedEvents.length})
          </h2>
          <div className="space-y-3">
            {declinedEvents.map((event) => (
              <EventCard key={event.calendarEventId} event={event} />
            ))}
          </div>
        </section>
      )}

      {hasEmails && (
        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
            Captured Emails ({state.emails.length})
          </h2>
          <div className="space-y-2">
            {[...state.emails].reverse().map((email, i) => (
              <EmailCard key={`${email.timestamp}-${i}`} email={email} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
