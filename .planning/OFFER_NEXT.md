# OFFER_NEXT: Next Available Appointment Planning

## Executive Summary

This document explores the implementation of a "next available appointment" feature that identifies the soonest available time slot across all valid appointment durations. This system would enable immediate appointment booking for clients seeking the earliest possible availability, regardless of session length preference.

## Current System Analysis

### Existing Next-Slot Architecture

The system currently implements next-slot availability through:

1. **`getNextSlotAvailability()`** - Single duration, immediate post-event booking
2. **`createMultiDurationAvailability()`** - Multi-duration availability with caching
3. **`fetchSingleEvent()`** - Event-specific availability calculations

### Current Limitations

- ❌ No system-wide "next available" functionality
- ❌ Duration-specific searches require pre-selection
- ❌ No cross-duration optimization for earliest availability
- ❌ Limited to post-event scheduling rather than general availability

## Proposed "Offer Next" System

### Core Requirements

1. **Duration Agnostic**: Find earliest available slot across all valid durations
2. **Time Optimized**: Prioritize sooner appointments over longer durations
3. **User Preference Aware**: Allow duration preferences while showing alternatives
4. **Performance Focused**: Minimize API calls through intelligent caching
5. **Lead Time Agnostic**: Override 3-hour minimum advance booking requirement

### Use Cases

#### Primary Use Case: Geospacial Optimization

```
Client already has existing booking, can book 2nd or 3rd etc at same location without driving again
```

## API Fetch Method Analysis

### Fetch Method Comparison for "Offer Next"

| Method                     | Suitability          | Pros                                                                                                                                 | Cons                                                                                | Recommendation       |
| -------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | -------------------- |
| `getBusyTimes()`           | ⭐⭐⭐⭐⭐ EXCELLENT | • Efficient busy-time aggregation<br>• Multi-calendar support<br>• Minimal data transfer<br>• Optimized for availability calculation | • Requires additional processing for event details<br>• No event metadata           | **PRIMARY CHOICE**   |
| `fetchAllCalendarEvents()` | ⭐⭐⭐⭐ VERY GOOD   | • Complete event information<br>• Pagination support<br>• Rich metadata available<br>• Flexible filtering options                    | • Larger data payload<br>• Higher API quota usage<br>• Slower for pure availability | **SECONDARY CHOICE** |
| `getEventsBySearchQuery()` | ⭐⭐ LIMITED         | • Event-specific searches<br>• Query-based filtering                                                                                 | • Not optimized for general availability<br>• Requires predefined search terms      | Not recommended      |
| `fetchSingleEvent()`       | ⭐ POOR              | • Detailed single event data<br>• Minimal quota usage per call                                                                       | • Requires known event IDs<br>• Not suitable for discovery                          | Not applicable       |

Actual best method is:

- fetchAllCalendarEvents

The reason is that later interactions of the app will be drive time aware, better to start implementation now

### Recommended Hybrid Approach

```typescript
// Optimal implementation strategy
async function getNextAvailableAppointment(): Promise<NextAvailableResult> {
  // 1. Use getBusyTimes() for initial availability scan (efficient)
  const busySlots = await getBusyTimes({
    start: new Date(),
    end: addDays(new Date(), 14), // 2-week search window
  })

  // 2. Calculate available slots for all durations
  const availabilityMatrix = calculateMultiDurationAvailability(busySlots)

  // 3. Find earliest available slot across all durations
  const nextAvailable = findEarliestAvailableSlot(availabilityMatrix)

  return nextAvailable
}
```

## System Architecture Design

### Core Components

#### 1. Next Available Calculator (`/lib/availability/getNextAvailable.ts`)

