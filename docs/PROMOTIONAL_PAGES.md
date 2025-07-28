# Promotional Pages Setup Guide

This guide explains how to create and manage promotional booking pages in the massage booking system.

## Overview

The system supports promotional pages through dynamic slug configurations that can include:

- Special pricing/discounts
- Custom messaging
- Location-specific configurations
- Referral tracking

## Available Promotional Routes

Visit `/promo-routes` to see all current promotional configurations and routes.

## Creating a New Promotional Page

### Step 1: Add Slug Configuration

Edit `/lib/slugConfigurations/fetchSlugConfigurationData.ts`:

```typescript
const myNewPromo: SlugConfigurationType = {
  ...initialState,
  bookingSlug: 'my-new-promo',
  type: 'area-wide',
  title: 'Special Promotion Title!',
  text: 'Description of the promotional offer.',
  discount: {
    type: 'percent',
    amountPercent: 0.2, // 20% off
  },
  // Optional: specific location
  location: 'Specific Area, Los Angeles',
  // Optional: minimum lead time in minutes
  leadTimeMinimum: 60,
  // Optional: promotion end date
  promoEndDate: '2025-12-31', // Format: YYYY-MM-DD
}
```

### Step 2: Register the Slug

Add your configuration to the return object in `fetchSlugConfigurationData()`:

```typescript
export async function fetchSlugConfigurationData(): Promise<SlugConfigurationObject> {
  return {
    // ...existing slugs
    'my-new-promo': myNewPromo,
  }
}
```

### Step 3: Access Your Promotional Page

Your promotional page will be available at:

```
https://yoursite.com/my-new-promo
```

## Discount Types

### Percentage Discount

```typescript
discount: {
  type: 'percent',
  amountPercent: 0.25, // 25% off
}
```

### Dollar Amount Discount

```typescript
discount: {
  type: 'dollar',
  amountDollars: 50, // $50 off
}
```

## Promotional End Dates

Set an expiration date for promotional offers:

```typescript
promoEndDate: '2025-12-31', // Format: YYYY-MM-DD
```

### How Expiration Works

- **Date Format**: Use `YYYY-MM-DD` format (e.g., '2025-12-31')
- **End of Day**: Promotions expire at 11:59:59 PM on the specified date
- **Automatic Blocking**: Expired promotions automatically show an expiration page instead of the booking form
- **Admin View**: The `/admin/promo-routes` page shows expired promotions with red "❌ Expired" indicators

### User Experience for Expired Promotions

When users visit an expired promotional URL, they will see:

- A friendly expiration message with the original offer details
- Links to book at regular rates
- Clear indication of when the promotion expired
- No access to the booking form with expired pricing

The end date will be displayed on the promotional routes page and can be used for automated cleanup or validation.

## Configuration Types

### `area-wide`

General service area booking with optional discounts

- Used for: neighborhood promotions, referral programs
- Example: Nextdoor promotions, running group discounts

### `fixed-location`

Specific location with fixed address

- Used for: hotel partnerships, office locations
- Example: Hotel June in-room massages

### `scheduled-site`

Location with specific availability windows

- Used for: corporate sites, event venues
- Custom pricing and duration options

## Current Promotional Routes

Based on the existing configurations:

- `/nextdoor-westchester` - 20% off for Westchester neighbors
- `/midnight-runners` - 25% off for running group members
- `/90045`, `/westchester`, `/playa-vista`, `/culver-city` - Close proximity convenience booking

## Best Practices

1. **Naming Convention**: Use kebab-case for slug names
2. **Clear Messaging**: Make the promotional offer clear in the title and text
3. **Expiration**: Consider adding expiration dates for time-sensitive promos
4. **Tracking**: Use unique slug names for analytics tracking
5. **Testing**: Test the booking flow with promotional pricing

## Advanced Features

### Custom Lead Times

Set minimum booking notice:

```typescript
leadTimeMinimum: 120, // 2 hours minimum
```

### Location Restrictions

Lock location for specific venues:

```typescript
location: 'Hotel June West LA, 8639 Lincoln Blvd, Los Angeles, CA 90045',
locationIsReadOnly: true,
```

### Custom Pricing

Override default pricing structure:

```typescript
price: { 15: 30, 30: 60, 45: 90, 60: 120 },
allowedDurations: [15, 30, 45, 60],
```

## Analytics and Tracking

Each promotional slug can be tracked separately through:

- URL analytics (yoursite.com/promo-name)
- Booking data filtering by slug
- Conversion tracking by promotional source

## Need Help?

Check the `/promo-routes` page to see all available routes and their configurations.
