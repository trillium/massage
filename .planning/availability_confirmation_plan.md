# Availability Confirmation Flow Plan

## Problem Statement

The current system fetches availability slots at page load, but there's no real-time updates. This creates potential for double-bookings or stale availability data. Since we're using a serverless architecture, WebSocket solutions are not viable.

## Proposed Solution: Re-fetch During Booking Flow

### Implementation Strategy

#### 1. Pre-submission Availability Check

```typescript
const validateAvailabilityBeforeSubmission = async (selectedSlot: TimeSlot) => {
  try {
    const response = await fetch('/api/availability/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: selectedSlot.start,
        end: selectedSlot.end,
        duration: selectedSlot.duration,
      }),
    })

    const { available, reason } = await response.json()

    if (!available) {
      throw new AvailabilityError(reason || 'Time slot no longer available')
    }

    return true
  } catch (error) {
    // Handle availability check failure
    throw error
  }
}
```

#### 2. Booking Flow Integration

```typescript
// In handleSubmit.ts
export function handleSubmit({
  event,
  dispatchRedux,
  router,
  additionalData,
  endPoint,
}: HandleSubmitProps) {
  event.preventDefault()
  dispatchRedux(setModal({ status: 'busy' }))

  const formData = new FormData(event.currentTarget)
  const selectedTime = {
    start: formData.get('start') as string,
    end: formData.get('end') as string,
    duration: parseInt(formData.get('duration') as string),
  }

  // Step 1: Validate availability before processing
  validateAvailabilityBeforeSubmission(selectedTime)
    .then(() => {
      // Step 2: Proceed with booking if still available
      const payload = buildBookingPayload(formData, additionalData)
      return fetch(endPoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    })
    .then(async (response) => {
      const json = await response.json()
      if (json.success) {
        dispatchRedux(setModal({ status: 'closed' }))
        router.push('/confirmation')
      } else {
        dispatchRedux(setModal({ status: 'error' }))
      }
    })
    .catch((error) => {
      if (error instanceof AvailabilityError) {
        // Show specific availability error
        dispatchRedux(
          setModal({
            status: 'error',
            message: 'Sorry, this time slot is no longer available. Please select another time.',
          })
        )
        // Refresh availability data
        dispatchRedux(refreshAvailability())
      } else {
        dispatchRedux(setModal({ status: 'error' }))
      }
    })
}
```

#### 3. API Endpoint Implementation

```typescript
// /api/availability/check/route.ts
export async function POST(req: NextRequest) {
  try {
    const { start, end, duration } = await req.json()

    // Fetch current busy slots from Google Calendar
    const busySlots = await fetchCurrentBusySlots(start, end)

    // Check if requested slot conflicts with any busy slots
    const isAvailable = !busySlots.some((busySlot) =>
      slotsOverlap({ start, end }, { start: busySlot.start, end: busySlot.end })
    )

    return NextResponse.json({
      available: isAvailable,
      reason: isAvailable ? null : 'Time slot is no longer available',
    })
  } catch (error) {
    return NextResponse.json(
      { available: false, reason: 'Unable to check availability' },
      { status: 500 }
    )
  }
}
```

#### 4. Enhanced Error Handling

```typescript
class AvailabilityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AvailabilityError'
  }
}

// Enhanced modal state to handle specific error types
interface ModalState {
  status: 'closed' | 'open' | 'busy' | 'error' | 'availability_error'
  message?: string
}

// In BookingForm component
{modal === 'availability_error' && (
  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
    <p className="font-medium">Time Slot No Longer Available</p>
    <p className="text-sm mt-1">
      Someone else may have booked this time. Please select another available slot.
    </p>
    <button
      onClick={() => {
        dispatchRedux(setModal({ status: 'closed' }))
        dispatchRedux(refreshAvailability())
      }}
      className="mt-2 text-sm underline"
    >
      Refresh available times
    </button>
  </div>
)}
```

## User Experience Flow

1. **User selects time slot** → Opens booking modal
2. **User fills out form** → All form validation passes
3. **User clicks submit** → Form shows "busy" state
4. **System checks availability** → Re-validates the selected slot
5. **If available** → Proceeds with booking submission
6. **If not available** → Shows friendly error message and refreshes slots
7. **User selects new time** → Process repeats

## Benefits

- **Prevents double bookings** without requiring WebSocket infrastructure
- **Serverless compatible** using standard HTTP requests
- **Good user experience** with clear feedback when slots become unavailable
- **Minimal performance impact** as check only happens on submission
- **Graceful degradation** if availability check fails, booking still processes

## Implementation Timeline

- **Week 1**: Create `/api/availability/check` endpoint
- **Week 2**: Integrate availability check into booking submission flow
- **Week 3**: Enhance error handling and user feedback
- **Week 4**: Testing and refinement

## Future Enhancements

- **Optimistic locking**: Include timestamp-based validation
- **Slot reservation**: Temporarily hold slots for active users
- **Bulk availability refresh**: Refresh entire availability when conflicts detected
