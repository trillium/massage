# Availability Flow Documentation

## Overview

This document provides a comprehensive analysis of how availability data flows through the massage booking system, from Google Calendar integration to frontend display and user interaction.

## Architecture Summary

The availability system follows this high-level flow:

```
Google Calendar API → Availability Processing → Redux State → Frontend Components → User Interaction
```

## Core Files Involved

### Data Fetching & API Integration

- `/lib/availability/getAccessToken.ts` - Google OAuth token management
- `/lib/availability/getBusyTimes.ts` - Fetches busy slots from Google Calendar
- `/lib/availability/getEventsBySearchQuery.ts` - Searches calendar events by query
- `/lib/fetch/fetchData.ts` - Main data fetching orchestrator
- `/lib/fetch/fetchContainersByQuery.ts` - Fetches container-based events

### Availability Processing

- `/lib/availability/createSlots.ts` - Creates available time slots
- `/lib/availability/getPotentialTimes.ts` - Generates potential booking times
- `/lib/availability/getAvailability.ts` - Filters busy times from potential slots
- `/lib/availability/helpers.ts` - Date/time utility functions
- `/lib/availability/mergeOverlappingIntervals.ts` - Merges overlapping time intervals

### Configuration & Types

- `/config.ts` - Owner availability schedule and system constants
- `/lib/types.ts` - TypeScript type definitions
- `/lib/day.ts` - Day manipulation utilities
- `/lib/dayAsObject.ts` - Day conversion utilities

### State Management

- `/redux/slices/availabilitySlice.ts` - Redux state for availability data
- `/redux/hooks.ts` - Redux hooks for components

### Frontend Components

- `/components/availability/date/Calendar.tsx` - Calendar date picker
- `/components/availability/time/TimeList.tsx` - Time slot selection
- `/components/availability/controls/DurationPicker.tsx` - Duration selection
- `/components/utilities/InitialUrlUtility.tsx` - Initial state setup
- `/components/utilities/UpdateSlotsUtility.tsx` - Slot updates
- `/components/utilities/UrlUpdateUtility.tsx` - URL synchronization

### Page Configuration

- `/app/book/page.tsx` - Main booking page
- `/app/[bookingSlug]/page.tsx` - Dynamic booking pages
- `/lib/slugConfigurations/createPageConfiguration.tsx` - Page setup logic

### Calendar Management

- `/lib/availability/createCalendarAppointment.ts` - Creates confirmed appointments
- `/lib/availability/createOnsiteAppointment.ts` - Creates onsite appointments

## Detailed Flow Analysis

### 1. Initial Data Fetching

#### Standard Booking Page (`/book`)

```typescript
// app/book/page.tsx
const { slots, data, start, end } = await createPageConfiguration({ resolvedParams })
```

#### Data Fetching Process

```typescript
// lib/fetch/fetchData.ts
export async function fetchData({ searchParams }) {
  // 1. Define time range (today + 14 days)
  const start = Day.todayWithOffset(0)
  const end = Day.todayWithOffset(14)

  // 2. Get busy times from Google Calendar
  const busy = await getBusyTimes(getDateRangeInterval({ start, end }))

  // 3. Return processed data
  return {
    start: start.toString(),
    end: end.toString(),
    busy: mapDatesToStrings(busy),
  }
}
```

### 2. Google Calendar Integration

#### Authentication

```typescript
// lib/availability/getAccessToken.ts
export default async function getAccessToken(): Promise<string> {
  // Uses OAuth refresh token to get access token
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

  return json.access_token
}
```

#### Busy Time Retrieval

```typescript
// lib/availability/getBusyTimes.ts
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

  // Returns array of busy time intervals
  return processedBusySlots
}
```

#### Calendars Checked

```typescript
// config.ts
export const CALENDARS_TO_CHECK = [
  'primary',
  'trillium@hatsfabulous.com',
  'trillium@trilliumsmith.com',
]
```

