# Migration Details

## Business Pivot: Massage Therapy → Tarot Reading

This repo is being migrated from a massage therapy business to a tarot reading business.

### Required Changes

| Current (Massage Business) | New (Tarot Business)  |
| -------------------------- | --------------------- |
| Trillium Smith             | Kendra Anderson       |
| Trillium Massage           | Flower Flyther        |
| Massage-related content    | Tarot-related content |

## TASK FOR LLM

Search the entire codebase and find ALL references to:

1. **Names to replace:**
   - "Trillium Smith" → needs to become "Kendra Anderson"
   - "Trillium Massage" → needs to become "Flower Flyther"
   - Any variations or partial matches

2. **Content to replace:**
   - Any text describing massage therapy services
   - Any text about being a massage therapist
   - Any UI copy mentioning massage, spa services, relaxation therapy, etc.
   - Button text like "Book a massage" → should become "Book a reading"
   - Navigation items, page titles, meta descriptions
   - Alt text for images
   - Email addresses or social media handles containing "massage"

3. **Files to check:**
   - All `.tsx`, `.ts`, `.js` files
   - All `.md` files
   - `package.json`
   - `siteMetadata.js`
   - Any configuration files
   - Any content or data files

### Output Format

For each reference found, provide:

```
file_path:line_number - Current text
  → Suggested replacement
```

**Example:**

```
components/Header.tsx:15 - "Trillium Smith, Licensed Massage Therapist"
  → "Kendra Anderson, Tarot Reader"

data/siteMetadata.js:4 - author: 'Trillium Smith'
  → author: 'Kendra Anderson'
```

## Findings

### 1. Name Replacements: "Trillium Smith" → "Kendra Anderson"

```
data/authors/default.mdx:2 - name: Trillium Smith
  → name: Kendra Anderson

app/admin/mocked_user_flow/components/Step5EventObjectDetails.tsx:65 - displayName: 'Trillium Smith, LMT',
  → displayName: 'Kendra Anderson, Tarot Reader',

app/admin/mocked_user_flow/components/Step5EventObjectDetails.tsx:243 - displayName: 'Trillium Smith, LMT',
  → displayName: 'Kendra Anderson, Tarot Reader',

app/admin/mocked_user_flow/components/Step5EventObjectDetails.tsx:247 - displayName: 'Trillium Smith, LMT',
  → displayName: 'Kendra Anderson, Tarot Reader',

lib/messaging/email/client/contactFormConfirmation.ts:18 - Trillium Smith, LMT
  → Kendra Anderson, Tarot Reader

lib/messaging/email/admin/AdminAccessEmail.ts:20 - Trillium Smith
  → Kendra Anderson

lib/messaging/email/admin/contactFormEmail.ts:21 - Trillium Smith, LMT
  → Kendra Anderson, Tarot Reader

lib/messaging/templates/events/eventDescription.ts:93 - Trillium Smith, LMT
  → Kendra Anderson, Tarot Reader

lib/messaging/utilities/signature.ts:6 - 'Trillium Smith',
  → 'Kendra Anderson',

README.md:213 - Trillium Smith - trilliummassagela@gmail.com
  → Kendra Anderson - [new email]
```

### 2. Business Name: "Trillium Massage" → "Flower Flyther"

