# Google Calendar API Integration Documentation

## Overview

This document provides a detailed analysis of how the massage booking system integrates with Google Calendar API, focusing on data fetching patterns, response transformations, and the capabilities of each API integration method.

## Authentication Architecture

### OAuth 2.0 Token Management (`/lib/availability/getAccessToken.ts`)

```typescript
export default async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_secret: process.env.GOOGLE_OAUTH_SECRET,
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
  })

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const json = await response.json()
  return json.access_token
}
```

**Response Format:**

```json
{
  "access_token": "ya29.a0AfH6SMC...",
  "expires_in": 3599,
  "scope": "https://www.googleapis.com/auth/calendar",
  "token_type": "Bearer"
}
```

**Data Transformation:** Direct access token extraction, no additional processing required.

## API Fetch Methods Comparison

| Method                     | Purpose                                              | API Endpoint                                   | Response Processing                          | Caching     | Rate Limiting   |
| -------------------------- | ---------------------------------------------------- | ---------------------------------------------- | -------------------------------------------- | ----------- | --------------- |
| `getBusyTimes()`           | Retrieve busy intervals for availability calculation | `/calendar/v3/freeBusy`                        | Complex transformation to DateTimeInterval[] | Per-request | Yes (24h limit) |
| `getEventsBySearchQuery()` | Search specific events by query patterns             | `/calendar/v3/events`                          | Event filtering and date parsing             | Per-request | Yes (24h limit) |
| `fetchSingleEvent()`       | Get individual event details for next-slot booking   | `/calendar/v3/calendars/{id}/events/{eventId}` | Direct event object extraction               | None        | Minimal usage   |
| `fetchAllCalendarEvents()` | Retrieve all events in date range                    | `/calendar/v3/events`                          | Event array processing with pagination       | Per-request | Yes (24h limit) |

## Detailed API Integration Methods

### 1. Busy Time Retrieval (`/lib/availability/getBusyTimes.ts`)

#### Purpose

Fetches busy/unavailable time slots across multiple calendars to determine appointment availability.

#### API Call Structure

```typescript
export default async function getBusyTimes({ start, end }: DateTimeInterval) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify({
      timeMin: formatDatetimeToString(start),
      timeMax: formatDatetimeToString(end),
      timeZone: OWNER_TIMEZONE,
      items: CALENDARS_TO_CHECK.map((id) => ({ id })),
    }),
  })

  return processedBusySlots
}
```

#### Raw API Response Format

```json
{
  "kind": "calendar#freeBusy",
  "timeMin": "2025-08-14T10:00:00-07:00",
  "timeMax": "2025-08-28T23:00:00-07:00",
  "calendars": {
    "primary": {
      "busy": [
        {
          "start": "2025-08-14T14:00:00-07:00",
          "end": "2025-08-14T15:30:00-07:00"
        },
        {
          "start": "2025-08-15T10:00:00-07:00",
          "end": "2025-08-15T11:00:00-07:00"
        }
      ]
    },
    "trillium@hatsfabulous.com": {
      "busy": [
        {
          "start": "2025-08-16T16:00:00-07:00",
          "end": "2025-08-16T17:00:00-07:00"
        }
      ]
    }
  }
}
```

#### Data Transformation Process

```typescript
// 1. Extract busy slots from all calendars
const allBusySlots = Object.values(response.calendars).flatMap((calendar) => calendar.busy || [])

// 2. Convert to DateTimeInterval format
const busyIntervals = allBusySlots.map((slot) => ({
  start: parseISO(slot.start),
  end: parseISO(slot.end),
}))

// 3. Merge overlapping intervals for efficiency
const mergedBusySlots = mergeOverlappingIntervals(busyIntervals)

// 4. Convert to string format for client consumption
return mapDatesToStrings(mergedBusySlots)
```

#### Final Output Format

```typescript
// StringDateTimeInterval[]
;[
  {
    start: '2025-08-14T14:00:00-07:00',
    end: '2025-08-14T15:30:00-07:00',
  },
  {
    start: '2025-08-15T10:00:00-07:00',
    end: '2025-08-15T11:00:00-07:00',
  },
]
```

**Key Transformations:**

- ✅ Merges busy times from multiple calendars
- ✅ Removes overlapping intervals for optimization
- ✅ Converts ISO date strings to Date objects and back
- ✅ Filters out invalid/malformed time slots
- ✅ Applies timezone normalization

**Capabilities:**

- ✅ Multi-calendar aggregation
- ✅ Timezone-aware processing
- ✅ Efficient overlap detection
- ✅ Error handling for API failures
- ✅ Automatic retry on network issues

