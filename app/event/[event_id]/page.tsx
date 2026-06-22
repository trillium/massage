export const dynamic = 'force-dynamic'

import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import { verifyEventToken } from '@/lib/eventToken'
import { parseEventSummary } from '@/lib/helpers/parseEventSummary'
import { formatLocalDate, formatLocalTime } from '@/lib/availability/helpers'
import SectionContainer from '@/components/SectionContainer'
import Link from '@/components/Link'
import { OWNER_TIMEZONE } from 'config'
import { createBookingUrl } from '@/lib/helpers/createBookingUrl'
import { extractBookingSlug } from '@/lib/helpers/extractBookingSlug'
import CancelButton from './CancelButton'
import RescheduleButton from './RescheduleButton'
import EditForm from './EditForm'
import { parseEditableFields } from '@/lib/helpers/parseEventDescription'
import { stringToLocationObject } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import { gratuityLinks } from '@/data/paymentLinks'
import eventContent from '@/data/event.json'
import {
  TextLg,
  TextSmMuted,
  TextSmMedium,
  TextSmSemibold,
  TextXsMuted,
  TextBase,
} from '@/components/ui/text'
import { H1 } from '@/components/ui/heading'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'
import { StatusBadge, DetailRow } from './EventStatusComponents'

interface EventPageProps {
  params: Promise<{ event_id: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { event_id } = await params
  const { token } = await searchParams

  if (!token) {
    return (
      <SectionContainer>
        <Box className="py-16 text-center">
          <H1 className="dark:text-white">{eventContent.page.accessDenied.heading}</H1>
          <TextBase status="secondary" className="mt-2">
            {eventContent.page.accessDenied.message}
          </TextBase>
        </Box>
      </SectionContainer>
    )
  }

  const result = verifyEventToken(token, event_id)

  if (!result.valid) {
    return (
      <SectionContainer>
        <Box className="py-16 text-center">
          <H1 className="dark:text-white">{eventContent.page.invalidLink.heading}</H1>
          <TextBase status="secondary" className="mt-2">
            {result.error === 'Token expired'
              ? eventContent.page.invalidLink.expiredMessage
              : eventContent.page.invalidLink.invalidMessage}
          </TextBase>
        </Box>
      </SectionContainer>
    )
  }

  const event = await fetchSingleEvent(event_id)

  if (!event) {
    return (
      <SectionContainer>
        <Box className="py-16 text-center">
          <H1 className="dark:text-white">{eventContent.page.notFound.heading}</H1>
          <TextBase status="secondary" className="mt-2">
            {eventContent.page.notFound.message}
          </TextBase>
        </Box>
      </SectionContainer>
    )
  }

  const { status, duration, clientName } = parseEventSummary(event.summary || '', event.status)

  const startTime = event.start?.dateTime
  const endTime = event.end?.dateTime

  const tz = { timeZone: OWNER_TIMEZONE }
  const dateString = startTime ? formatLocalDate(startTime, tz) : null
  const startString = startTime ? formatLocalTime(startTime, tz) : null
  const endString = endTime
    ? formatLocalTime(endTime, { ...tz, timeZoneName: 'shortGeneric' })
    : null

  const bookingSlug = extractBookingSlug(event)
  const editableFields = event.description ? parseEditableFields(event.description) : null
  const displayEmail = editableFields?.email || result.payload.email
  const clientInfo = {
    firstName: editableFields?.firstName,
    lastName: editableFields?.lastName,
    email: result.payload.email,
    phone: editableFields?.phone,
  }
  const bookingUrl = createBookingUrl(bookingSlug, event.location, clientInfo)
  const rescheduleUrl = createBookingUrl(bookingSlug, event.location, clientInfo, {
    eventId: event_id,
    token,
  })

  return (
    <SectionContainer>
      <Box className="py-8 sm:py-12">
        <Box className="mx-auto max-w-2xl">
          <H1 className="sm:text-4xl" status="primary">
            {eventContent.page.heading}
          </H1>

          <Box className="mt-6">
            <StatusBadge status={status} />
          </Box>

          {status === 'pending' && (
            <TextSmMuted className="mt-4">{eventContent.page.pendingMessage}</TextSmMuted>
          )}

          <Box className="mt-8 space-y-3 rounded-2xl border-2 border-accent-200 bg-surface-100 p-6 dark:border-accent-700 dark:bg-surface-800/50">
            {dateString && duration && (
              <Box variant="accentCard" className="mb-4 bg-primary-50/30">
                <TextLg className="text-primary-800 dark:text-primary-400 text-lg font-semibold">
                  {' '}
                  {/* ds-ignore */}
                  {dateString}
                  {eventContent.page.dateTimeSeparator}
                  {duration}
                  {eventContent.page.massageLabel}
                </TextLg>
                {startString && endString && (
                  <TextSmMuted>
                    {startString}
                    {eventContent.page.timeRangeSeparator}
                    {endString}
                  </TextSmMuted>
                )}
              </Box>
            )}

            {clientName && (
              <DetailRow label={eventContent.page.detailRow.name} value={clientName} />
            )}
            {event.location && (
              <DetailRow label={eventContent.page.detailRow.location} value={event.location} />
            )}
            <DetailRow label={eventContent.page.detailRow.email} value={displayEmail} />
          </Box>

          {status !== 'cancelled' && (
            <Stack className="mt-8" direction="row" wrap align="start" gap={3}>
              <CancelButton eventId={event_id} token={token} />
              <RescheduleButton rescheduleUrl={rescheduleUrl} />
              <EditForm
                eventId={event_id}
                token={token}
                initialValues={
                  editableFields
                    ? { ...editableFields, email: displayEmail }
                    : {
                        firstName: '',
                        lastName: '',
                        email: displayEmail,
                        phone: '',
                        location: stringToLocationObject(event.location || ''),
                      }
                }
              />
            </Stack>
          )}

          {status !== 'cancelled' && (
            <Box className="mt-8">
              <Stack className="mb-3" direction="row" align="center" gap={3}>
                <Box className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
                <TextSmMedium status="muted">{eventContent.page.appreciation}</TextSmMedium>
                <Box className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
              </Stack>
              <Stack direction="col" gap={3}>
                {gratuityLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    classes={`flex items-center gap-4 rounded-2xl border-2 ${link.accent} bg-surface-50 p-4 transition-all hover:shadow-md hover:-translate-y-0.5 dark:bg-surface-900`}
                  >
                    <link.icon className={`shrink-0 text-2xl ${link.iconColor}`} />
                    <Box>
                      <TextSmSemibold as="span">{link.label}</TextSmSemibold>
                      <TextSmMuted>{link.description}</TextSmMuted>
                    </Box>
                  </Link>
                ))}
              </Stack>
            </Box>
          )}