```
SUPABASE_SETUP_GUIDE.md:1 - # Supabase Setup Guide for Trillium Massage
  → # Supabase Setup Guide for Flower Flyther

SUPABASE_IMPLEMENTATION_SUMMARY.md:3 - Complete implementation of Supabase authentication and database for Trillium Massage.
  → Complete implementation of Supabase authentication and database for Flower Flyther.

components/landingPage/ContactSection.tsx:19 - Trillium Massage
  → Flower Flyther

data/blog/free-30.mdx:2 - title: Try out Trillium Massage, 30 minutes free
  → title: Try out Flower Flyther, free tarot reading offer
  → [Note: This entire blog post needs complete rewrite for tarot services]

components/landingPage/AboutSection.tsx:23 - About <GradientText classes="whitespace-nowrap">Trillium Massage</GradientText>
  → About <GradientText classes="whitespace-nowrap">Flower Flyther</GradientText>

data/authors/default.mdx:5 - company: Trillium Massage
  → company: Flower Flyther

app/auth/supabase-login/page.tsx:31 - New to Trillium Massage?
  → New to Flower Flyther?

docs/FEATURES.md:3 - This document outlines the key features implemented in the Trillium Massage website...
  → This document outlines the key features implemented in the Flower Flyther website...

README.md:21 - <h3 align="center">Trillium Massage</h3>
  → <h3 align="center">Flower Flyther</h3>

README.md:67 - [![Trillium Massage Screen Shot][product-screenshot]](https://trilliummassage.la/)
  → [![Flower Flyther Screen Shot][product-screenshot]](https://[new-domain])

README.md:69 - Trillium Massage is a modern, responsive website for booking in-home massage therapy services...
  → Flower Flyther is a modern, responsive website for booking tarot reading services...

components/ReviewForm.tsx:64 - <input type="hidden" readOnly name="source" value="Trillium Massage" />
  → <input type="hidden" readOnly name="source" value="Flower Flyther" />

scripts/send-test-pushover.ts:19 - const message = 'Test push notification from Trillium Massage'
  → const message = 'Test push notification from Flower Flyther'

lib/handleContactRequest.ts:72 - subject: 'Thank you for contacting Trillium Massage',
  → subject: 'Thank you for contacting Flower Flyther',

lib/messaging/utilities/signature.ts:8 - 'Trillium Massage',
  → 'Flower Flyther',

scripts/install-supabase.sh:3 - # Supabase Installation Script for Trillium Massage
  → # Supabase Installation Script for Flower Flyther

lib/messaging/email/client/contactFormConfirmation.ts:11 - <h2>Thank you for contacting Trillium Massage</h2>
  → <h2>Thank you for contacting Flower Flyther</h2>

lib/messaging/email/admin/AdminAccessEmail.ts:21 - <div style="font-family:arial,sans-serif">Trillium Massage</div>
  → <div style="font-family:arial,sans-serif">Flower Flyther</div>

supabase/migrations/20250101000001_initial_schema.sql:1 - -- Initial Schema for Trillium Massage Auth
  → -- Initial Schema for Flower Flyther Auth

SUPABASE_README.md:3 - Complete authentication and database implementation for Trillium Massage using Supabase.
  → Complete authentication and database implementation for Flower Flyther using Supabase.

data/ratings.ts:5557+ - source: 'Trillium Massage', (appears ~30 times in ratings)
  → source: 'Flower Flyther',
```

### 3. Email Addresses

```
data/siteMetadata.js:16 - email: 'trilliummassagela@gmail.com',
  → email: '[new-business-email]',

data/authors/default.mdx:6 - email: trilliummassagela@gmail.com
  → email: [new-business-email]

README.md:213 - trilliummassagela@gmail.com
  → [new-business-email]

supabase/migrations/20250101000004_add_admin_email.sql:3 - values ('trilliummassagela@gmail.com')
  → values ('[new-business-email]')

app/admin/mocked_user_flow/components/Step5EventObjectDetails.tsx:64 - email: 'trillium@trilliummassage.la',
  → email: '[new-email]',

app/admin/mocked_user_flow/components/Step5EventObjectDetails.tsx:242 - email: 'trillium@trilliummassage.la',
  → email: '[new-email]',

app/admin/mocked_user_flow/components/Step5EventObjectDetails.tsx:246 - email: 'trillium@trilliummassage.la',
  → email: '[new-email]',
```

### 4. URLs and Domains

