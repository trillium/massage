import { getEventsBySearchQuery } from 'lib/availability/getEventsBySearchQuery'
import { GoogleCalendarV3Event } from 'lib/types'
import { isRequestEvent, getCleanSummary, extractApprovalUrls } from '@/lib/helpers/eventHelpers'
import SectionContainer from '@/components/SectionContainer'
import { DeclineButton } from './DeclineButton'
import { H1, H3 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

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
      <Box className="mx-auto max-w-7xl px-4 py-8">
        <H1 className="mb-6 dark:text-white">Pending Requests ({pendingEvents.length})</H1>

        {pendingEvents.length === 0 && (
          <TextBase className="text-accent-500 dark:text-accent-400">No pending requests.</TextBase>
        )}

        <Box className="space-y-4">
          {pendingEvents.map((event) => {
            const { acceptUrl, declineUrl } = extractApprovalUrls(event.description)
            return (
              <Box
                key={event.id}
                className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20"
              >
                <H3 className="dark:text-white">{getCleanSummary(event)}</H3>

                <Box className="mt-2 space-y-1 text-sm text-accent-600 dark:text-accent-400">
                  <TextBase>
                    <strong>Start:</strong> {formatDate(event.start?.dateTime, event.start?.date)}
                  </TextBase>
                  <TextBase>
                    <strong>End:</strong> {formatDate(event.end?.dateTime, event.end?.date)}
                  </TextBase>
                  {event.location && (
                    <TextBase>
                      <strong>Location:</strong> {event.location}
                    </TextBase>
                  )}
                </Box>

                {event.description && (
                  <Box className="mt-3">
                    <Box
                      className="text-sm whitespace-pre-wrap text-accent-600 dark:text-accent-400"
                      dangerouslySetInnerHTML={{
                        __html:
                          event.description.length > 400
                            ? `${event.description.substring(0, 400)}...`
                            : event.description,
                      }}
                    />
                  </Box>
                )}

                <Stack className="mt-4" direction="row" gap={3}>
                  {acceptUrl && (
                    <a
                      href={acceptUrl}
                      className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Accept
                    </a>
                  )}
                  {declineUrl && <DeclineButton declineUrl={declineUrl} />}
                </Stack>
              </Box>
            )
          })}
        </Box>
      </Box>
    </SectionContainer>
  )
}
