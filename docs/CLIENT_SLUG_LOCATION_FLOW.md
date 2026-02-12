# Client Slug Location Flow

## Overview

Location can be defined in MDX frontmatter and flows through the booking system at multiple levels.

## Architecture

```
MDX Frontmatter (location data)
    ↓
LocationDisplay Component (renders location on page)
    ↓
Slug Configuration (passed to booking system)
    ↓
GeneralBookingFeature (uses location for booking)
    ↓
Calendar/Availability (filters by location if needed)
```

## Location in MDX Frontmatter

Define location in MDX frontmatter using `LocationObject` format:

```mdx
---
title: 'Airbnb Massage Booking'
clientName: 'Hotel June'
location:
  street: '8639 Lincoln Blvd'
  city: 'Los Angeles'
  zip: '90045'
---
```

**All three fields are optional:**
- `street` - Specific address (optional)
- `city` - City name (required)
- `zip` - Zip code (optional)

## LocationDisplay Component

Display location on the page using the `<LocationDisplay />` component:

```mdx
<LocationDisplay
  street="8639 Lincoln Blvd"
  city="Los Angeles"
  zip="90045"
  title="Where We Serve"
/>
```

**Props:**
- `street` (string, optional) - Street address
- `city` (string, required) - City name
- `zip` (string, optional) - Zip code
- `title` (string, optional) - Section title. Default: "Service Location"

## Connecting Location to Booking Slug

### Current Flow (Slug Configuration System)

When a slug is routed:

1. **MDX frontmatter is loaded** (including location)
2. **Slug configuration is fetched** from `fetchSlugConfigurationData.ts`
3. **Location is extracted** from configuration
4. **GeneralBookingFeature receives location** in configuration object

### Implementation Steps (Future)

To pass MDX location to the booking slug:

**Step 1: Extract location from MDX frontmatter**
```typescript
// In [bookingSlug]/page.tsx
const mdxData = await loadMDXFile(bookingSlug)
const { location } = mdxData.frontmatter
```

**Step 2: Merge into slug configuration**
```typescript
const configuration = {
  ...baseConfiguration,
  location: mdxData.frontmatter.location,
}
```

**Step 3: Pass to GeneralBookingFeature**
```tsx
<GeneralBookingFeature
  configuration={configuration}
  // ... other props
/>
```

## How Location is Used in Booking

Once location reaches the booking system, it's used for:

1. **UI Display** - Shows where the service is happening
2. **Calendar Filtering** - Could filter availability by location
3. **Availability Slots** - `StringDateTimeIntervalAndLocation[]` includes location
4. **Confirmation** - Location displayed on confirmation email

## Location Object Type

```typescript
interface LocationObject {
  street: string
  city: string
  zip: string
}
```

Examples of valid locations:

```typescript
// Airbnb property
createLocationObject('8639 Lincoln Blvd', 'Los Angeles', '90045')

// Area-wide (no street)
createLocationObject('', 'Los Angeles', '90210')

// City only
createLocationObject('', 'Los Angeles', '')
```

## When Location is Fixed vs Flexible

### Fixed Location (`locationIsReadOnly: true`)

User cannot change the location:

```mdx
---
location:
  street: 'Hotel June West LA, 8639 Lincoln Blvd'
  city: 'Los Angeles'
  zip: '90045'
---
```

Combined with slug config:
```typescript
locationIsReadOnly: true,
```

→ Location field hidden from booking form, locked to specified address

### Flexible Location (user can change)

User can specify their location:

```mdx
---
location:
  street: ''
  city: 'Los Angeles'
  zip: ''
---
```

→ Location field shown in booking form, user can enter their address

## Location + Pricing Combo

Location can be combined with other MDX features:

```mdx
---
title: 'Airbnb Massage'
location:
  street: '123 Main St'
  city: 'Los Angeles'
  zip: '90210'
---

<LocationDisplay
  street="123 Main St"
  city="Los Angeles"
  zip="90210"
/>

<PricingComparison durations={[60, 90, 120]} />

<ExternalBookingLink href="https://..." platform="Book Now" />
```

## Summary

| Level | What Happens |
|-------|-------------|
| **MDX Frontmatter** | Stores location data |
| **LocationDisplay** | Renders location on page |
| **Slug Config** | Passes to booking system |
| **GeneralBookingFeature** | Uses for availability filtering + UI |
| **Calendar/Form** | Displays or allows editing |

Location flows from static (MDX) → dynamic (booking system) automatically.