```
data/siteMetadata.js:9 - siteUrl: 'https://trilliummassage.la/',
  → siteUrl: 'https://[new-domain]/',

data/siteMetadata.js:10 - siteRepo: 'https://github.com/Spiteless/www-massage/',
  → siteRepo: 'https://github.com/[new-repo-path]/',

data/siteMetadata.js:28 - instagram: 'https://www.instagram.com/trilliummassage',
  → instagram: 'https://www.instagram.com/[new-handle]',

lib/messaging/utilities/signature.ts:10-11 - 'https://trilliummassage.la/?utm_source=email...'
  → 'https://[new-domain]/?utm_source=email...'

lib/messaging/email/client/contactFormConfirmation.ts:19 - <a href="https://trilliummassage.la/">www.trilliummassage.la</a>
  → <a href="https://[new-domain]/">www.[new-domain]</a>

lib/messaging/email/admin/AdminAccessEmail.ts:22 - <a href="https://trilliummassage.la">trilliummassage.la</a>
  → <a href="https://[new-domain]">[new-domain]</a>

lib/messaging/email/admin/contactFormEmail.ts:23 - <a href="https://trilliummassage.la/">www.trilliummassage.la</a>
  → <a href="https://[new-domain]/">www.[new-domain]</a>

lib/messaging/templates/events/eventDescription.ts:84,95 - 'https://trilliummassage.la'
  → 'https://[new-domain]'

context/AnalyticsContext.tsx:10-13 - hostname checks for trilliummassage.la
  → Update to [new-domain]

lib/messaging/email/client/ClientConfirmEmail.ts:25 - const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://trilliummassage.la'
  → const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://[new-domain]'

lib/messaging/email/client/ClientRequestEmail.ts:25 - const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://trilliummassage.la'
  → const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://[new-domain]'

components/BookedCard.tsx:54 - (typeof window !== 'undefined' ? window.location.host : 'trilliummassage.la')
  → (typeof window !== 'undefined' ? window.location.host : '[new-domain]')

README.md (multiple lines) - https://trilliummassage.la/
  → https://[new-domain]/

docs/POSTHOG_REFERRAL_SYSTEM.md:20-21 - https://trilliummassage.la/
  → https://[new-domain]/

data/blog/now-on-airbnb.mdx:14 - [Book your massage with me on Airbnb!](https://airbnb.com/sv/trilliummassage)
  → [Consider removing or updating for tarot services]
```

### 5. Payment Handles

```
data/paymentMethods.ts:10 - hint: 'Venmo name is @TrilliumSmith, last 4 phone number -5344',
  → hint: 'Venmo name is @[new-venmo-handle], last 4 phone number -[digits]',

data/paymentMethods.ts:15 - hint: 'CashApp name is $trilliummassage',
  → hint: 'CashApp name is $[new-cashapp-handle]',
```

### 6. Professional Titles

```
data/siteMetadata.js:17 - occupation: 'Massage Therapist',
  → occupation: 'Tarot Reader',

All "LMT" (Licensed Massage Therapist) references:
  → Change to "Tarot Reader" or remove title designation
```

### 7. Service Description Changes (massage → tarot/reading)

```
data/siteMetadata.js:7 - 'Let the spa come to you. Providing in-home massage therapy and wellness to the LA Metro Area'
  → 'Insightful tarot readings. Providing tarot reading services to the LA Metro Area'

README.md:24 - Let the spa come to you. Providing in-home massage therapy and wellness to the LA Metro Area
  → [New description for tarot services]

README.md:69 - booking in-home massage therapy services in the Los Angeles Metro Area
  → booking tarot reading services in the Los Angeles Metro Area

components/landingPage/AboutSection.tsx:26-33 - "Trillium is a massage therapist with 10 years of experience..."
  → "Kendra is a tarot reader with [X] years of experience..."

data/authors/default.mdx:9 - "Trillium is a seasoned massage therapist with over a decade of experience..."
  → "Kendra is a tarot reader with..."

data/authors/default.mdx:11 - "In addition to massage services, Trillium offers Couple's Massage Workshops..."
  → [Update or remove this section]

components/AboutCard.tsx:50-64 - "Trillium is a seasoned massage therapist..."
  → "Kendra is a tarot reader..."

app/test_hero_and_masonry/page.tsx:17,48 - "massage therapist" and "Book a massage"
  → "tarot reader" and "Book a reading"

components/landingPage/ServiceAreaSection.tsx:6 - "Trillium is based out of Westchester, but happy to travel..."
  → "Kendra is based out of [location]..."

lib/messaging/templates/events/eventSummary.ts:8 - `${duration} minute massage with ${clientName} - TrilliumMassage`
  → `${duration} minute reading with ${clientName} - FlowerFlyther`
```

### 8. Button/CTA Text

