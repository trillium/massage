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
  TextBaseMedium,
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
    <Box className={clsx('rounded-lg border-2 p-4', statusColors[status])}>
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

      <Box className="space-y-1 text-sm text-accent-700 dark:text-accent-300">
        <TextBase>
          <TextBaseMedium as="span">{sandbox.eventCard.labels.date}</TextBaseMedium>{' '}
          {formatLocalDate(data.start, { timeZone })}
        </TextBase>
        <TextBase>
          <TextBaseMedium as="span">{sandbox.eventCard.labels.time}</TextBaseMedium>{' '}
          {formatLocalTime(data.start, { timeZone })} {sandbox.eventCard.separators.timeSeparator}
          {formatLocalTime(data.end, { timeZone, timeZoneName: 'shortGeneric' })}
        </TextBase>
        <TextBase>
          <TextBaseMedium as="span">{sandbox.eventCard.labels.duration}</TextBaseMedium> {data.duration}{' '}
          {sandbox.eventCard.durationUnit}
        </TextBase>
        {data.price && (
          <TextBase>
            <TextBaseMedium as="span">{sandbox.eventCard.labels.price}</TextBaseMedium>{' '}
            {sandbox.eventCard.separators.priceCurrency}
            {data.price}
          </TextBase>
        )}
        <TextBase>
          <TextBaseMedium as="span">{sandbox.eventCard.labels.location}</TextBaseMedium> {location}
        </TextBase>
        {data.phone && data.phone.trim() !== '' && (
          <TextBase>
            <TextBaseMedium as="span">{sandbox.eventCard.labels.phone}</TextBaseMedium> {data.phone}
          </TextBase>
        )}
        {data.telegramHandle && data.telegramHandle.trim() !== '' && (
          <TextBase>
            <TextBaseMedium as="span">{sandbox.eventCard.labels.telegram}</TextBaseMedium>{' '}
            {data.telegramHandle}
          </TextBase>
        )}
        <TextBase>
          <TextBaseMedium as="span">{sandbox.eventCard.labels.email}</TextBaseMedium> {data.email}
        </TextBase>
      </Box>

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
    </Box>
  )
}

function EmailCard({ email }: { email: SandboxEmail }) {
  const [expanded, setExpanded] = useState(false)

  const typeLabels = sandbox.emailCard.types

  return (
    <Box className="rounded-lg border border-accent-200 bg-surface-50 dark:border-accent-700 dark:bg-surface-900">
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
        <TextBase as="span" status="muted">{expanded ? '\u25B2' : '\u25BC'}</TextBase>
      </Button>
      {expanded && (
        <Box className="border-t border-accent-200 p-3 dark:border-accent-700">
          <Box
            className="prose prose-sm dark:prose-invert max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.body) }}
          />
        </Box>
      )}
    </Box>
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
    <Box className="space-y-8">
      {!hasEvents && !hasEmails && (
        <Box className="rounded-lg border-2 border-dashed border-accent-300 p-12 text-center dark:border-accent-600">
          <TextLgMuted>{sandbox.adminView.empty}</TextLgMuted>
        </Box>
      )}

      {pendingEvents.length > 0 && (
        <section>
          <H2 className="mb-3">
            {sandbox.adminView.sections.pending}
            {sandbox.adminView.countFormat.replace('{}', String(pendingEvents.length))}
          </H2>
          <Box className="space-y-3">
            {pendingEvents.map((event) => (
              <EventCard
                key={event.calendarEventId}
                event={event}
                onApprove={() => approveEvent(event.calendarEventId)}
                onDecline={() => declineEvent(event.calendarEventId)}
              />
            ))}
          </Box>
        </section>
      )}

      {confirmedEvents.length > 0 && (
        <section>
          <H2 className="mb-3">
            {sandbox.adminView.sections.confirmed}
            {sandbox.adminView.countFormat.replace('{}', String(confirmedEvents.length))}
          </H2>
          <Box className="space-y-3">
            {confirmedEvents.map((event) => (
              <EventCard key={event.calendarEventId} event={event} />
            ))}
          </Box>
        </section>
      )}

      {declinedEvents.length > 0 && (
        <section>
          <H2 className="mb-3">
            {sandbox.adminView.sections.declined}
            {sandbox.adminView.countFormat.replace('{}', String(declinedEvents.length))}
          </H2>
          <Box className="space-y-3">
            {declinedEvents.map((event) => (
              <EventCard key={event.calendarEventId} event={event} />
            ))}
          </Box>
        </section>
      )}

      {hasEmails && (
        <section>
          <H2 className="mb-3">
            {sandbox.adminView.sections.emails}
            {sandbox.adminView.countFormat.replace('{}', String(state.emails.length))}
          </H2>
          <Box className="space-y-2">
            {[...state.emails].reverse().map((email, i) => (
              <EmailCard key={`${email.timestamp}-${i}`} email={email} />
            ))}
          </Box>
        </section>
      )}
    </Box>
  )
}