### 3. Availability Processing

#### Owner Schedule Configuration

```typescript
// config.ts
const DEFAULT_WORKDAY = [
  {
    start: { hour: 10 }, // 10 AM
    end: { hour: 23 }, // 11 PM
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

#### Slot Creation Process

```typescript
// lib/availability/createSlots.ts
export function createSlots({
  start,
  end,
  busy,
  leadTime = LEAD_TIME,
  duration,
  containers,
}: CreateSlotsType): StringDateTimeIntervalAndLocation[] {
  // 1. Generate potential time slots based on owner availability
  const potential = getPotentialTimes({
    start,
    end,
    duration,
    availabilitySlots: OWNER_AVAILABILITY,
    containers,
  })

  // 2. Filter out busy times
  const offers = getAvailability({
    busy: mapStringsToDates(busy),
    potential,
    leadTime,
  })

  // 3. Filter to date range
  const slots = offers.filter((slot) => {
    return slot.start >= startOfInterval && slot.end <= endOfInterval
  })

  return slots
}
```

#### Potential Time Generation

```typescript
// lib/availability/getPotentialTimes.ts
export default function getPotentialTimes({
  start,
  end,
  duration,
  availabilitySlots,
  defaultAppointmentInterval = DEFAULT_APPOINTMENT_INTERVAL,
  containers,
}): StringDateTimeInterval[] {
  // 1. Validate inputs
  if (startInterval.start >= endInterval.end || duration <= 0) {
    return []
  }

  // 2. Calculate appointment interval (30 min default)
  const INTERVAL = duration < defaultAppointmentInterval ? duration : defaultAppointmentInterval

  // 3. Generate slots for each day based on owner availability
  const days = eachDayOfInterval({ start: startOfInterval, end: endOfInterval })

  // 4. For each day, create time slots within availability windows
  // 5. Return formatted time intervals
}
```

#### Availability Filtering

```typescript
// lib/availability/getAvailability.ts
export default function getAvailability({
  potential,
  busy,
  padding = SLOT_PADDING, // 0 minutes
  leadTime = LEAD_TIME, // 3 hours
}) {
  // 1. Filter out slots that conflict with busy times
  const available = potential.filter((slot) => {
    return !busy.some((busySlot) => areIntervalsOverlapping(slot, busySlot))
  })

  // 2. Apply lead time filtering (minimum 3 hours advance notice)
  const now = new Date()
  const withLeadTime = available.filter((slot) => {
    return new Date(slot.start) >= add(now, { minutes: leadTime })
  })

  return withLeadTime
}
```

### 4. State Management

#### Redux State Structure

```typescript
// redux/slices/availabilitySlice.ts
interface AvailabilityState {
  duration: number | null
  selectedDate: string | null
  selectedTime: IntervalType | null
  start: string
  end: string
  timeZone: string
  slots: StringDateTimeIntervalAndLocation[]
}