```
components/ExpiredPromoPage.tsx:39 - Don't worry, you can still book a massage!
  → Don't worry, you can still book a reading!

app/onsite/page.tsx:41 - <Template title="Book a session with Trillium :)" />
  → <Template title="Book a reading with Kendra :)" />

app/test_hero_and_masonry/page.tsx:50 - <Template title="Book a massage with Trillium :)" />
  → <Template title="Book a reading with Kendra :)" />

app/book/page.tsx:38 - <Template title="Book a massage with Trillium :)" />
  → <Template title="Book a reading with Kendra :)" />

components/booking/features/GeneralBookingFeature.tsx:49 - title={configuration.title || 'Book a massage with Trillium :)'}
  → title={configuration.title || 'Book a reading with Kendra :)'}

components/hero/Hero.tsx:65 - Book a session
  → [Keep as "Book a session" or change to "Book a reading"]

components/hero/MapHero.tsx:94 - Book a session
  → [Keep as "Book a session" or change to "Book a reading"]
```

### 9. FAQ Content (components/FAQ/questions.ts)

**NOTE:** This entire file needs significant updates. Key changes:

```
Line 28 - q: 'How much space is needed to set up your massage table or chair?'
  → [Update for tarot reading setup needs]

Line 62 - q: 'Do I need to provide any equipment for the massage session?'
  → q: 'Do I need to provide anything for the tarot reading?'

Line 71-73 - 'Professional massage table or chair', 'High-quality massage oils and lotions'
  → [Update for tarot reading materials]

Line 82 - q: 'What areas do you service for in-home massages?'
  → q: 'What areas do you service for tarot readings?'

Line 86-99 - q: 'What types of massage therapy do you offer in-home?'
  → q: 'What types of tarot readings do you offer?'
  → [Complete rewrite of answer needed]

Line 108 - q: 'What should I do to prepare for an in-home massage session?'
  → q: 'What should I do to prepare for a tarot reading?'

Line 128 - q: 'How long do the massage sessions typically last?'
  → q: 'How long do the tarot readings typically last?'

Line 184 - q: 'Are there any health conditions that would prevent me from getting a massage?'
  → [Remove or replace with tarot-appropriate question]

Line 189 - q: 'What should I wear during the massage?'
  → [Remove or replace with tarot-appropriate question]

Line 194 - q: 'Do you offer massage packages or gift certificates?'
  → q: 'Do you offer reading packages or gift certificates?'
```

### 10. Image Alt Text

```
components/hero/Hero.tsx:43 - alt="Image of Trillium"
  → alt="Image of Kendra"

components/landingPage/ServiceAreaSection.tsx:47 - alt="Image of Trillium"
  → alt="Image of Kendra"

data/blog/free-30.mdx:94 - _Alt Text: Trillium, the expert massage therapist, greeting a client at the massage studio._
  → [Update for tarot reading context]
```

### 11. Configuration Files

```
mcp-server.ts:13 - name: 'massage-tracker',
  → name: '[tarot-tracker or appropriate name]',

mcp-server.ts:109 - console.error('Massage Tracker MCP server running on stdio')
  → console.error('[New name] MCP server running on stdio')

.mcp.json:3 - "massage-tracker": {
  → "[new-name]": {
```

### 12. Blog Post (data/blog/free-30.mdx)

**NOTE:** This entire file (65+ lines) needs to be completely rewritten for tarot services. Current content is about a free 30-minute massage promotion. Suggest creating new content about tarot reading services.

### 13. Ratings Data (data/ratings.ts)

**IMPORTANT:** The ratings.ts file contains ~5,000+ lines of customer reviews from massage services. Key considerations:

- Lines 5557-5763: ~30 entries with `source: 'Trillium Massage'` → Change to `source: 'Flower Flyther'`
- Many review comments reference "Trillium" as the massage therapist (lines 201, 307, 329, etc.)
  - These are authentic customer testimonials about massage services
  - **DECISION NEEDED:** Should these be:
    1. Kept as historical data (not displayed publicly)?
    2. Removed entirely?
    3. Migrated with name changes (ethically questionable)?

### 14. Planning/Documentation Files (Non-critical but should be updated)

