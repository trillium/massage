'use client'

import { useState } from 'react'
import clsx from 'clsx'
import DOMPurify from 'dompurify'
import { useSandbox } from '../SandboxProvider'
import { formatLocalDate, formatLocalTime } from '@/lib/availability/helpers'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import sandbox from '@/data/sandbox.json'
import type { SandboxEvent, SandboxEmail } from '../api/sandboxStore'
import { H2, H3 } from '@/components/ui/heading'
import {
  TextLgMuted,
  TextSmMedium,
  TextSmMuted,
  TextXsMedium,
  TextBase,
} from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

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

  const statusLabels = sandbox.eventCard.status

  return (
    <div className={clsx('rounded-lg border-2 p-4', statusColors[status])}>
      <Stack className="mb-3" direction="row" align="center" justify="between">
        <H3>
          {data.firstName} {data.lastName}
        </H3>
        <span
          className={clsx('rounded-full px-3 py-1 text-xs font-bold uppercase', {
            'bg-yellow-200 text-yellow-800': status === 'pending',
            'bg-green-200 text-green-800': status === 'confirmed',
            'bg-red-200 text-red-800': status === 'declined',
          })}
        >
          {statusLabels[status]}
        </span>
      </Stack>

      <div className="space-y-1 text-sm text-accent-700 dark:text-accent-300">
        <TextBase>
          <span className="font-medium">{sandbox.eventCard.labels.date}</span>{' '}
          {formatLocalDate(data.start, { timeZone })}
        </TextBase>
        <TextBase>
          <span className="font-medium">{sandbox.eventCard.labels.time}</span>{' '}
          {formatLocalTime(data.start, { timeZone })} {sandbox.eventCard.separators.timeSeparator}
          {formatLocalTime(data.end, { timeZone, timeZoneName: 'shortGeneric' })}
        </TextBase>
        <TextBase>
          <span className="font-medium">{sandbox.eventCard.labels.duration}</span> {data.duration}{' '}
          {sandbox.eventCard.durationUnit}
        </TextBase>
        {data.price && (
          <TextBase>
            <span className="font-medium">{sandbox.eventCard.labels.price}</span>{' '}
            {sandbox.eventCard.separators.priceCurrency}
            {data.price}
          </TextBase>
        )}
        <TextBase>
          <span className="font-medium">{sandbox.eventCard.labels.location}</span> {location}
        </TextBase>
        <TextBase>
          <span className="font-medium">{sandbox.eventCard.labels.phone}</span> {data.phone}
        </TextBase>
        <TextBase>
          <span className="font-medium">{sandbox.eventCard.labels.email}</span> {data.email}
        </TextBase>
      </div>

      {status === 'pending' && (
        <Stack className="mt-4" direction="row" gap={2}>
          <Button
            type="button"
            onClick={onApprove}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            {sandbox.eventCard.buttons.accept}
          </Button>
          <Button
            type="button"
            onClick={onDecline}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            {sandbox.eventCard.buttons.decline}
          </Button>
        </Stack>
      )}
    </div>
  )
}

function EmailCard({ email }: { email: SandboxEmail }) {
  const [expanded, setExpanded] = useState(false)

  const typeLabels = sandbox.emailCard.types

  return (
    <div className="rounded-lg border border-accent-200 bg-surface-50 dark:border-accent-700 dark:bg-surface-900">
      <Button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <Box>
          <TextXsMedium className="uppercase" status="muted">
            {typeLabels[email.type]}
          </TextXsMedium>
          <TextSmMedium>
            {sandbox.eventCard.labels.to} {email.to}
          </TextSmMedium>
          <TextSmMuted>{email.subject}</TextSmMuted>
        </Box>
        <span className="text-accent-400">{expanded ? '\u25B2' : '\u25BC'}</span>
      </Button>
      {expanded && (
        <div className="border-t border-accent-200 p-3 dark:border-accent-700">
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.body) }}
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
        <div className="rounded-lg border-2 border-dashed border-accent-300 p-12 text-center dark:border-accent-600">
          <TextLgMuted>{sandbox.adminView.empty}</TextLgMuted>
        </div>
      )}

      {pendingEvents.length > 0 && (
        <section>
          <H2 className="mb-3">
            {sandbox.adminView.sections.pending}
            {sandbox.adminView.countFormat.replace('{}', String(pendingEvents.length))}
          </H2>
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
          <H2 className="mb-3">
            {sandbox.adminView.sections.confirmed}
            {sandbox.adminView.countFormat.replace('{}', String(confirmedEvents.length))}
          </H2>
          <div className="space-y-3">
            {confirmedEvents.map((event) => (
              <EventCard key={event.calendarEventId} event={event} />
            ))}
          </div>
        </section>
      )}

      {declinedEvents.length > 0 && (
        <section>
          <H2 className="mb-3">
            {sandbox.adminView.sections.declined}
            {sandbox.adminView.countFormat.replace('{}', String(declinedEvents.length))}
          </H2>
          <div className="space-y-3">
            {declinedEvents.map((event) => (
              <EventCard key={event.calendarEventId} event={event} />
            ))}
          </div>
        </section>
      )}

      {hasEmails && (
        <section>
          <H2 className="mb-3">
            {sandbox.adminView.sections.emails}
            {sandbox.adminView.countFormat.replace('{}', String(state.emails.length))}
          </H2>
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