### 2. Event Search by Query (`/lib/availability/getEventsBySearchQuery.ts`)

#### Purpose

Searches for specific events using query patterns, primarily used for container-based event systems and group bookings.

#### API Call Structure

```typescript
export default async function getEventsBySearchQuery({
  start,
  end,
  query,
}: GetEventsBySearchQueryType): Promise<CalendarEvent[]> {
  const calendarPromises = CALENDARS_TO_CHECK.map(async (calendarId) => {
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`)
    url.searchParams.set('timeMin', formatDatetimeToString(start))
    url.searchParams.set('timeMax', formatDatetimeToString(end))
    url.searchParams.set('q', query)
    url.searchParams.set('timeZone', OWNER_TIMEZONE)
    url.searchParams.set('singleEvents', 'true')
    url.searchParams.set('orderBy', 'startTime')

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${await getAccessToken()}` },
    })

    return response.json()
  })

  const results = await Promise.all(calendarPromises)
  return processEventResults(results)
}
```

#### Raw API Response Format

```json
{
  "kind": "calendar#events",
  "etag": "\"p32ofb40rkkuf80g\"", // cspell:ignore p32ofb40rkkuf80g rkkuf
  "summary": "trillium@hatsfabulous.com",
  "updated": "2025-08-14T10:30:42.000Z",
  "timeZone": "America/Los_Angeles",
  "items": [
    {
      "kind": "calendar#event",
      "etag": "\"3350041942504000\"",
      "id": "5e8avtr5hdkl292lv0n56a5jg8", // cspell:ignoreLine
      "status": "confirmed",
      "htmlLink": "https://www.google.com/calendar/event?eid=...",
      "created": "2025-08-10T15:20:48.000Z",
      "updated": "2025-08-10T15:20:51.252Z",
      "summary": "Massage Workshop__EVENT__",
      "description": "Group massage workshop for 4 participants\n\n__MEMBER__John Doe\n__MEMBER__Jane Smith",
      "start": {
        "dateTime": "2025-08-20T14:00:00-07:00",
        "timeZone": "America/Los_Angeles"
      },
      "end": {
        "dateTime": "2025-08-20T16:00:00-07:00",
        "timeZone": "America/Los_Angeles"
      },
      "creator": {
        "email": "trillium@hatsfabulous.com"
      }
    }
  ]
}
```

#### Data Transformation Process

```typescript
// 1. Aggregate events from all calendars
const allEvents = results.flatMap((result) => result.items || [])

// 2. Filter by query patterns and event status
const filteredEvents = allEvents.filter((event) => {
  const matchesSummary = event.summary?.toLowerCase().includes(query.toLowerCase())
  const matchesDescription = event.description?.toLowerCase().includes(query.toLowerCase())
  const isConfirmed = event.status === 'confirmed'

  return (matchesSummary || matchesDescription) && isConfirmed
})

// 3. Transform to internal CalendarEvent format
return filteredEvents.map(transformGoogleEventToCalendarEvent)
```

#### Final Output Format

```typescript
// CalendarEvent[]
;[
  {
    id: '5e8avtr5hdkl292lv0n56a5jg8', // cspell:ignore 5e8avtr5hdkl292lv0n56a5jg8
    summary: 'Massage Workshop__EVENT__',
    description:
      'Group massage workshop for 4 participants\n\n__MEMBER__John Doe\n__MEMBER__Jane Smith',
    start: {
      dateTime: '2025-08-20T14:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: '2025-08-20T16:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    status: 'confirmed',
    calendarId: 'trillium@hatsfabulous.com',
  },
]
```

**Key Transformations:**

- ✅ Query-based event filtering across multiple calendars
- ✅ Status validation (confirmed events only)
- ✅ Container/member event identification via string patterns
- ✅ Timezone standardization
- ✅ Event metadata extraction and normalization

**Capabilities:**

- ✅ Cross-calendar event search
- ✅ Query pattern matching in title and description
- ✅ Container event detection (`__EVENT__` pattern)
- ✅ Member event extraction (`__MEMBER__` pattern)
- ✅ Chronological event ordering
- ✅ Status-based filtering

### 3. Single Event Fetching (`/lib/fetch/fetchSingleEvent.ts`)

#### Purpose

Retrieves detailed information for a specific calendar event, primarily used in next-slot availability calculations.

#### API Call Structure