```
.planning/adding_new_properties.md:1 - # Adding New Properties to the Massage Booking System
  → # Adding New Properties to the [Tarot/Reading] Booking System

.planning/Booking_Flow_Improvements.md:1,5 - "Massage Booking System"
  → "[Tarot Reading] Booking System"

SUPABASE_SETUP_GUIDE.md:27 - Name: `trillium-massage`
  → Name: `[new-project-name]`
```

### 15. Special Case: CLAUDE.md

```
CLAUDE.md:10,14 - "Working with Trillium" / "I'm Trillium"
  → [NOTE: This refers to you as the developer, not the business. Keep as-is unless you want to update.]
```

### 16. Package Configuration

```
package.json:2 - "name": "trillium-massage",
  → "name": "flower-flyther",
```

### 17. Services Data (data/servicesData.ts)

**NOTE:** This entire file defines massage services and needs complete rewrite for tarot services:

```
Line 7-14 - Swedish Massage (name, description, image)
  → [Tarot reading type 1]

Line 17-25 - Deep Tissue Massage
  → [Tarot reading type 2]

Line 27-35 - Back-to-Back Couples Massage
  → [Update or remove - possibly couple's reading?]

Line 37-47 - Onsite/Corporate Massage
  → [Update or remove - possibly group/event readings?]

Line 49-58 - Massage Therapy Instructional
  → [Update or remove - possibly tarot learning/workshop?]
```

### 18. Type Definitions & Comments

```
lib/configTypes.ts:27 - Comment: "predetermined, fixed location (e.g., spa, clinic)"
  → "predetermined, fixed location (e.g., studio, shop)"

lib/configTypes.ts:28 - Comment: "specific containers/resources with their own schedules (e.g., specific therapists)"
  → "specific containers/resources with their own schedules (e.g., specific readers)"
```

### 19. Admin Mocked User Flow Components

```
app/admin/mocked_user_flow/components/Step3TherapistApproval.tsx:19 - "Step 3: Therapist Approval"
  → "Step 3: Reader Approval"

app/admin/mocked_user_flow/components/Step3TherapistApproval.tsx:22 - "Therapist must accept the appointment to proceed"
  → "Reader must accept the appointment to proceed"

app/admin/mocked_user_flow/components/Step2GeneratedEmails.tsx:32 - "Therapist Approval Email"
  → "Reader Approval Email"
```

### 20. Services Page (app/services/page.tsx)

```
Line 11 - <h1>Our Massage Services</h1>
  → <h1>Our Tarot Reading Services</h1>

Line 12 - "Explore our range of massage services. Book your session today!"
  → "Explore our range of tarot reading services. Book your session today!"
```

### 21. Pricing Page (app/pricing/page.tsx)

```
Line 16 - "Transparent pricing for all our massage sessions. No hidden fees."
  → "Transparent pricing for all our tarot reading sessions. No hidden fees."
```

### 22. Onsite Page (app/onsite/ClientPage.tsx)

```
Line 24 - 'Massage session block prepaid in full',
  → 'Reading session block prepaid in full',
```

### 23. Pricing Section Component (components/landingPage/PricingSection.tsx)

**NOTE:** This component has massage-specific duration descriptions that need rewriting:

```
Line 8 - title: '60-Minute Massage',
  → title: '60-Minute Reading',

Line 11-13 - Features: "Focus on 1–2 specific areas of tension (e.g., neck, shoulders, or back)"
  → [Update for tarot reading context]

Line 17 - title: '90-Minute Massage',
  → title: '90-Minute Reading',

Line 21-24 - Features: "Balanced full-body massage with extra focus on 2–3 problem areas"
  → [Update for tarot reading context]

Line 27 - title: '120-Minute Massage',
  → title: '120-Minute Reading',

Line 30-33 - Features: "Comprehensive full-body massage with detailed work on multiple areas"
  → [Update for tarot reading context]
```

### 24. Documentation & Email Templates

```
docs/FEATURES.md:31 - "Onsite/Corporate Massage: Chair or table massage for offices and events"
  → "Onsite/Corporate Readings: [Tarot reading service for offices and events]"

lib/messaging/email/admin/OnSiteRequestEmail.ts:42 - "Chair Massage Appointment Block"
  → "Reading Appointment Block"
```

