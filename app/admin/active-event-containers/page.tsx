import { Metadata } from 'next'
import AdminNavigation from '@/components/AdminNavigation'
import { fetchContainerGeneric, filterEventsForQuery } from '@/lib/fetch/fetchContainersByQuery'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import Day from '@/lib/day'
import { GoogleCalendarV3Event } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Active Event Containers - Admin',
  description: 'Monitor active event containers and their associated events',
}

type QueryGroup = {
  query: string
  searchQuery: string
  eventMemberString: string
  eventContainerString: string
  allEvents: GoogleCalendarV3Event[]
  containers: GoogleCalendarV3Event[]
  members: GoogleCalendarV3Event[]
  slugs: {
    slug: string
    type: string
    title: string
  }[]
}

async function getActiveContainers(): Promise<QueryGroup[]> {
  // Get all slug configurations
  const slugConfigs = await fetchSlugConfigurationData()

  // Find all configurations that have eventContainer property
  const containerConfigs = Object.entries(slugConfigs)
    .filter(([_, config]) => config.eventContainer)
    .map(([slug, config]) => ({
      slug,
      eventContainer: config.eventContainer!,
      type: config.type,
      title: config.title,
    }))

  // Also check for scheduled-site types (they use the slug as container query)
  const scheduledSiteConfigs = Object.entries(slugConfigs)
    .filter(([_, config]) => config.type === 'scheduled-site')
    .map(([slug, config]) => ({
      slug,
      eventContainer: slug, // scheduled-site uses slug as container query
      type: config.type,
      title: config.title,
    }))

  // Combine both types
  const allContainerConfigs = [...containerConfigs, ...scheduledSiteConfigs]

  // SINGLE FETCH: Get all events with "__EVENT__" in them once
  let allEvents: GoogleCalendarV3Event[] = []
  try {
    const genericResult = await fetchContainerGeneric({
      searchParams: {},
    })
    allEvents = genericResult.allEvents

    console.log(`Single fetch found ${allEvents.length} events with "__EVENT__"`, {
      dateRange: { start: genericResult.start, end: genericResult.end },
      eventSummaries: allEvents.map((e) => e.summary).slice(0, 10), // Show first 10
    })
  } catch (error) {
    console.error('Error fetching all events:', error)
  }

  // Group configurations by their eventContainer query
  const queryGroups = new Map<string, QueryGroup>()

  for (const config of allContainerConfigs) {
    const query = config.eventContainer

    if (!queryGroups.has(query)) {
      // Create new query group
      try {
        const filtered = filterEventsForQuery(allEvents, query)

        console.log(`Local filtering for ${query}:`, {
          searchQuery: filtered.searchQuery,
          relevantEventCount: filtered.events.length,
          containerCount: filtered.containers.length,
          memberCount: filtered.members.length,
        })

        queryGroups.set(query, {
          query,
          searchQuery: filtered.searchQuery,
          eventMemberString: filtered.eventMemberString,
          eventContainerString: filtered.eventContainerString,
          allEvents: filtered.events,
          containers: filtered.containers,
          members: filtered.members,
          slugs: [],
        })
      } catch (error) {
        console.error(`Error filtering events for ${query}:`, error)
        // Add empty data for failed queries so we can see the issue
        queryGroups.set(query, {
          query,
          searchQuery: query + '__EVENT__',
          eventMemberString: query + '__EVENT__MEMBER__',
          eventContainerString: query + '__EVENT__CONTAINER__',
          allEvents: [],
          containers: [],
          members: [],
          slugs: [],
        })
      }
    }

    // Add this slug to the query group
    const queryGroup = queryGroups.get(query)!
    queryGroup.slugs.push({
      slug: config.slug,
      type: config.type || 'unknown',
      title: config.title || 'Untitled',
    })
  }

  return Array.from(queryGroups.values())
}

