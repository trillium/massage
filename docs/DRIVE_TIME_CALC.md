# Drive Time Calculation Documentation

## Overview

The massage booking app includes drive time calculation functionality to determine travel time between the massage therapist's location (stored in a primary Google Calendar event) and client locations. This helps with scheduling, pricing considerations, and service area determination.

## API Endpoint

### `/api/driveTime`

**Location:** `app/api/driveTime/route.ts`

**Methods:** `GET`, `POST`

**Purpose:** Calculates drive time between a calendar event location and a user-provided location.

### Request Parameters

#### POST Request Body

```typescript
{
  eventId?: string       // Optional: Google Calendar event ID (defaults to primary event)
  userLocation: string   // Required: User's address/location
}
```

#### GET Query Parameters

- `eventId` (optional): Google Calendar event ID
- `userLocation` (required): User's address/location

### Response Format

```typescript
{
  success: boolean
  driveTimeMinutes?: number
  eventLocation?: string
  userLocation?: string
  error?: string
}
```

## Calculation Methods

### 1. Google Maps Distance Matrix API (Primary Method)

**File:** `app/api/driveTime/route.ts:31-74`

**Function:** `calculateDriveTime(location1: string, location2: string)`

**API Endpoint:** `https://maps.googleapis.com/maps/api/distancematrix/json`

**Parameters:**

- `origins`: Starting location
- `destinations`: Ending location
- `units`: `imperial` (miles/minutes)
- `mode`: `driving`
- `traffic_model`: `best_guess`
- `departure_time`: `now` (for real-time traffic data)
- `key`: Google Maps API key

**Process:**

1. Constructs URL with origin and destination addresses
2. Makes API request to Google Maps Distance Matrix API
3. Extracts duration from response (prefers `duration_in_traffic` if available)
4. Converts duration from seconds to minutes (rounded up)
5. Returns drive time in minutes

**Error Handling:**

- Falls back to mock calculation if API key is missing
- Falls back to mock calculation if API request fails
- Validates response status and route availability

### 2. Mock Calculation (Fallback Method)

**File:** `app/api/driveTime/route.ts:76-116`

**Function:** `calculateDriveTimeMock(location1: string, location2: string)`

**Used When:**

- `GOOGLE_MAPS_API_KEY` environment variable is not set
- Google Maps API request fails

**Mock Logic:**

| Condition                                                               | Drive Time Range |
| ----------------------------------------------------------------------- | ---------------- |
| Identical locations                                                     | 0 minutes        |
| Same LA metro area (LA, Hollywood, Beverly Hills, Santa Monica, Venice) | 10-40 minutes    |
| Airport-related location                                                | 30-75 minutes    |
| Downtown-related location                                               | 20-55 minutes    |
| Default (different areas)                                               | 15-75 minutes    |

**Note:** Mock times are randomized within ranges for demonstration purposes.

## Configuration

### Required Environment Variables

**File:** `.env.local.template:14-15`

```bash
# Primary calendar event ID (therapist's base location)
GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID=<google-calendar-event-id>

# Google Maps API key for distance/geocoding services
GOOGLE_MAPS_API_KEY=<your-api-key>
```

### Default Event

**File:** `app/api/driveTime/route.ts:6-11`

```typescript
const DEFAULT_EVENT_ID = process.env.GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID as string

if (!DEFAULT_EVENT_ID) {
  throw new Error('Required environment variable GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID is not set')
}
```

The API uses a "primary event" stored in Google Calendar that represents the massage therapist's typical/home location. This event is fetched using `fetchSingleEvent()` to get the therapist's location for comparison.

## Related Components

### Geocoding Service

**File:** `lib/geocode.ts`

While not directly used by the drive time API currently, this service converts addresses to coordinates and is used elsewhere in the app for mapping:

- Converts string addresses or `LocationObject` to lat/lng coordinates
- Uses Google Maps Geocoding API
- Cached for 5 minutes using Next.js `unstable_cache`
- Supports batch geocoding with rate limiting

### Event Fetching

**File:** `lib/fetch/fetchSingleEvent.ts`

**Function:** `fetchSingleEvent(eventId: string): Promise<GoogleCalendarV3Event | null>`

Used by the drive time API to:

1. Fetch the primary event (therapist's location)
2. Extract the event's location field
3. Use that location as the origin for drive time calculation

**Process:**

1. Gets OAuth access token
2. Calls Google Calendar API v3
3. Returns event object with location data

## Usage in App

### 1. Pricing Page Reference

**File:** `app/pricing/page.tsx:37`

```tsx
Additional travel fees may apply for other areas if drive time exceeds 45 minutes.
```

The 45-minute threshold is mentioned as a policy for additional travel fees.

### 2. Planned Features

**File:** `.planning/todo.md`

> "Integrate the Location API to calculate drive time between appointments."

**File:** `.planning/OFFER_NEXT.md`

> "The reason is that later interactions of the app will be drive time aware, better to start implementation now"

### Future Use Cases

Drive time calculation is intended for:

- **Scheduling:** Buffer time between appointments
- **Service area determination:** Accept/decline bookings based on distance
- **Dynamic pricing:** Apply travel fees for locations > 45 minutes away
- **Availability filtering:** Show available slots accounting for travel time
- **Route optimization:** Schedule appointments efficiently by location

## Data Flow

```
Client Request
    ↓
POST /api/driveTime { userLocation: "123 Main St, LA" }
    ↓
Fetch Primary Event (GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID)
    ↓
Extract Event Location (e.g., "Westchester, CA")
    ↓
Calculate Drive Time
    ├─→ Google Maps Distance Matrix API (if key available)
    │       ↓
    │   Parse duration_in_traffic or duration
    │       ↓
    │   Convert seconds → minutes
    │
    └─→ Mock Calculation (fallback)
            ↓
        Pattern matching on location strings
            ↓
        Return randomized time range
    ↓
Return { success: true, driveTimeMinutes: 25, ... }
```

## Testing

Currently no direct frontend usage detected, but the API can be tested via:

### cURL Example (GET)

```bash
curl "http://localhost:3000/api/driveTime?userLocation=Santa%20Monica%2C%20CA"
```

### cURL Example (POST)

```bash
curl -X POST http://localhost:3000/api/driveTime \
  -H "Content-Type: application/json" \
  -d '{"userLocation": "Santa Monica, CA"}'
```

### With Custom Event

```bash
curl -X POST http://localhost:3000/api/driveTime \
  -H "Content-Type: application/json" \
  -d '{"eventId": "custom-event-id", "userLocation": "Santa Monica, CA"}'
```

## Service Area Policy

**File:** `app/pricing/page.tsx:35-38`

Based on the pricing page:

- **Primary service area:** Westchester/LAX area
- **Travel fee threshold:** 45 minutes drive time
- **Policy:** Additional travel fees may apply beyond 45 minutes

## API Rate Limits & Quotas

### Google Maps Distance Matrix API

**Quotas (as of standard free tier):**

- Up to 2,500 free requests per day
- $5 per 1,000 requests after free tier

**Best Practices:**

- Cache results when possible
- Batch requests for multiple locations
- Implement exponential backoff on errors
- Consider pre-calculating common routes

## Error Handling

### Error Scenarios

| Error                  | Response                                                                | Status Code |
| ---------------------- | ----------------------------------------------------------------------- | ----------- |
| Missing `userLocation` | `{ success: false, error: "userLocation is required" }`                 | 400         |
| Event not found        | `{ success: false, error: "Event not found with ID: ..." }`             | 404         |
| Event missing location | `{ success: false, error: "Event does not have a location specified" }` | 400         |
| API failure            | `{ success: false, error: "Failed to calculate drive time" }`           | 500         |

### Graceful Degradation

The API gracefully falls back to mock calculations when:

1. Google Maps API key is not configured
2. API request fails (network error, quota exceeded, etc.)
3. Invalid API response received

## Future Enhancements

Based on planning docs, potential improvements include:

1. **Booking Integration:** Auto-reject or flag bookings beyond service area
2. **Dynamic Pricing:** Calculate travel fees based on actual drive time
3. **Appointment Buffer:** Add travel time between consecutive appointments
4. **Multi-location Support:** Calculate drive time between appointments (not just from home base)
5. **Caching:** Cache drive times for frequently requested locations
6. **Batch Calculation:** Calculate drive times for multiple upcoming appointments
7. **Traffic Awareness:** Factor in typical traffic for appointment time slots
8. **Alternative Routes:** Provide fastest vs shortest route options

## Dependencies

### NPM Packages

- `next` - API route framework
- Standard Node.js fetch API

### Google APIs

- Google Calendar API v3 (for event locations)
- Google Maps Distance Matrix API (for drive time)
- Google Maps Geocoding API (for coordinate lookups)

### Environment Variables

- `GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID` - Primary event containing therapist's base location
- `GOOGLE_MAPS_API_KEY` - API key for Google Maps services
- `GOOGLE_OAUTH_REFRESH` - OAuth refresh token for Calendar API access

## Security Considerations

1. **API Key Protection:** Google Maps API key stored in environment variables
2. **Rate Limiting:** Consider implementing rate limiting on the endpoint
3. **Input Validation:** User location is URL-encoded before API requests
4. **Error Messages:** Generic error messages to avoid exposing system details
5. **OAuth Tokens:** Calendar API access uses secure OAuth flow

## Related Documentation

- [GOOGLE_API_INTEGRATION.md](.planning/GOOGLE_API_INTEGRATION.md) - Google API setup
- [LOCATION_OBJECT_IMPLEMENTATION.md](docs/LOCATION_OBJECT_IMPLEMENTATION.md) - Location data structure
- [Availability Architecture](.planning/AVAILABILITY_ARCHITECTURE.md) - Scheduling system
