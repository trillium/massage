# Availability Architecture Documentation

## System Overview

The massage booking system's availability architecture is a sophisticated multi-layered system that manages appointment generation, conflict detection, and real-time slot availability. This document outlines how appointments are generated, cached, and delivered to users through the booking interface.

## Architecture Principles

### Core Design Philosophy

1. **Real-time Accuracy**: All availability calculations reflect current Google Calendar state
2. **Performance Optimization**: Multi-level caching prevents excessive API calls
3. **Conflict Prevention**: Comprehensive busy-time detection and slot filtering
4. **Multi-duration Support**: Dynamic slot generation for varying appointment lengths
5. **Lead Time Enforcement**: Configurable minimum advance booking requirements

### System Flow Overview

```
Google Calendar API → Availability Engine → Caching Layer → Redux State → User Interface
```

## Core System Components

### 1. Data Layer Architecture

#### Google Calendar Integration (`/lib/availability/`)

**Primary Files:**

- `getAccessToken.ts` - OAuth token management with refresh capabilities
- `getBusyTimes.ts` - Retrieves busy intervals from multiple calendars
- `getEventsBySearchQuery.ts` - Searches specific events by query patterns

**Calendar Sources:**

```typescript
export const CALENDARS_TO_CHECK = [
  'primary', // Main Google Calendar
  'trillium@hatsfabulous.com', // Business calendar
  'trillium@trilliumsmith.com', // Personal calendar
]
```

**Authentication Flow:**

```typescript
// Token refresh mechanism for continuous API access
const getAccessToken = async (): Promise<string> => {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_secret: process.env.GOOGLE_OAUTH_SECRET,
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
  })

  // Returns fresh access token for API calls
}
```

### 2. Availability Processing Engine

#### Multi-Duration Slot Generation (`/lib/availability/getNextSlotAvailability.ts`)

**Core Innovation**: The recent enhancement introduces intelligent multi-duration availability calculation:

```typescript
export async function getNextSlotAvailability(
  baseEventId: string
): Promise<MultiDurationAvailability> {
  // 1. Fetch reference event details
  const referenceEvent = await fetchSingleEvent(baseEventId)

  // 2. Create multi-duration availability cache
  const multiDurationAvailability = await createMultiDurationAvailability({
    searchStart: referenceEvent.end,
    allowedDurations: ALLOWED_DURATIONS,
    maxCalendarCalls: MAX_CALENDAR_CALLS_PER_24_HOURS,
  })

  return multiDurationAvailability
}
```

**Key Features:**

- **24-Hour API Optimization**: Limits Google Calendar calls to prevent quota exhaustion
- **Duration-Specific Caching**: Separate availability calculations per duration
- **Intelligent Conflict Detection**: Advanced busy-time intersection algorithms
- **Performance Monitoring**: Built-in API call tracking and optimization

#### Owner Schedule Configuration (`/config.ts`)

```typescript
const DEFAULT_WORKDAY = [
  {
    start: { hour: 10 }, // 10:00 AM
    end: { hour: 23 }, // 11:00 PM
  },
]

export const OWNER_AVAILABILITY: AvailabilitySlotsMap = {
  0: DEFAULT_WORKDAY, // Sunday
  1: DEFAULT_WORKDAY, // Monday
  2: DEFAULT_WORKDAY, // Tuesday
  3: DEFAULT_WORKDAY, // Wednesday
  4: DEFAULT_WORKDAY, // Thursday
  5: DEFAULT_WORKDAY, // Friday
  6: DEFAULT_WORKDAY, // Saturday
}
```

### 3. Slot Generation Algorithm

#### Primary Slot Creation (`/lib/availability/createSlots.ts`)

**Algorithm Steps:**

1. **Potential Time Generation**: Creates theoretical appointment slots based on owner availability
2. **Busy Time Filtering**: Removes slots conflicting with existing appointments
3. **Lead Time Application**: Enforces minimum advance booking requirements
4. **Duration Optimization**: Adjusts slot intervals based on appointment length

```typescript
export function createSlots({
  start,
  end,
  busy,
  leadTime = LEAD_TIME,
  duration,
  containers,
}: CreateSlotsType): StringDateTimeIntervalAndLocation[] {
  // Generate all potential booking times
  const potential = getPotentialTimes({
    start,
    end,
    duration,
    availabilitySlots: OWNER_AVAILABILITY,
    containers,
  })

  // Filter out conflicting appointments
  const offers = getAvailability({
    busy: mapStringsToDates(busy),
    potential,
    leadTime,
  })

  // Apply date range constraints
  const slots = offers.filter((slot) => {
    return slot.start >= startOfInterval && slot.end <= endOfInterval
  })

  return slots
}
```

#### Advanced Conflict Detection (`/lib/availability/getAvailability.ts`)