function formatDateTime(dateTime: string): string {
  return new Date(dateTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export default async function ActiveEventContainersPage() {
  const queryGroups = await getActiveContainers()
  const totalContainers = queryGroups.reduce((sum, group) => sum + group.containers.length, 0)
  const totalMembers = queryGroups.reduce((sum, group) => sum + group.members.length, 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <AdminNavigation />

      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Active Event Containers
        </h1>
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                System Overview
              </h2>
              <p className="text-blue-700 dark:text-blue-200">
                Monitoring period: {Day.todayWithOffset(0).toString()} to{' '}
                {Day.todayWithOffset(21).toString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalContainers}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Containers</div>
              <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {totalMembers}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Members</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {queryGroups.map((group) => (
          <div
            key={group.query}
            className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800"
          >
            <div className="bg-gray-50 px-6 py-4 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Query: <code className="text-blue-600 dark:text-blue-400">{group.query}</code>
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Used by {group.slugs.length} slug{group.slugs.length !== 1 ? 's' : ''}:
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {group.slugs.map((slugInfo) => (
                        <span
                          key={slugInfo.slug}
                          className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                        >
                          /{slugInfo.slug}
                          <span className="ml-1 text-blue-600 dark:text-blue-300">
                            ({slugInfo.type})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Search Query:{' '}
                      <code className="bg-gray-100 px-1 dark:bg-gray-600">__EVENT__ (generic)</code>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Local Filter:{' '}
                      <code className="bg-blue-100 px-1 dark:bg-blue-800">{group.searchQuery}</code>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Container Pattern:{' '}
                      <code className="bg-green-100 px-1 dark:bg-green-800">
                        {group.eventContainerString}
                      </code>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Member Pattern:{' '}
                      <code className="bg-orange-100 px-1 dark:bg-orange-800">
                        {group.eventMemberString}
                      </code>
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      {group.containers.length}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Containers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-600 dark:text-orange-400">
                      {group.members.length}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-600 dark:text-gray-400">
                      {group.allEvents.length}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Total Events</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Debug Section - All Events Found */}
              {group.allEvents.length > 0 && (
                <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h4 className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                    🔍 Debug: All Events Found by Search Query "{group.searchQuery}" (
                    {group.allEvents.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    {group.allEvents.map((event) => (
                      <div key={event.id} className="mb-1 text-xs">
                        <span className="font-mono text-blue-800 dark:text-blue-200">
                          "{event.summary}" - {formatDateTime(event.start.dateTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {/* Container Events */}
                <div>
                  <h4 className="mb-3 flex items-center text-base font-medium text-gray-900 dark:text-white">
                    <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                    Container Events ({group.containers.length})
                  </h4>
                  {group.containers.length === 0 ? (
                    <div className="rounded-lg bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                      No container events found. Create events with names containing:{' '}
                      <code className="font-mono text-xs">{group.eventContainerString}</code>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {group.containers.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-md border border-green-200 p-3 text-sm dark:border-green-700"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {event.summary}
                          </div>
                          <div className="mt-1 text-gray-600 dark:text-gray-400">
                            {formatDateTime(event.start.dateTime)} -{' '}
                            {formatDateTime(event.end.dateTime)}
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

                {/* Member Events */}
                <div>
                  <h4 className="mb-3 flex items-center text-base font-medium text-gray-900 dark:text-white">
                    <div className="mr-2 h-3 w-3 rounded-full bg-orange-500"></div>
                    Member Events ({group.members.length})
                  </h4>
                  {group.members.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 p-3 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      No member events found. These are created when bookings are made within
                      container events.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {group.members.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-md border border-orange-200 p-3 text-sm dark:border-orange-700"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {event.summary}
                          </div>
                          <div className="mt-1 text-gray-600 dark:text-gray-400">
                            {formatDateTime(event.start.dateTime)} -{' '}
                            {formatDateTime(event.end.dateTime)}
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
              </div>
            </div>
          </div>
        ))}

        {queryGroups.length === 0 && (
          <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              No Event Containers Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No slug configurations with eventContainer property or scheduled-site type were found.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          How Event Containers Work
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong className="text-green-600 dark:text-green-400">Container Events:</strong> Define
            available time slots. Create Google Calendar events with names containing{' '}
            <code>QUERY__EVENT__CONTAINER__</code>
          </p>
          <p>
            <strong className="text-orange-600 dark:text-orange-400">Member Events:</strong>{' '}
            Represent booked appointments within containers. These are automatically created when
            users book appointments, with names containing <code>QUERY__EVENT__MEMBER__</code>
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Availability:</strong> The system
            generates time slots within container events that don't overlap with member events.
          </p>
        </div>
      </div>
    </div>
  )
}