```typescript
interface NextAvailableOptions {
  /** Search start time (default: now + lead time) */
  searchStart?: Date
  /** Search end time (default: 14 days from start) */
  searchEnd?: Date
  /** Duration preferences (empty = all valid durations) */
  preferredDurations?: number[]
  /** Maximum results to return */
  maxResults?: number
  /** Whether to include suboptimal durations */
  includeAlternatives?: boolean
}

interface NextAvailableSlot {
  /** Appointment start time */
  start: Date
  /** Appointment end time */
  end: Date
  /** Duration in minutes */
  duration: number
  /** Location information */
  location: LocationObject
  /** How many minutes from now */
  minutesFromNow: number
  /** Is this duration preferred by user */
  isPreferred: boolean
  /** Alternative durations at similar times */
  alternatives: NextAvailableSlot[]
}

interface NextAvailableResult {
  /** The soonest available appointment */
  nextSlot: NextAvailableSlot | null
  /** All available options within time window */
  allOptions: NextAvailableSlot[]
  /** Availability statistics */
  stats: {
    totalSlotsChecked: number
    availableSlots: number
    averageWaitTime: number
    durationDistribution: Record<number, number>
  }
  /** Cache information */
  cacheInfo: {
    generatedAt: Date
    validUntil: Date
    dataFreshness: 'fresh' | 'cached' | 'stale'
  }
}
```

#### 2. Multi-Duration Availability Matrix

```typescript
interface AvailabilityMatrix {
  /** Time slots indexed by start time */
  timeSlots: Map<string, TimeSlot>
  /** Duration-specific availability */
  durationMap: Map<number, AvailabilitySlot[]>
  /** Optimized search index for quick lookup */
  searchIndex: SearchIndex
}

interface TimeSlot {
  start: Date
  /** Available durations at this time */
  availableDurations: number[]
  /** Conflicting events */
  conflicts: CalendarEvent[]
  /** Location information */
  location: LocationObject
}
```

#### 3. Intelligent Caching System

```typescript
interface AvailabilityCache {
  /** Raw busy times from Google Calendar */
  busyTimes: DateTimeInterval[]
  /** Processed availability matrix */
  matrix: AvailabilityMatrix
  /** Cache metadata */
  metadata: {
    generatedAt: Date
    expiresAt: Date
    apiCallsUsed: number
    dataRange: DateTimeInterval
  }
  /** Cache validation methods */
  isValid: () => boolean
  refresh: () => Promise<void>
  invalidate: () => void
}
```

### Implementation Strategy

#### Phase 1: Core Availability Engine

```typescript
// /lib/availability/getNextAvailable.ts
export async function getNextAvailable(
  options: NextAvailableOptions = {}
): Promise<NextAvailableResult> {
  const {
    searchStart = addMinutes(new Date(), LEAD_TIME),
    searchEnd = addDays(new Date(), 14),
    preferredDurations = [],
    maxResults = 10,
    includeAlternatives = true,
  } = options

  // 1. Get busy times efficiently
  const busyTimes = await getBusyTimes({
    start: searchStart,
    end: searchEnd,
  })

  // 2. Create availability matrix for all valid durations
  const matrix = createAvailabilityMatrix({
    busyTimes,
    searchStart,
    searchEnd,
    validDurations: VALID_DURATIONS,
    ownerAvailability: OWNER_AVAILABILITY,
  })

  // 3. Find earliest available slots
  const earliestSlots = findEarliestSlots(matrix, {
    preferredDurations,
    maxResults,
    includeAlternatives,
  })

  // 4. Calculate statistics and metadata
  const stats = calculateAvailabilityStats(matrix)
  const cacheInfo = generateCacheInfo()

  return {
    nextSlot: earliestSlots[0] || null,
    allOptions: earliestSlots,
    stats,
    cacheInfo,
  }
}
```

## User Interface Integration

### Frontend Component Architecture

#### Next Available Widget

