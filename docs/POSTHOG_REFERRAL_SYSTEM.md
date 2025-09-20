# PostHog Referral System with UTM Parameters

## Overview

This document outlines how to implement a referral tracking system using UTM parameters and PostHog for your massage booking site. This allows you to attribute leads and bookings to referrers like Allison, track conversions, and provide credits or rewards.

## How UTM Tracking Works

UTM (Urchin Tracking Module) parameters are tags you add to URLs to track how users arrive at your site. They help you attribute traffic and conversions to specific sources, campaigns, or users. PostHog automatically captures these from the URL and associates them with user sessions and events.

### Standard UTM Parameters

- `utm_source`: The source of the traffic (e.g., "referral", "newsletter", "facebook").
- `utm_medium`: The marketing medium (e.g., "referral", "email", "cpc").
- `utm_campaign`: The campaign name or purpose (e.g., "user-referral", "spring-sale").
- `utm_content`: (Optional) Used to differentiate similar links or identify the specific referrer (e.g., the username or user ID of the referring user).

### Example Referral URLs

- For Allison: `https://trilliummassage.la/book?utm_source=referral&utm_medium=referral&utm_campaign=user-referral&utm_content=allison`
- For a social media post: `https://trilliummassage.la/services?utm_source=facebook&utm_medium=social&utm_campaign=summer_promo&utm_content=ad_1`

### Best Practices for UTM Parameters

- **Use Lowercase**: Always use lowercase for parameter values (e.g., "referral", not "Referral").
- **Consistency**: Be consistent in naming conventions across all links.
- **Identify Referrers**: Use `utm_content` to uniquely identify the referring user (e.g., username or user ID) for credit attribution.
- **Avoid PII**: Do not use personally identifiable information like emails in UTM parameters.
- **Test Links**: Test your links to ensure UTM parameters are captured correctly by PostHog.
- **Document Conventions**: Document your UTM naming conventions for your team.
- **Do Not Overwrite**: Do not overwrite UTM parameters in your code. Let PostHog capture them as-is from the URL. Use separate custom properties for additional referral logic.

For more details, see the [official Google UTM documentation](https://support.google.com/analytics/answer/1033863?hl=en) or PostHog's UTM guide.

### Tracking Referrals from Custom URLs/Pages

If you have special referral pages (e.g., `/allison_october`) without UTM parameters, you can still track them using custom properties in PostHog. This complements UTM tracking without overwriting it.

#### Example Implementation

Add this JavaScript snippet to your site (e.g., in `app/layout.tsx` or a global script):

```javascript
import posthog from 'posthog-js'

// Detect referral pages and set custom properties
const checkReferralPage = () => {
  const path = window.location.pathname
  if (path === '/allison_october') {
    posthog.capture('referral_page_visit', { referrer: 'allison_october' })
    posthog.people.set({ referrer: 'allison_october' })
  }
  // Add more conditions for other referrers
}

// Call on page load
if (typeof window !== 'undefined') {
  checkReferralPage()
}
```

#### Best Practices for Custom Properties

- **Consistent Naming**: Use a standard property name like `referrer` or `referral_source`.
- **Avoid PII**: Do not use personally identifiable information.
- **Combine with UTM**: Analyze both UTM params and custom properties in PostHog insights for a complete view.
- **Document Logic**: Keep track of which pages trigger which properties.

## Implementation Steps

### 1. Enable PostHog

Ensure PostHog is enabled in your environment:

- Set `NEXT_PUBLIC_DISABLE_POSTHOG=false` in `.env.local`
- Verify `NEXT_PUBLIC_POSTHOG_KEY` is set

### 2. Track UTM Parameters in Events

In your booking components (e.g., `BookSessionButton.tsx`), capture UTM params from the URL and include them in PostHog events.

Example code:

```javascript
import posthog from 'posthog-js'

// Function to get UTM params from URL
const getUtmParams = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
  }
}

// In your booking handler
const handleBooking = () => {
  const utmData = getUtmParams()
  posthog.capture('booking_initiated', {
    ...utmData,
    service_type: 'massage',
    booking_value: 100, // example
  })
  // Proceed with booking logic
}
```

### 3. Track Conversion Events

Fire additional events for key milestones:

- `booking_completed`: When a booking is confirmed
- `payment_received`: When payment is processed
- `session_attended`: When the session happens

Include UTM data in each:

```javascript
posthog.capture('booking_completed', {
  ...utmData,
  booking_id: '12345',
  total_amount: 120,
})
```

### 4. Generate Referral Links

Create a simple system to generate UTM-tagged URLs:

- Use a URL shortener or custom endpoint
- Store referrer info in a database if needed
- Example: `/api/referral-link?referrer=allison` that returns the full URL

## PostHog Analysis

### Queries and Insights

- **Filter by Referrer**: Query events where `utm_source == "allison"`
- **Conversion Funnel**: Track from `page_view` → `booking_initiated` → `booking_completed`
- **Revenue Attribution**: Sum `total_amount` for events with specific UTM params
- **Top Referrers**: Group by `utm_source` and count conversions

### Dashboards

Create custom dashboards in PostHog:

- Referral Performance: Conversions by source
- Revenue by Referrer: Total earnings attributed
- Referral Trends: Over time analysis

## Best Practices

- **Consistency**: Use standardized UTM values across all referral links
- **Privacy**: Ensure compliance with data protection laws (e.g., GDPR)
- **Testing**: Test with sample UTM params to verify tracking
- **Automation**: Integrate with email or CRM to auto-generate links
- **Expiration**: Consider adding expiration dates to referral links if needed

## Example Workflow

1. Allison asks for a referral link
2. You generate: `https://yourmassagesite.com/book?utm_source=allison&utm_medium=referral&utm_campaign=client_referral`
3. Client clicks link → PostHog tracks UTM on page view
4. Client books → Event fired with UTM data
5. You query PostHog to see conversions from Allison and calculate credit

This system provides clear attribution and is easy to scale for multiple referrers.