```typescript
export default function getAvailability({
  potential,
  busy,
  padding = SLOT_PADDING, // 0 minutes buffer
  leadTime = LEAD_TIME, // 3 hours minimum
}) {
  // Remove overlapping slots
  const available = potential.filter((slot) => {
    return !busy.some((busySlot) => areIntervalsOverlapping(slot, busySlot))
  })

  // Apply lead time filtering
  const now = new Date()
  const withLeadTime = available.filter((slot) => {
    return new Date(slot.start) >= add(now, { minutes: leadTime })
  })

  return withLeadTime
}
```

### 4. Caching and Performance Layer

#### Multi-Level Caching Strategy

**Level 1: API Response Caching**

- Google Calendar API responses cached with 1-second revalidation
- OAuth tokens cached until expiration
- Busy time intervals cached per request cycle

**Level 2: Calculation Caching**

- Multi-duration availability cached in memory
- Slot generation results cached per configuration
- Potential time calculations memoized

**Level 3: Redux State Caching**

- Client-side availability state maintained
- User selections preserved across interactions
- URL parameter synchronization for persistence

#### Performance Optimization Features

**API Call Limiting:**

```typescript
// 24-hour API call tracking prevents quota exhaustion
const MAX_CALENDAR_CALLS_PER_24_HOURS = 100

// Intelligent call distribution across durations
const calculateSlotsForDuration = async (duration: number): Promise<AvailabilitySlot[]> => {
  if (apiCallCount >= maxCalendarCalls) {
    // Return cached or fallback availability
    return getCachedAvailability(duration)
  }

  // Proceed with fresh API call
  return generateFreshSlots(duration)
}
```

### 5. State Management Architecture

#### Redux Availability Slice (`/redux/slices/availabilitySlice.ts`)

```typescript
interface AvailabilityState {
  duration: number | null // Selected appointment duration
  selectedDate: string | null // Chosen date (YYYY-MM-DD)
  selectedTime: IntervalType | null // Selected time slot
  start: string // Search range start
  end: string // Search range end
  timeZone: string // System timezone
  slots: StringDateTimeIntervalAndLocation[] // Available appointment slots
}
```

**State Update Patterns:**

- **Duration Changes**: Trigger slot recalculation via `UpdateSlotsUtility`
- **Date Selection**: Filter slots for display in `TimeList` component
- **Time Selection**: Prepare booking form with selected interval
- **Slot Updates**: Real-time refresh when availability changes

### 6. Frontend Integration Layer

#### Component Hierarchy

```
BookingPage
├── InitialUrlUtility (Setup)
├── DurationPicker (Selection)
├── Calendar (Date Selection)
├── TimeList (Time Selection)
├── UpdateSlotsUtility (Real-time Updates)
└── UrlUpdateUtility (State Persistence)
```

#### Real-time Availability Updates

**Component: UpdateSlotsUtility**

```typescript
export function UpdateSlotsUtility({
  busy,
  containers,
  start,
  end,
  configObject,
}: UpdateSlotsUtilityProps) {
  useEffect(() => {
    // Regenerate slots when dependencies change
    const newSlots = createSlots({
      duration: durationRedux || DEFAULT_DURATION,
      leadTime: leadTime ?? LEAD_TIME,
      start,
      end,
      busy,
      containers,
    })

    // Update Redux state
    dispatchRedux(setSlots(newSlots))

    // Sync URL parameters
    createNewUrlParams()
  }, [durationRedux, busy, containers, start, end])
}
```

### 7. Dynamic Booking Configuration

#### Slug-Based Page Configuration (`/lib/slugConfigurations/createPageConfiguration.tsx`)

**Features:**

- **Custom Durations**: Per-booking-page duration allowlists
- **Lead Time Overrides**: Configurable minimum advance booking
- **Container Events**: Group booking and event-specific availability
- **Pricing Configuration**: Duration-based pricing structures

```typescript
export async function createPageConfiguration({
  bookingSlug,
  resolvedParams,
  overrides,
}: createPageConfigurationProps) {
  // Load slug-specific configuration
  const slugData = await fetchSlugConfigurationData()
  let configuration = slugData[bookingSlug] ?? initialState

  // Fetch data based on configuration type
  let data
  if (configuration?.type === 'scheduled-site' && bookingSlug) {
    data = await fetchContainersByQuery({
      searchParams: resolvedParams,
      query: bookingSlug,
    })
  } else {
    data = await fetchData({ searchParams: resolvedParams })
  }

  // Generate slots with custom settings
  const slots = createSlots({
    start: dayFromString(data.start),
    end: dayFromString(data.end),
    busy: data.busy,
    duration,
    leadTime: configuration?.leadTimeMinimum ?? LEAD_TIME,
    ...data.data,
  })

  return { slots, configuration, data }
}
```

## Advanced Features

### 1. Next-Slot Availability System

**Purpose**: Provides immediate follow-up booking options after completed appointments

**Implementation**: `/app/event/[event_id]/next/page.tsx`

```typescript
export default async function NextBookingPage({ params }: NextBookingPageProps) {
  const resolvedParams = await params
  const eventId = resolvedParams.event_id

  // Get multi-duration availability after this event
  const multiDurationAvailability = await getNextSlotAvailability(eventId)

  // Render booking interface with post-event availability
  return <BookingInterface availability={multiDurationAvailability} />
}
```