```typescript
// /components/booking/NextAvailableWidget.tsx
interface NextAvailableWidgetProps {
  /** Show duration options */
  showDurationOptions?: boolean
  /** Maximum suggestions to display */
  maxSuggestions?: number
  /** Allow duration preference selection */
  allowPreferences?: boolean
  /** Callback when appointment selected */
  onSlotSelected: (slot: NextAvailableSlot) => void
}

export function NextAvailableWidget(props: NextAvailableWidgetProps) {
  const [nextAvailable, setNextAvailable] = useState<NextAvailableResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState<number[]>([])

  // Real-time availability updates
  useEffect(() => {
    const fetchNextAvailable = async () => {
      const result = await getNextAvailable({
        preferredDurations: preferences,
        maxResults: props.maxSuggestions || 5
      })
      setNextAvailable(result)
      setLoading(false)
    }

    fetchNextAvailable()

    // Refresh every 5 minutes
    const interval = setInterval(fetchNextAvailable, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [preferences])

  return (
    <div className="next-available-widget">
      <h3>Next Available Appointments</h3>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          {nextAvailable?.nextSlot && (
            <PrimarySlotDisplay
              slot={nextAvailable.nextSlot}
              onBook={() => props.onSlotSelected(nextAvailable.nextSlot!)}
            />
          )}

          <AlternativeSlotsList
            slots={nextAvailable?.allOptions || []}
            onSlotSelect={props.onSlotSelected}
          />
        </>
      )}
    </div>
  )
}
```

### API Endpoint Design

#### RESTful API for Next Available

```typescript
// /app/api/availability/next/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const options: NextAvailableOptions = {
    preferredDurations: searchParams.get('durations')?.split(',').map(Number) || [],
    maxResults: Number(searchParams.get('maxResults')) || 10,
    includeAlternatives: searchParams.get('includeAlternatives') !== 'false',
  }

  try {
    const result = await getNextAvailable(options)

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        processingTime: `${Date.now() - startTime}ms`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch next available appointment',
          code: 'AVAILABILITY_ERROR',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      },
      { status: 500 }
    )
  }
}
```

## Testing Strategy

### Test Coverage Requirements

#### Unit Tests

```typescript
// /lib/availability/__tests__/getNextAvailable.test.ts
describe('getNextAvailable', () => {
  describe('Basic Functionality', () => {
    it('should find earliest available slot across all durations', async () => {
      const mockBusyTimes = createMockBusyTimes()
      const result = await getNextAvailable()

      expect(result.nextSlot).toBeDefined()
      expect(result.nextSlot!.start).toBeInstanceOf(Date)
      expect(VALID_DURATIONS).toContain(result.nextSlot!.duration)
    })

    it('should respect lead time requirements', async () => {
      const result = await getNextAvailable()
      const leadTimeThreshold = addMinutes(new Date(), LEAD_TIME)

      expect(result.nextSlot!.start).toBeAfter(leadTimeThreshold)
    })
  })

  describe('Duration Preferences', () => {
    it('should prioritize preferred durations', async () => {
      const result = await getNextAvailable({
        preferredDurations: [90, 120],
      })

      expect([90, 120]).toContain(result.nextSlot!.duration)
    })

    it('should include alternatives when preferred unavailable', async () => {
      const result = await getNextAvailable({
        preferredDurations: [240], // Unlikely to be immediately available
        includeAlternatives: true,
      })

      expect(result.allOptions).toHaveLength.greaterThan(1)
      expect(result.allOptions.some((slot) => slot.duration !== 240)).toBe(true)
    })
  })

  describe('Performance Tests', () => {
    it('should complete search within reasonable time', async () => {
      const startTime = Date.now()
      await getNextAvailable()
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(5000) // 5 seconds max
    })

    it('should minimize API calls through caching', async () => {
      const apiCallCounter = jest.fn()
      mockGoogleCalendarAPI(apiCallCounter)

      // Two consecutive calls should use cache
      await getNextAvailable()
      await getNextAvailable()

      expect(apiCallCounter).toHaveBeenCalledTimes(1)
    })
  })
})
```

#### Integration Tests

```typescript
// /app/api/availability/next/__tests__/integration.test.ts
describe('Next Available API Integration', () => {
  it('should handle concurrent requests efficiently', async () => {
    const requests = Array(10)
      .fill(null)
      .map(() => fetch('/api/availability/next'))

    const responses = await Promise.all(requests)
    const results = await Promise.all(responses.map((r) => r.json()))

    expect(results.every((r) => r.success)).toBe(true)
    expect(results.every((r) => r.data.nextSlot)).toBe(true)
  })
})
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

- [ ] Implement core `getNextAvailable()` function
- [ ] Create availability matrix data structure
- [ ] Add basic caching mechanism
- [ ] Unit test coverage for core functionality
