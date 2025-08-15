# Multi-Duration Availability System Usage

The new `createMultiDurationAvailability` function creates a state-friendly object that can handle multiple duration options without requiring repeated API calls to the calendar.

## Basic Usage

```typescript
import { createMultiDurationAvailability } from '@/lib/availability/getNextSlotAvailability'

// Create the multi-duration availability object once
const availabilitySystem = await createMultiDurationAvailability({
  currentEvent: yourCalendarEvent,
  durationOptions: [30, 60, 90, 120], // minutes
  slotInterval: 15,
  maxMinutesAhead: 30,
})

// Now you can get slots for any duration without additional API calls
const thirtyMinSlots = availabilitySystem.getAvailableSlotsForDuration(30)
const sixtyMinSlots = availabilitySystem.getAvailableSlotsForDuration(60)
const ninetyMinSlots = availabilitySystem.getAvailableSlotsForDuration(90)
```

## State Management Integration

```typescript
// Perfect for React state that changes duration frequently
const [selectedDuration, setSelectedDuration] = useState(60)
const [availabilitySystem, setAvailabilitySystem] = useState(null)

useEffect(() => {
  // Initialize once when component mounts
  createMultiDurationAvailability({
    currentEvent: event,
    durationOptions: [30, 60, 90, 120],
  }).then(setAvailabilitySystem)
}, [event])

// When user changes duration, no API call needed!
const handleDurationChange = (newDuration) => {
  setSelectedDuration(newDuration)
  // availabilitySystem.getAvailableSlotsForDuration(newDuration) is instant
}

// Get current slots for TimeList component
const currentSlots = availabilitySystem?.getTimeListFormatForDuration(selectedDuration) || []
```

## Key Benefits

1. **Single API Call**: Calendar data is fetched once and cached
2. **Instant Duration Changes**: No loading when user changes duration
3. **Smart Caching**: Cache validity check prevents stale data
4. **On-Demand Calculation**: Durations not in the initial options are calculated as needed
5. **State-Friendly**: Returns plain objects suitable for React state

## Available Methods

- `getSlotsForDuration(duration)` - All slots (available and unavailable)
- `getAvailableSlotsForDuration(duration)` - Only available slots
- `getTimeListFormatForDuration(duration)` - Slots formatted for TimeList component
- `getAvailableDurations()` - List of durations that have at least one available slot
- `isCacheValid()` - Check if cache is still fresh (within 5 minutes)

## Cache Structure

The availability system maintains a cache with:

- Original calendar event data
- All fetched calendar events for conflict checking
- Pre-calculated slots for specified duration options
- Cache timestamp for validity checking
- Event location and timing information

## Legacy Functions

The original functions `getNextSlotAvailability` and `getAvailableNextSlots` are still available for single-duration use cases, but for scenarios where users frequently change duration options, the new multi-duration system is recommended for better performance.