          {status === 'cancelled' && (
            <Box className="mt-8 rounded-2xl border-2 border-accent-200 bg-surface-100 p-6 text-center dark:border-accent-700 dark:bg-surface-800/50">
              <TextLg className="text-lg font-medium text-accent-800 dark:text-accent-200">
                {' '}
                {/* ds-ignore */}
                {eventContent.page.cancelledMessage}
              </TextLg>
              <Link
                href={bookingUrl}
                className="bg-primary-600 hover:bg-primary-700 mt-4 inline-block rounded-lg px-6 py-2.5 font-medium text-white transition-colors"
              >
                {eventContent.page.bookNewAppointment}
              </Link>
            </Box>
          )}

          <Box className="mt-12 border-t border-accent-200 pt-8 dark:border-accent-700">
            <Stack className="text-center" direction="col" align="center" gap={4}>
              {status !== 'cancelled' && (
                <Link
                  href={bookingUrl}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                >
                  {eventContent.page.bookAnotherSession}
                </Link>
              )}
              <TextXsMuted>
                {eventContent.page.allBookingsPrompt}
                <Link
                  href="/auth/login?redirectedFrom=/my_events"
                  className="text-primary-500 hover:text-primary-600 dark:text-primary-400 font-medium"
                >
                  {eventContent.page.signIn}
                </Link>
              </TextXsMuted>
            </Stack>
          </Box>
        </Box>
      </Box>
    </SectionContainer>
  )
}
