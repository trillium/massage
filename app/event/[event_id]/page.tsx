import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import { verifyEventToken } from '@/lib/eventToken'
import { parseEventSummary } from '@/lib/helpers/parseEventSummary'
import { formatLocalDate, formatLocalTime } from '@/lib/availability/helpers'
import SectionContainer from '@/components/SectionContainer'
import Link from '@/components/Link'
import { createBookingUrl } from '@/lib/helpers/createBookingUrl'
import { extractBookingSlug } from '@/lib/helpers/extractBookingSlug'

interface EventPageProps {
  params: Promise<{ event_id: string }>
  searchParams: Promise<{ token?: string }>
}

function StatusBadge({ status }: { status: 'pending' | 'confirmed' | 'cancelled' }) {
  const config = {
    pending: {
      label: 'Pending Request',
      icon: '\u23f3',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-300 dark:border-yellow-700',
    },
    confirmed: {
      label: 'Confirmed',
      icon: '\u2705',
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-300 dark:border-green-700',
    },
    cancelled: {
      label: 'Cancelled',
      icon: '\u274c',
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-300 dark:border-red-700',
    },
  }

  const c = config[status]
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${c.bg} ${c.text} ${c.border}`}
    >
      <span>{c.icon}</span>
      {c.label}
    </span>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <span className="text-primary-500 dark:text-primary-400 min-w-24 text-sm font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-lg text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  )
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { event_id } = await params
  const { token } = await searchParams

  if (!token) {
    return (
      <SectionContainer>
        <div className="py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            A valid token is required to view this appointment.
          </p>
        </div>
      </SectionContainer>
    )
  }

  const result = verifyEventToken(token, event_id)

  if (!result.valid) {
    return (
      <SectionContainer>
        <div className="py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invalid Link</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {result.error === 'Token expired'
              ? 'This link has expired. The appointment may have already passed.'
              : 'This link is not valid. Please check the link from your email.'}
          </p>
        </div>
      </SectionContainer>
    )
  }

  const event = await fetchSingleEvent(event_id)

  if (!event) {
    return (
      <SectionContainer>
        <div className="py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Appointment Not Found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This appointment may have been cancelled or removed.
          </p>
        </div>
      </SectionContainer>
    )
  }

  const { status, duration, clientName } = parseEventSummary(event.summary || '', event.status)

  const startTime = event.start?.dateTime
  const endTime = event.end?.dateTime

  const dateString = startTime ? formatLocalDate(startTime) : null
  const startString = startTime ? formatLocalTime(startTime) : null
  const endString = endTime ? formatLocalTime(endTime, { timeZoneName: 'shortGeneric' }) : null

  const bookingSlug = extractBookingSlug(event)
  const bookingUrl = createBookingUrl(bookingSlug, event.location)

  return (
    <SectionContainer>
      <div className="py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-primary-500 dark:text-primary-400 text-3xl font-bold tracking-tight sm:text-4xl">
            Your Appointment
          </h1>

          <div className="mt-6">
            <StatusBadge status={status} />
          </div>

          {status === 'pending' && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Your request has been received and is awaiting confirmation. You&#39;ll receive an
              email once it&#39;s been reviewed.
            </p>
          )}

          <div className="mt-8 space-y-3 rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
            {dateString && duration && (
              <div className="border-l-primary-400 bg-primary-50/30 dark:bg-primary-50/10 mb-4 rounded-md border-l-4 p-3">
                <p className="text-primary-800 dark:text-primary-400 text-lg font-semibold">
                  {dateString} &mdash; {duration}min Massage
                </p>
                {startString && endString && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {startString} &ndash; {endString}
                  </p>
                )}
              </div>
            )}

            {clientName && <DetailRow label="Name" value={clientName} />}
            {event.location && <DetailRow label="Location" value={event.location} />}
            <DetailRow label="Email" value={result.payload.email} />
          </div>

          {status !== 'cancelled' && (
            <div className="mt-8 flex flex-wrap gap-3">
              {/* Cancel button — placeholder for 02b.4 */}
              {/* Edit button — placeholder for 02b.5 */}
            </div>
          )}

          {status === 'cancelled' && (
            <div className="mt-8 rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                This appointment has been cancelled.
              </p>
              <Link
                href={bookingUrl}
                className="bg-primary-600 hover:bg-primary-700 mt-4 inline-block rounded-lg px-6 py-2.5 font-medium text-white transition-colors"
              >
                Book a New Appointment
              </Link>
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  )
}