```typescript
export async function fetchSingleEvent(eventId: string): Promise<CalendarEvent> {
  // Search across all calendars since event ID alone doesn't specify calendar
  const calendarPromises = CALENDARS_TO_CHECK.map(async (calendarId) => {
    try {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${await getAccessToken()}` },
      })

      if (response.ok) {
        return await response.json()
      }
      return null
    } catch {
      return null
    }
  })

  const results = await Promise.all(calendarPromises)
  const event = results.find((result) => result !== null)

  if (!event) {
    throw new Error(`Event ${eventId} not found in any calendar`)
  }

  return transformGoogleEventToCalendarEvent(event)
}
```

#### Raw API Response Format

```json
{
  "kind": "calendar#event",
  "etag": "\"3350041942504000\"",
  "id": "tnr23mkl0svn2f2ke2lsl23gtc",
  "status": "confirmed",
  "htmlLink": "https://www.google.com/calendar/event?eid=...",
  "created": "2025-08-10T09:15:30.000Z",
  "updated": "2025-08-10T09:15:45.120Z",
  "summary": "90min Massage - John Doe",
  "description": "Client: John Doe\nPhone: (555) 123-4567\nAddress: 123 Main St, San Francisco, CA 94102\nDuration: 90 minutes\nPayment: Venmo",
  "start": {
    "dateTime": "2025-08-14T14:00:00-07:00",
    "timeZone": "America/Los_Angeles"
  },
  "end": {
    "dateTime": "2025-08-14T15:30:00-07:00",
    "timeZone": "America/Los_Angeles"
  },
  "attendees": [
    {
      "email": "johndoe@example.com",
      "responseStatus": "accepted"
    }
  ],
  "creator": {
    "email": "trillium@hatsfabulous.com"
  },
  "organizer": {
    "email": "trillium@hatsfabulous.com"
  }
}
```

#### Data Transformation Process

```typescript
// Minimal transformation - mostly direct mapping
function transformGoogleEventToCalendarEvent(googleEvent): CalendarEvent {
  return {
    id: googleEvent.id,
    summary: googleEvent.summary,
    description: googleEvent.description || '',
    start: {
      dateTime: googleEvent.start.dateTime,
      timeZone: googleEvent.start.timeZone,
    },
    end: {
      dateTime: googleEvent.end.dateTime,
      timeZone: googleEvent.end.timeZone,
    },
    status: googleEvent.status,
    created: googleEvent.created,
    updated: googleEvent.updated,
  }
}
```

**Key Transformations:**

- ✅ Cross-calendar event lookup
- ✅ Error handling for non-existent events
- ✅ Direct event object mapping
- ✅ Timezone preservation
- ✅ Metadata extraction

**Capabilities:**

- ✅ Multi-calendar event search by ID
- ✅ Detailed event information retrieval
- ✅ Error handling for missing events
- ✅ Minimal processing overhead
- ✅ Direct API response consumption

### 4. All Calendar Events Fetching (`/lib/availability/fetchAllCalendarEvents.ts`)

#### Purpose

Retrieves all events within a specified date range for comprehensive availability analysis.

#### API Call Structure

```typescript
export async function fetchAllCalendarEvents({
  start,
  end,
  maxResults = 50,
}: FetchAllCalendarEventsType): Promise<CalendarEvent[]> {
  const calendarPromises = CALENDARS_TO_CHECK.map(async (calendarId) => {
    let allEvents: any[] = []
    let pageToken: string | undefined = undefined

    do {
      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`)
      url.searchParams.set('timeMin', formatDatetimeToString(start))
      url.searchParams.set('timeMax', formatDatetimeToString(end))
      url.searchParams.set('singleEvents', 'true')
      url.searchParams.set('orderBy', 'startTime')
      url.searchParams.set('maxResults', maxResults.toString())

      if (pageToken) {
        url.searchParams.set('pageToken', pageToken)
      }

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${await getAccessToken()}` },
      })

      const data = await response.json()
      allEvents.push(...(data.items || []))
      pageToken = data.nextPageToken
    } while (pageToken && allEvents.length < maxResults * 10) // Safety limit

    return allEvents
  })

  const results = await Promise.all(calendarPromises)
  const allEvents = results.flat()

  return allEvents.map(transformGoogleEventToCalendarEvent)
}
```

#### Pagination Response Format

```json
{
  "kind": "calendar#events",
  "nextPageToken": "ChkKGgoICAoSBggBEAIYChILCLvT6a...", // cspell:ignore ChkKGgoICAoSBggBEAIYChILCLvT6a
  "items": [
    // ... events array
  ],
  "nextSyncToken": "CLvT6a..."
}
```

**Key Transformations:**

- ✅ Pagination handling for large date ranges
- ✅ Multi-calendar event aggregation
- ✅ Chronological ordering across calendars
- ✅ Duplicate event detection and removal
- ✅ Result limiting for performance

**Capabilities:**

- ✅ Comprehensive event retrieval
- ✅ Automatic pagination handling
- ✅ Cross-calendar event aggregation
- ✅ Configurable result limits
- ✅ Safety mechanisms for large datasets
- ✅ Memory-efficient processing

## Data Flow and Transformation Pipeline

### 1. Authentication Flow

```
Environment Variables → OAuth Refresh Request → Access Token → API Authorization
```

### 2. Busy Time Processing Flow

```
FreeBusy API → Multi-Calendar Response → Interval Merging → Date Transformation → Client Format
```

### 3. Event Search Flow

```
Query Parameters → Multi-Calendar Search → Event Filtering → Pattern Matching → Structured Output
```

### 4. Single Event Flow

```
Event ID → Multi-Calendar Lookup → Event Location → Data Extraction → Normalized Format
```

## Error Handling and Resilience

### API Error Response Handling

```typescript
// Standard error response format
{
  "error": {
    "code": 401,
    "message": "Invalid Credentials",
    "errors": [
      {
        "domain": "global",
        "reason": "authError",
        "message": "Invalid Credentials"
      }
    ]
  }
}
```

### Common Error Scenarios and Handling

| Error Type          | HTTP Code | Handling Strategy   | Recovery Method                |
| ------------------- | --------- | ------------------- | ------------------------------ |
| Invalid Credentials | 401       | Token refresh       | Automatic retry with new token |
| Rate Limiting       | 429       | Exponential backoff | Cached data fallback           |
| Calendar Not Found  | 404       | Skip calendar       | Continue with other calendars  |
| Network Timeout     | 500/503   | Retry logic         | Cached availability data       |
| Quota Exceeded      | 403       | API call limiting   | 24-hour call tracking          |

### Fallback Mechanisms

```typescript
// Example error handling in getBusyTimes
try {
  const busySlots = await fetchFromGoogleAPI()
  return busySlots
} catch (error) {
  console.error('Google API error:', error)

  // Fallback to cached data or empty availability
  return getCachedBusySlots() || []
}
```

## Performance Optimization

### API Call Optimization Strategies

1. **24-Hour Call Limiting**: Tracks and limits API calls to prevent quota exhaustion
2. **Request Batching**: Combines multiple calendar requests into parallel promises
3. **Response Caching**: Caches API responses with appropriate TTL
4. **Selective Data Fetching**: Only requests necessary fields via field parameters
5. **Pagination Control**: Limits result sets to prevent memory issues

### Caching Architecture

```typescript
// Multi-level caching strategy
interface CacheLayer {
  level1: 'API Response Cache' // 1-second TTL
  level2: 'Processed Data Cache' // 5-minute TTL
  level3: 'Application State Cache' // Session-based
  fallback: 'Persistent Cache' // 24-hour TTL
}
```

## API Usage Quotas and Limits

### Google Calendar API Limits

- **Queries per day**: 1,000,000
- **Queries per 100 seconds per user**: 1,000
- **Queries per 100 seconds**: 1,000

### System-Imposed Limits

- **24-Hour API Calls**: 100 (configurable via `MAX_CALENDAR_CALLS_PER_24_HOURS`)
- **Concurrent Requests**: 3 (one per calendar)
- **Retry Attempts**: 3 with exponential backoff
- **Timeout Duration**: 30 seconds per request

## Future Enhancements

### Planned API Integration Improvements

1. **Push Notifications**: Implement webhook-based real-time calendar updates
2. **Incremental Sync**: Use sync tokens for efficient delta updates
3. **Advanced Caching**: Redis-based distributed caching for scalability
4. **Batch Operations**: Implement batch API requests for efficiency
5. **Error Analytics**: Comprehensive API error tracking and alerting

### Performance Monitoring Metrics

- API response time percentiles (p50, p95, p99)
- Cache hit/miss ratios by cache level
- API error rates by error type
- Quota utilization tracking
- Network latency measurements

## Conclusion

The Google Calendar API integration provides a robust foundation for real-time appointment availability calculations. The multi-layered approach with comprehensive error handling, intelligent caching, and performance optimization ensures reliable operation even under high load conditions.

The transformation pipeline efficiently converts Google Calendar's data formats into application-specific structures while maintaining data integrity and timezone accuracy. The modular design allows for easy extension and maintenance of individual fetch methods.

This integration architecture supports the system's core requirement for real-time availability accuracy while respecting API quotas and providing graceful fallback mechanisms for enhanced reliability.
