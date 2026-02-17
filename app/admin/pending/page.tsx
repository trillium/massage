import { getEventsBySearchQuery } from 'lib/availability/getEventsBySearchQuery'
import { GoogleCalendarV3Event } from 'lib/types'
import { isRequestEvent, getCleanSummary, extractApprovalUrls } from '@/lib/helpers/eventHelpers'
import SectionContainer from '@/components/SectionContainer'
import { DeclineButton } from './DeclineButton'

export const dynamic = 'force-dynamic'

function formatDate(dateTime?: string, date?: string) {
  if (dateTime) return new Date(dateTime).toLocaleString()
  if (date) return new Date(date).toLocaleDateString()
  return 'N/A'
}

export default async function PendingPage() {
  const events: GoogleCalendarV3Event[] = await getEventsBySearchQuery({
    query: 'REQUEST',
  })

  const pendingEvents = events.filter(isRequestEvent)

  return (
    <SectionContainer>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Pending Requests ({pendingEvents.length})
        </h1>

        {pendingEvents.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No pending requests.</p>
        )}

        <div className="space-y-4">
          {pendingEvents.map((event) => {
            const { acceptUrl, declineUrl } = extractApprovalUrls(event.description)
            return (
              <div
                key={event.id}
                className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getCleanSummary(event)}
                </h3>

                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <strong>Start:</strong> {formatDate(event.start?.dateTime, event.start?.date)}
                  </p>
                  <p>
                    <strong>End:</strong> {formatDate(event.end?.dateTime, event.end?.date)}
                  </p>
                  {event.location && (
                    <p>
                      <strong>Location:</strong> {event.location}
                    </p>
                  )}
                </div>

                {event.description && (
                  <div className="mt-3">
                    <div
                      className="text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400"
                      dangerouslySetInnerHTML={{
                        __html:
                          event.description.length > 400
                            ? `${event.description.substring(0, 400)}...`
                            : event.description,
                      }}
                    />
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  {acceptUrl && (
                    <a
                      href={acceptUrl}
                      className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Accept
                    </a>
                  )}
                  {declineUrl && <DeclineButton declineUrl={declineUrl} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SectionContainer>
  )
}
