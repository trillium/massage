# Massage Booking System - Current Flow Analysis

## Overview

This document analyzes the current booking flow for the massage therapy application, mapping out the complete user journey from initial visit to confirmed appointment.

## System Architecture

The booking system is built on **Next.js 14** with the following key technologies:

- **Redux Toolkit** for state management
- **React Hook Form** patterns for form handling
- **Zod** for data validation
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Google Calendar API** for appointment management

## Complete Booking Flow

### 1. Entry Points

Users can access the booking system through multiple entry points:

#### Main Booking Page (`/book`)

- Primary entry point at `/book`
- Shows duration picker, calendar, and time slots
- Uses `BookingForm` component for appointment requests

#### Dynamic Booking Pages (`/[bookingSlug]`)

- Custom booking pages with specific configurations
- Uses slug-based configurations for different service types
- Supports specialized settings (pricing, durations, etc.)

### 2. Availability Selection Process

#### Duration Selection

- **Component**: `DurationPicker`
- **Allowed Options**: Configurable durations (15, 30, 45, 60, 90 minutes)
- **Default**: 90 minutes
- **Pricing**: Dynamic pricing based on duration
- **State Management**: Redux `availabilitySlice.duration`

#### Date Selection

- **Component**: `Calendar`
- **Display**: Shows available dates with appointment counts
- **Data Source**: Fetched availability slots from Google Calendar
- **Logic**:
  - Groups slots by date using `date-fns-tz`
  - Shows visual indicators for availability density
  - Filters out busy/unavailable slots

#### Time Selection

- **Component**: `TimeList`
- **Display**: Grid of available time slots for selected date
- **Filtering**: Shows only slots matching selected duration
- **Selection**: Updates Redux state with start/end times

### 3. Booking Form Process

#### Form Trigger

- **Trigger**: Selecting a time slot opens the booking modal
- **Component**: `BookingForm` in a `Modal` wrapper
- **State**: Redux `modalSlice` manages open/closed/busy/error states

#### Form Fields

The booking form collects:

**Personal Information:**

- First Name (required)
- Last Name (required)
- Email (required)
- Phone Number (required)

**Location Information:**

- Street Address (required)
- City (required)
- Zip Code (required)

**Payment Information:**

- Payment Method (if `acceptingPayment` is true)
- Options: Cash, Venmo, Zelle, Check

#### Form Validation

- **Client-side**: Real-time validation with Redux state updates
- **Schema**: Zod validation via `AppointmentRequestSchema`
- **Required Fields**: Enforced before submission

### 4. Form Submission Flow

#### Frontend Processing (`handleSubmit.ts`)

1. **Prevent Default**: Intercepts form submission
2. **Status Update**: Sets modal to "busy" state
3. **Payload Building**: Combines form data with additional metadata:
   - Selected time slot (start/end)
   - Duration and pricing
   - Timezone information
   - Event base strings for calendar integration
4. **API Call**: POST to `/api/request` endpoint

#### Backend Processing (`/api/request/route.ts`)

**Rate Limiting:**

- **Implementation**: LRU Cache with 5 requests per IP per minute
- **Protection**: Prevents spam and abuse

[[Lets create tests to make sure this works. If this is in serverless functions on Vercel, how do we know IP data is being preserverd to prevent spam? Is that how it works?]]
[[Make a writeup describing how the rate limiting works and if it has any inconsistencies]]

**Data Validation:**

- **Schema**: Validates against `AppointmentRequestSchema`
- **Security**: Ensures data integrity before processing

**Email Notifications:**

1. **Approval Email** → Massage therapist

   - Contains appointment details
   - Includes approval URL with hash-based security
   - Shows client information and preferences

2. **Confirmation Email** → Client
   - Confirms request was received
   - Sets expectations for response time
   - Provides contact information

**Response Handling:**

- **Success**: Returns `{success: true}` with 200 status
- **Failure**: Returns error details with appropriate status codes

### 5. Post-Submission Flow

#### Success Path

1. **Modal Closure**: Redux sets modal to "closed"
2. **Navigation**: Router pushes to `/confirmation` page
3. **Confirmation Display**: Shows booking summary and next steps

#### Error Handling

1. **Modal State**: Redux sets modal to "error"
2. **User Feedback**: Error message displayed in form
3. **Retry Option**: User can correct and resubmit

### 6. Appointment Approval Process

#### Therapist Approval

1. **Email Link**: Therapist clicks approval URL from email
2. **Security Check**: Hash validation ensures link integrity
3. **Calendar Creation**: `/api/confirm` endpoint creates Google Calendar event
4. **Redirect**: Takes therapist to `/booked` page with event details

#### Calendar Integration

- **Service**: Google Calendar API v3
- **Event Creation**: Creates structured calendar appointment
- **Details Include**:
  - Client contact information
  - Service duration and type
  - Location details
  - Unique event identifiers

## Key Technologies & Patterns

### State Management (Redux)

- **Form Data**: `formSlice` manages user input
- **Availability**: `availabilitySlice` handles time/date selection
- **UI State**: `modalSlice` controls form visibility and status
- **Configuration**: `configSlice` manages booking page settings

### Type Safety

- **TypeScript**: Full type coverage across components
- **Zod Schemas**: Runtime validation with compile-time types
- **API Contracts**: Strongly typed request/response interfaces

### Security Features

- **Hash-based URLs**: Approval links use cryptographic hashes
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Multiple layers of validation
- **CORS Protection**: Secure API endpoints

### Performance Optimizations

- **Dynamic Imports**: Code splitting for optimal loading
- **Memoization**: React optimization patterns
- **Efficient Rendering**: Redux selectors minimize re-renders

## Current Strengths

1. **Type Safety**: Comprehensive TypeScript implementation
2. **Security**: Multiple validation layers and secure approval process
3. **User Experience**: Intuitive step-by-step booking flow
4. **Error Handling**: Robust error states and user feedback
5. **Integration**: Seamless Google Calendar integration
6. **Testing**: Comprehensive integration test suite
7. **Accessibility**: Proper ARIA labels and semantic HTML
8. **Responsive Design**: Mobile-friendly interface

## Data Flow Summary

```
User Selection → Redux State → Form Submission → API Validation →
Email Notifications → Therapist Approval → Calendar Creation →
Confirmation → Completed Booking
```

This booking system represents a mature, production-ready appointment scheduling solution with strong emphasis on security, user experience, and data integrity.
