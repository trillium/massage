# 🧘‍♂️ Massage Web App – Development Roadmap

## 🧘‍♂️ Massage Web App – Development Roadmap (Smallest Tasks First)

### 🟢 Quick Wins & Atomic Tasks

- Separate previously made magnets into individual components.
  - requires to be at home
- Order magnet for **"Recharge Will You Charge"** booking sign.
  - requires image editing
- Normalize **avatar photo** across all About pages.
- Update Instagram with fresh **content posts**.
- Update Instagram with links to website.
- Update Instagram with more images of **massage therapy in action**.
- Update **FAQ section** to use images.
- Update **template page** to show accurate **discount text and display**.
- Enable **image rendering on slug-based booking pages**.
- Add a **test page** to show booking link rendering, simulated workflow outcomes, and local storage / IndexedDB states.
- Configure **PostHog** for report generation.
- Write **marketing blog posts**.

### 🟡 Small/Medium Tasks

- Create a separate **/edit route** to edit user-submitted events.
- Choose a **subroute for on-site appointments** to avoid slug conflicts.
- Allow one **user to book multiple appointments at once**.
- Allow **multiple appointments in a single transaction**.
- Update **Reviews section** to support **searchable user reviews**.
- Show **user transaction history** post-payment.
- Integrate a **location API** to auto-detect user location.
- Create **test pages** for IndexedDB/localStorage state inspection and workflow confirmation simulation.
- Create a **mock workflow page** (simulate booking logic, confirmation, and email triggers).
- Create more **robust testing** for appointment flows and edge cases.
- Build an **admin activity panel** to monitor appointment system performance.

### 🟠 Medium/Large Tasks

- Create a **booking page for event-based use** (auto-refresh, admin only, active during on-site events).
- Offer **limited availability bookings** even when many slots exist.
- Create a **chair massage booking flow** (instant confirm for single therapist, questionable confirm logic for multiple therapists).
- Render a **mock event booking** upon booking form submission.
- Implement **email confirmation** flow (user submits appointment → gets email, clicking confirmation saves "authorized" flag locally).
- Implement **Instant Confirm** (for authenticated users, bypass confirmation link, send confirmation email directly).
- Implement **admin authentication** (access certain routes based on admin flag in local storage).
- Build **secure client-side storage** for sensitive form data (encrypt using AES via Web Crypto API, key management, prefer IndexedDB/sessionStorage, no plaintext/hardcoded keys, decryption on load, re-encryption on updates).
- Enable **payment acceptance via web app**.
- Generate and **submit a sitemap** to search engines.
- Create a **referral system** for new user growth.

### � Broad/Complex Features

- Dynamic buffer time and location-based optimization (travel time, routing, dynamic pricing).
- Smart approval dashboard (mobile-optimized, push notifications).
- Manual approval system for therapists (every booking via email).
- Trusted client system for auto-approval.
- Progressive booking flow (save progress in localStorage, privacy-focused).
- Payment system: deposits, subscriptions, installments, refunds, automated invoicing, receipts, tax calculation.
- Enhanced server-side and client-side error handling (retry, offline, better responses).
- Real-time availability check before booking submission (serverless-compatible).
- Build an **admin activity panel** to monitor appointment system performance.

## 🧠 Platform Comparisons (Summary)

| Platform            | Pros                                                                             | Cons                                   |
| ------------------- | -------------------------------------------------------------------------------- | -------------------------------------- |
| Cal.com             | Open-source, customizable workflows (e.g., pending → confirmed), privacy-focused | Requires self-hosting for full control |
| Calendly            | Easy setup, strong calendar integration                                          | Less customizable without premium      |
| Google Appointments | Easy for personal use                                                            | Very limited customization             |

_Compiled from various chats. Status and priority to be determined._

## 🧊 Ice Box Features (Future Consideration)

- Auto-complete for address/contact info in forms
- Real-time field validation with helpful error messages
- Booking analytics and business metrics dashboard
- Recurring appointments (subscriptions)
- Group bookings for events/corporate sessions
- Waitlist system for preferred slots
- Flexible session durations
- Client profiles, health info, and loyalty programs
- Calendar sync (Outlook, Apple, etc.), CRM, accounting, and marketing tool integrations
- Touch/swipe/haptic mobile optimizations

## 🛠️ Planned Features (Not Yet in Main List)

- Manual approval system for therapists (every booking via email)
- Trusted client system for auto-approval
- Smart approval dashboard (mobile-optimized, push notifications)
- Dynamic buffer time and location-based optimization (travel time, routing, dynamic pricing)
- Progressive booking flow (save progress in localStorage, privacy-focused)
- Payment system: deposits, subscriptions, installments, refunds, automated invoicing, receipts, tax calculation
- Enhanced server-side and client-side error handling (retry, offline, better responses)
- Real-time availability check before booking submission (serverless-compatible)

## 📝 Technical/Process Improvements

- Add new property checklist: update types, Redux, Zod schema, config, forms, API, tests, docs, and migrations as needed
- Write up and test rate limiting for serverless functions (ensure IP data is preserved for spam prevention)
- Document and test all new properties and flows for type safety and backward compatibility

## 🧊 Ice Box Features (Future Consideration)