**Key Benefits:**

- **Seamless Rebooking**: Clients can schedule immediately after appointment completion
- **Duration Flexibility**: All available durations calculated simultaneously
- **Optimal Scheduling**: Reduces gaps in therapist schedule

### 2. Container-Based Event System

**Purpose**: Supports group bookings and event-specific scheduling

**Implementation**: Event search patterns identify container events and their members

```typescript
// Search for container events
const searchQuery = query + '__EVENT__'
const events = await getEventsBySearchQuery({
  start: startDate,
  end: endDate,
  query: searchQuery,
})

// Filter member events within containers
const members = events.filter((e) => {
  return (
    e.summary.includes(eventMemberString) ||
    (e.description && e.description.includes(eventMemberString))
  )
})
```

### 3. Intelligent API Management

**24-Hour Call Limiting:**

- Tracks API calls across all availability requests
- Distributes calls efficiently across different durations
- Falls back to cached data when limits approached
- Prevents Google Calendar quota exhaustion

**Optimized Calculation Patterns:**

- Calculates multiple durations in single data fetch cycle
- Reuses busy time data across duration calculations
- Minimizes redundant API calls through intelligent caching

## System Configuration

### Core Constants (`/config.ts`)

```typescript
// Appointment Configuration
export const ALLOWED_DURATIONS = [60, 90, 120, 150] // Available durations (minutes)
export const DEFAULT_DURATION = 90 // Default selection (minutes)
export const DEFAULT_APPOINTMENT_INTERVAL = 30 // Slot interval (minutes)

// Timing Configuration
export const LEAD_TIME = 3 * 60 // 3 hours minimum advance notice
export const SLOT_PADDING = 0 // Buffer around busy slots (minutes)

// System Configuration
export const OWNER_TIMEZONE = 'America/Los_Angeles' // System timezone
export const MAX_CALENDAR_CALLS_PER_24_HOURS = 100 // API call limit
```

### Environment Variables

```typescript
// Google OAuth Configuration
GOOGLE_OAUTH_CLIENT_ID = your_client_id
GOOGLE_OAUTH_SECRET = your_client_secret
GOOGLE_OAUTH_REFRESH = your_refresh_token

// Calendar Configuration
GOOGLE_CALENDAR_ID = primary
```

## Testing Architecture

### Comprehensive Test Coverage (`/lib/availability/__tests__/`)

**Test Categories (26 scenarios):**

1. **Basic Functionality**: Core slot generation and filtering
2. **Multi-Duration Support**: Various duration combinations
3. **Conflict Detection**: Busy time intersection handling
4. **Edge Cases**: Boundary conditions and error handling
5. **Performance Testing**: API call optimization validation
6. **Integration Testing**: End-to-end availability flow
7. **Real-world Scenarios**: Complex booking situations

```typescript
// Test framework: Vitest with comprehensive mocking
describe('getNextSlotAvailability', () => {
  // Mock Google Calendar API responses
  beforeEach(() => {
    mockGoogleCalendarAPI()
  })

  // Test basic functionality
  it('should generate multi-duration availability', async () => {
    const result = await getNextSlotAvailability('test-event-id')
    expect(result).toHaveProperty('90')
    expect(result).toHaveProperty('120')
    expect(result['90']).toBeInstanceOf(Array)
  })
})
```

## Future Enhancements

### Planned Improvements

1. **Real-time Validation**: Server-side availability confirmation during booking
2. **Advanced Caching**: Redis-based distributed caching for scalability
3. **Predictive Availability**: Machine learning for optimal slot suggestions
4. **Multi-therapist Support**: Expanded system for multiple service providers
5. **Dynamic Pricing**: Time-based and demand-based pricing integration

### Performance Monitoring

**Metrics to Track:**

- Average API response times
- Cache hit/miss ratios
- Slot generation performance
- User interaction patterns
- Booking conversion rates

## Error Handling and Resilience

### Graceful Degradation

- **API Failures**: Fallback to cached availability data
- **Invalid Selections**: Automatic correction to valid options
- **Network Issues**: Client-side state preservation
- **Calendar Conflicts**: Real-time conflict notification

### Security Considerations

- **Rate Limiting**: Prevents API abuse and quota exhaustion
- **Input Validation**: Multiple layers of data validation
- **Access Control**: Secure OAuth token management
- **CORS Protection**: API endpoint security

## Conclusion

The availability architecture represents a mature, scalable appointment generation system that balances real-time accuracy with performance optimization. The recent multi-duration enhancements provide significant improvements in user experience while maintaining system reliability and API efficiency.

The system's modular design enables easy extension for future features while maintaining backward compatibility and robust error handling. Comprehensive testing ensures reliability across complex booking scenarios and edge cases.

This architecture forms the foundation for a professional-grade appointment booking system capable of handling high-volume bookings while providing an exceptional user experience.