const initialState: AvailabilityState = {
  duration: null,
  selectedDate: null,
  selectedTime: null,
  start: Day.todayWithOffset(0).toString(),
  end: Day.todayWithOffset(14).toString(),
  timeZone: 'America/Los_Angeles',
  slots: [],
}
```

#### State Updates

```typescript
// redux/slices/availabilitySlice.ts
export const availabilitySlice = createSlice({
  name: 'availability',
  initialState,
  reducers: {
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload
    },
    setSelectedTime: (state, action: PayloadAction<IntervalType>) => {
      state.selectedTime = action.payload
    },
    setSlots: (state, action: PayloadAction<StringDateTimeIntervalAndLocation[]>) => {
      state.slots = action.payload
    },
  },
})
```

### 5. Frontend Components

#### Initial State Setup

```typescript
// components/utilities/InitialUrlUtility.tsx
export function InitialUrlUtility({
  selectedDate,
  duration,
  slots,
  configSliceData,
}: InitialUrlUtilityProps) {
  useEffect(() => {
    // 1. Load slots into Redux
    dispatchRedux(setSlots(slots))

    // 2. Set initial selected date if none selected
    if (selectedDate && !selectedDateRedux) {
      dispatchRedux(setSelectedDate(selectedDate))
    } else if (slots.length > 0) {
      // Default to first available date
      const firstAvail = format(slots[0].start, 'yyyy-MM-dd', { timeZone })
      dispatchRedux(setSelectedDate(firstAvail))
    }

    // 3. Set initial duration
    const newDuration = duration || allowedDurations[Math.floor(allowedDurations.length / 2)]
    dispatchRedux(setDuration(newDuration))
  }, [])
}
```

#### Calendar Component

```typescript
// components/availability/date/Calendar.tsx
export default function Calendar() {
  const { slots: slotsRedux } = useReduxAvailability()
  const { timeZone } = useSelector((state: RootState) => state.availability)

  // 1. Group slots by date
  const availabilityByDate = slots.reduce((acc, slot) => {
    const date = format(slot.start, 'yyyy-MM-dd', { timeZone })
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {})

  // 2. Calculate availability scores for visual indicators
  const availabilityScore = (openSlots, maximumAvailability) => {
    return openSlots === 0
      ? 0
      : openSlots / maximumAvailability <= 1 / 3
        ? 1
        : openSlots / maximumAvailability <= 2 / 3
          ? 2
          : 3
  }

  // 3. Render calendar grid with availability indicators
}
```

#### Time List Component

```typescript
// components/availability/time/TimeList.tsx
export default function TimeList() {
  const { slots: slotsRedux, selectedDate } = useReduxAvailability()
  const { selectedTime, timeZone } = useReduxAvailability()

  // 1. Group slots by date
  const availabilityByDate = slots.reduce((acc, slot) => {
    const date = format(slot.start, 'yyyy-MM-dd', { timeZone })
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {})

  // 2. Get availability for selected date
  const availability = selectedDate ? availabilityByDate[selectedDate.toString()] : []

  // 3. Render time slot buttons
  return (
    <div className="grid grid-cols-2 gap-2">
      {availability?.map(({ start, end, location }) => {
        const isActive = selectedTime ? start + end === timeSignature : false
        return (
          <TimeButton
            key={start + end}
            active={isActive}
            time={{ start, end }}
            location={location}
          />
        )
      })}
    </div>
  )
}
```

#### Dynamic Slot Updates

```typescript
// components/utilities/UpdateSlotsUtility.tsx
export function UpdateSlotsUtility({
  busy,
  containers,
  start,
  end,
  configObject,
}: UpdateSlotsUtilityProps) {
  useEffect(() => {
    // 1. Regenerate slots when dependencies change
    const newSlots = createSlots({
      duration: durationRedux || DEFAULT_DURATION,
      leadTime: leadTime ?? LEAD_TIME,
      start,
      end,
      busy,
      containers,
    })

    // 2. Update Redux state
    dispatchRedux(setSlots(newSlots))

    // 3. Update URL parameters
    createNewUrlParams()
  }, [durationRedux, busy, containers, start, end])
}
```

### 6. Dynamic Booking Pages

#### Slug-based Configuration

```typescript
// lib/slugConfigurations/createPageConfiguration.tsx
export async function createPageConfiguration({
  bookingSlug,
  resolvedParams,
  overrides,
}: createPageConfigurationProps) {
  // 1. Load configuration for booking slug
  const slugData = await fetchSlugConfigurationData()
  let configuration = slugData[bookingSlug] ?? initialState

  // 2. Fetch data based on configuration type
  let data
  if (configuration?.type === 'scheduled-site' && bookingSlug) {
    data = await fetchContainersByQuery({
      searchParams: resolvedParams,
      query: bookingSlug,
    })
  } else {
    data = await fetchData({ searchParams: resolvedParams })
  }

  // 3. Create slots with configuration settings
  const slots = createSlots({
    start: dayFromString(data.start),
    end: dayFromString(data.end),
    busy: data.busy,
    duration,
    leadTime: configuration?.leadTimeMinimum ?? LEAD_TIME,
    ...data.data,
  })

  return { slots, configuration, data /* ... */ }
}
```

#### Container-based Events

```typescript
// lib/fetch/fetchContainersByQuery.ts
export async function fetchContainersByQuery({
  query,
}: {
  searchParams: SearchParamsType
  query: string
}) {
  // 1. Search for container events
  const searchQuery = query + '__EVENT__'
  const events = await getEventsBySearchQuery({
    start: startDate,
    end: endDate,
    query: searchQuery,
  })

  // 2. Filter member events
  const members = events.filter((e) => {
    return (
      e.summary.includes(eventMemberString) ||
      (e.description && e.description.includes(eventMemberString))
    )
  })

  // 3. Map to busy slots
  const busyQuery = members.map((e) => ({
    start: e.start.dateTime,
    end: e.end.dateTime,
  }))

  return { busy: busyQuery, containers: containerEvents /* ... */ }
}
```

### 7. User Interaction Flow

#### Complete User Journey

1. **Page Load**:

   - `createPageConfiguration` fetches availability data
   - `InitialUrlUtility` sets up initial Redux state
   - Components render with available slots

2. **Duration Selection**:

   - User selects duration via `DurationPicker`
   - `UpdateSlotsUtility` regenerates slots for new duration
   - Calendar and TimeList update automatically

3. **Date Selection**:

   - User clicks date in `Calendar` component
   - `setSelectedDate` updates Redux state
   - `TimeList` filters to show times for selected date

4. **Time Selection**:

   - User clicks time slot in `TimeList`
   - `setSelectedTime` updates Redux state
   - Booking modal opens with selected time

5. **Real-time Updates**:
   - URL parameters sync with selections via `UrlUpdateUtility`
   - State persists across page navigation
   - Components re-render based on Redux state changes

## Key Configuration Constants

```typescript
// config.ts
export const ALLOWED_DURATIONS = [60, 90, 120, 150] // Available durations
export const DEFAULT_DURATION = 90 // Default selection
export const SLOT_PADDING = 0 // Buffer around busy slots
export const LEAD_TIME = 3 * 60 // 3 hours minimum advance notice
export const DEFAULT_APPOINTMENT_INTERVAL = 30 // 30-minute slot intervals
export const OWNER_TIMEZONE = 'America/Los_Angeles' // System timezone
```

## Data Types

### Core Availability Types

```typescript
// lib/types.ts
interface StringDateTimeIntervalAndLocation {
  start: string // ISO datetime string
  end: string // ISO datetime string
  location?: string // Optional location
}

interface DateTimeInterval {
  start: Date
  end: Date
}

interface AvailabilitySlotsMap {
  [dayOfWeek: number]: {
    start: { hour: number; minute?: number }
    end: { hour: number; minute?: number }
  }[]
}
```

## Performance Considerations

### Caching Strategy

- Google Calendar API responses cached with `revalidate: 1` (1 second)
- OAuth tokens cached until expiration
- Availability data fetched server-side for SSR

### Optimization Points

- Slots filtered client-side for responsive interaction
- Date calculations memoized where possible
- Redux selectors prevent unnecessary re-renders

## Error Handling

### API Failures

- Google Calendar API errors gracefully handled
- Fallback to empty availability on fetch failures
- User feedback for connection issues

### State Validation

- Invalid duration selections automatically corrected
- Date bounds enforced on selections
- Time zone consistency maintained throughout

## Future Enhancements

Based on `availability_confirmation_plan.md`, the next major improvement will be real-time availability validation during booking submission to prevent double-bookings in the serverless architecture.