### 25. Planning Documents & Test Data

```
.planning/todo.md:40 - "chair massage booking flow"
  → "reading booking flow"

lib/dataLoading.test.ts:66,74 - Test data: "Chair Massage Day :)"
  → Update test data for reading context
```

### Summary Statistics

- **Trillium Smith**: ~13 direct references
- **Trillium Massage**: ~50+ direct references
- **trilliummassage** (email/URL): ~25+ references
- **Trillium** (person references in reviews): ~25+ references
- **LMT**: 6 references
- **therapist/therapy**: ~25+ references
- **massage** (general term): 500+ references across FAQs, descriptions, blog posts, etc.
- **Book a massage/session**: ~15+ CTA buttons

### Critical Files Requiring Most Changes

1. `data/siteMetadata.js` - Core site configuration
2. `data/servicesData.ts` - Complete service definitions rewrite needed
3. `components/FAQ/questions.ts` - Entire FAQ needs rewrite
4. `components/landingPage/PricingSection.tsx` - Duration/feature descriptions need rewrite
5. `data/blog/free-30.mdx` - Complete blog post rewrite needed
6. `data/ratings.ts` - Decision needed on historical reviews
7. `data/authors/default.mdx` - Author bio rewrite
8. `components/landingPage/*` - Multiple landing page sections
9. All email templates in `lib/messaging/email/*`
10. `app/services/page.tsx` - Service page headers/descriptions
11. `app/admin/mocked_user_flow/components/*` - "Therapist" → "Reader" references

---

## Pre-Migration File State

**NOTE:** Some files were already modified before this comprehensive migration analysis. Below are the original (HEAD) versions of files that were already changed:

### Original: data/siteMetadata.js (Lines 1-18)

```javascript
/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: 'Trillium Massage',
  author: 'Trillium Smith',
  headerTitle: 'Trillium Massage',
  description:
    'Let the spa come to you. Providing in-home massage therapy and wellness to the LA Metro Area',
  language: 'en-us',
  theme: 'system',
  siteUrl: 'https://trilliummassage.la/',
  siteRepo: 'https://github.com/Spiteless/www-massage/',
  siteLogo: `${process.env.BASE_PATH || ''}/static/images/logo.png`,
  socialBanner: `${process.env.BASE_PATH || ''}/static/images/twitter-card.png`,
  // mastodon: 'https://mastodon.social/@mastodonuser',
  avatar: '/static/images/avatar.jpg',
  email: 'trilliummassagela@gmail.com',
  occupation: 'Massage Therapist',
  company: 'Trillium Massage',
```

### Currently Modified Files Status

Files that have existing uncommitted changes (may include partial migration work):

- `.claude/settings.local.json` - Configuration changes
- `components/Footer.tsx` - Color scheme updates (teal → primary variable)
- `components/landingPage/HeroSection.tsx` - Major content changes started
- `components/landingPage/HowItWorksSection.tsx` - Color updates
- `components/landingPage/TestimonialsSection.tsx` - Color updates
- `css/tailwind.css` - Primary color palette changed (teal → orange)
- `data/siteMetadata.js` - Partial migration (title, author, company updated)

### Changed Content in HeroSection.tsx

**Original:**

```tsx
<h1>Relax, Restore, <GradientText>Rejuvenate</GradientText></h1>
<h2>Let the spa come to you</h2>
<p>Spa level massage therapy in your home, at your convenience.</p>
<Image src={'/static/images/table/table_square_02.webp'} alt="Massage therapy session" />
<Link>Book a session</Link>
```

**Current (Modified):**

```tsx
<h1>Free Thinking <GradientText>Tarot</GradientText></h1>
<h2>Witchy Shit, Tarot, Flower Essences</h2>
<p>Readings that really read!</p>
<Image src={'/static/images/BusinessCardPoppys.png'} alt="California poppies" />
<Link>Book your reading</Link>
```

**New Files Added:**

- `DETAILS_MIGRATION.md` - This migration tracking document
- `public/static/images/BusinessCardPoppys.png` - New hero image (California poppies)
