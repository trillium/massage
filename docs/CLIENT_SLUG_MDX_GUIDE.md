# Client Slug MDX Pages Guide

## Overview

Custom booking slug pages can now use MDX files with dynamic pricing and external booking links for client marketing pages (like Airbnb listings).

## Architecture

```
[bookingSlug] route (existing)
├─ Uses slug configurations (hardcoded in TS)
├─ Can optionally render MDX content instead
└─ Dynamic pricing pulls from DEFAULT_PRICING (config.ts)
```

## Available MDX Components

### 1. **PricingComparison**
Renders a dynamic pricing table from `DEFAULT_PRICING` config.

```mdx
<PricingComparison
  title="Pricing"
  durations={[60, 90, 120, 150]}
  description="Optional: Custom description"
/>
```

**Props:**
- `title` (string, optional) - Table title
- `durations` (number[], optional) - Minutes to display. Default: [60, 90, 120, 150]
- `description` (string, optional) - Intro text above table

**Behavior:**
- Automatically pulls prices from `DEFAULT_PRICING` in `config.ts`
- Updates whenever `DEFAULT_PRICING` changes
- No hardcoding needed

### 2. **ExternalBookingLink**
Styled button link for external booking platforms (Airbnb, etc).

```mdx
<ExternalBookingLink
  href="https://www.airbnb.com/sv/trilliummassage"
  platform="Book on Airbnb"
/>
```

**Props:**
- `href` (string, required) - Target URL
- `platform` (string, optional) - Button text. Default: "Book Now"
- `children` (ReactNode, optional) - Override button text
- `className` (string, optional) - Additional Tailwind classes

**Behavior:**
- Opens in new tab (`target="_blank"`)
- Includes external link icon
- Styled with gradient background

### 3. **Image**
Standard Next.js optimized image.

```mdx
![Alt text](/static/images/massage-hero.webp)
```

## Creating a Client Slug Page

### Step 1: Create MDX File

Store in: `data/clientSlugs/your-client-name.mdx`

```mdx
---
title: 'Page Title'
clientName: 'Client Name'
airbnbLink: 'https://...'
metaDescription: 'SEO description'
---

# Main Heading

Content with dynamic components...

<PricingComparison durations={[60, 90, 120]} />

<ExternalBookingLink href="https://..." platform="Book Now" />
```

### Step 2: Connect to Booking Slug (Future)

Currently, MDX pages are stored but not auto-routed. Two implementation options:

**Option A: Modify slug configuration**
- Add MDX support to `fetchSlugConfigurationData.ts`
- Load MDX at slug render time

**Option B: Custom MDX slug handler**
- Create separate route handler for MDX-based slugs
- Bypass traditional slug configuration system

### Step 3: Use the Page

Once implemented, visit:
```
https://trilliummassage.la/your-client-name
```

## Current Components Registered

✅ **Image** - Next.js optimized images
✅ **CustomLink** - Internal/external links
✅ **TableWrapper** - Tables
✅ **BlogNewsletterForm** - Newsletter signup
✅ **PromotionStatus** - Promo status badge
✅ **PricingComparison** - Dynamic pricing table (NEW)
✅ **ExternalBookingLink** - External booking button (NEW)

## How to Update Pricing

All prices pull from `config.ts`:

```typescript
export const DEFAULT_PRICING: PricingType = {
  60: 140,
  90: 210,
  120: 280,
  150: 350,
}
```

**To update:** Edit `config.ts` and all MDX pages using `<PricingComparison />` auto-update—no hardcoding needed.

## Example Client Slug Files

See: `data/clientSlugs/airbnb-sample.mdx`

## Next Steps

1. ✅ Components created and registered
2. ✅ Sample MDX file created
3. ⏳ Implement slug loading (Option A or B above)
4. ⏳ Test with actual client URL

## Notes

- MDX files are currently just stored, not routed
- Integration with booking slug system pending implementation decision
- All pricing is dynamic—no hardcoding in MDX files
- Each client slug can have custom copy, images, and pricing config