- Auto-complete for address/contact info in forms
- Real-time field validation with helpful error messages
- Booking analytics and business metrics dashboard
- Recurring appointments (subscriptions)
- Group bookings for events/corporate sessions
- Waitlist system for preferred slots
- Flexible session durations
- Client profiles, health info, and loyalty programs
- Calendar sync (Outlook, Apple, etc.), CRM, accounting, and marketing tool integrations
- Touch/swipe/haptic mobile optimizations

## 🛠️ Planned Features (Not Yet in Main List)

- Manual approval system for therapists (every booking via email)
- Trusted client system for auto-approval
- Smart approval dashboard (mobile-optimized, push notifications)
- Dynamic buffer time and location-based optimization (travel time, routing, dynamic pricing)
- Progressive booking flow (save progress in localStorage, privacy-focused)
- Payment system: deposits, subscriptions, installments, refunds, automated invoicing, receipts, tax calculation
- Enhanced server-side and client-side error handling (retry, offline, better responses)
- Real-time availability check before booking submission (serverless-compatible)

## 📝 Technical/Process Improvements

- Add new property checklist: update types, Redux, Zod schema, config, forms, API, tests, docs, and migrations as needed
- Write up and test rate limiting for serverless functions (ensure IP data is preserved for spam prevention)
- Document and test all new properties and flows for type safety and backward compatibility

=# Project To-Do Notes

## Database & Infrastructure

- Try out a local SQLite database.
- Try integrating the application with a self-hosted database.
- Consider building a server that communicates with ChatGPT to create and manage to-do lists.

## Loyalty & Referral Program

- Create a loyalty program that tracks earned income from each client.
- Include referral income in the loyalty program to offer clients extra time or discounts.

## Appointments & Booking System

- Implement the ability for clients to view their appointments on the website.
- Add a button for clients to extend their current appointments.
- Create a feature for booking a second massage in the same location as a current appointment.
- Build a system to spin up new booking pages for clients on demand.
  - Include referral tracking and customized offers for those clients (e.g., for a gym).
- Integrate URL slugs into the booking system:
  - Appointment blocks are linked to specific URL slugs.
  - Use slugs to show 30-minute free sessions only in designated time windows.
  - Define pricing for upgrades inside these appointment blocks.
  - Appointment blocks should be marked as "free" (from a calendar free/busy standpoint) to allow overlap with other bookings.
- Explore premium vs. normal availability for scheduling.

## Therapist Profiles

- Add a section for other massage therapists (reuse the "authors" section for this).
- Add therapist Alexei to the FAQ recommendations.
- Explore onboarding a therapist "Z" who charges premium rates.
  - Z requires a 24-hour booking notice due to using a physical calendar.

## Content & Marketing

- Create a blog post advertising free 30-minute sessions in the local area.
- Add a note on the website explaining the project is your brainchild and you're open to feedback.
- Add a Frequently Asked Questions section about recommending other massage therapists.

## Technical Enhancements

- Explore making current tools in the app "headless" to allow other developers to implement their own styling.
- Integrate the Location API to calculate drive time between appointments.

# Project To-Do Notes

## Database & Infrastructure

- Try out a local SQLite database.
- Try integrating the application with a self-hosted database.
- Consider building a server that communicates with ChatGPT to create and manage to-do lists.

## Loyalty & Referral Program

- Create a loyalty program that tracks earned income from each client.
- Include referral income in the loyalty program to offer clients extra time or discounts.

## Appointments & Booking System

- Implement the ability for clients to view their appointments on the website.
- Add a button for clients to extend their current appointments.
- Create a feature for booking a second massage in the same location as a current appointment.
- Build a system to spin up new booking pages for clients on demand.
  - Include referral tracking and customized offers for those clients (e.g., for a gym).
- Integrate URL slugs into the booking system:
  - Appointment blocks are linked to specific URL slugs.
  - Use slugs to show 30-minute free sessions only in designated time windows.
  - Define pricing for upgrades inside these appointment blocks.
  - Appointment blocks should be marked as "free" (from a calendar free/busy standpoint) to allow overlap with other bookings.
- Explore premium vs. normal availability for scheduling.

## Therapist Profiles

- Add a section for other massage therapists (reuse the "authors" section for this).
- Add therapist Alexei to the FAQ recommendations.
- Explore onboarding a therapist "Z" who charges premium rates.
  - Z requires a 24-hour booking notice due to using a physical calendar.

## Content & Marketing

- Create a blog post advertising free 30-minute sessions in the local area.
- Add a note on the website explaining the project is your brainchild and you're open to feedback.
- Add a Frequently Asked Questions section about recommending other massage therapists.

## Technical Enhancements

- Explore making current tools in the app "headless" to allow other developers to implement their own styling.
- Integrate the Location API to calculate drive time between appointments.

# Active work today:

1. **Slug and Location Configuration:**
   - Configuring a slug object to pass the city and zip code to the location object in Redux.
   - Updating the URL Parameters consumption function to handle city, zip code, and location.

2. **Appointment and Session Management:**
   - Allowing clients to view their appointments directly on the website.
   - Adding an extend button for clients to extend their sessions within the limits of their current discount situation.

3. **Warning State and Area Validation:**
   - Creating a warning state in the form to inform users about potential data submission issues.
   - Using the warning state to indicate that appointments outside designated areas might be rejected.

4. **Site and Page Configuration:**
   - Creating slug pages for Playa Vista, Westchester, Kentwood, Playa del Rey.
   - Creating slug pages for San Diego.

5. **Calendar Event Management:**
   - Creating an endpoint to edit specific calendar events.
