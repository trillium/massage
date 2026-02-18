import { fetchContainerGeneric, filterEventsForQuery } from '@/lib/fetch/fetchContainersByQuery'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import { GoogleCalendarV3Event } from '@/lib/types'

export type QueryGroup = {
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

export async function getActiveContainers(): Promise<QueryGroup[]> {
  const slugConfigs = await fetchSlugConfigurationData()

  const containerConfigs = Object.entries(slugConfigs)
    .filter(([_, config]) => config.eventContainer)
    .map(([slug, config]) => ({
      slug,
      eventContainer: config.eventContainer!,
      type: config.type,
      title: config.title,
    }))

  const scheduledSiteConfigs = Object.entries(slugConfigs)
    .filter(([_, config]) => config.type === 'scheduled-site')
    .map(([slug, config]) => ({
      slug,
      eventContainer: slug,
      type: config.type,
      title: config.title,
    }))

  const allContainerConfigs = [...containerConfigs, ...scheduledSiteConfigs]

  let allEvents: GoogleCalendarV3Event[] = []
  try {
    const genericResult = await fetchContainerGeneric({ searchParams: {} })
    allEvents = genericResult.allEvents
  } catch (error) {
    console.error('Error fetching all events:', error)
  }

  const queryGroups = new Map<string, QueryGroup>()

  for (const config of allContainerConfigs) {
    const query = config.eventContainer

    if (!queryGroups.has(query)) {
      try {
        const filtered = filterEventsForQuery(allEvents, query)
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

    const queryGroup = queryGroups.get(query)!
    queryGroup.slugs.push({
      slug: config.slug,
      type: config.type || 'unknown',
      title: config.title || 'Untitled',
    })
  }

  return Array.from(queryGroups.values())
}
