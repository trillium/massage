# Event Containers

Event containers are a Google Calendar-based scheduling system for fixed-location, time-bounded events (pop-ups, conferences, recurring office hours). They scope availability to specific time windows by using magic strings in calendar event summaries/descriptions.

## Magic Strings

All strings are built from a base defined in `siteConfig.json`:

```
eventBaseString: "__EVENT__"
```

For a slug with `eventContainer: 'scale23x'`, `generateContainerStrings` produces:

| String                 | Value                          | Purpose                                       |
| ---------------------- | ------------------------------ | --------------------------------------------- |
| `eventBaseString`      | `scale23x__EVENT__`            | Base marker -- all related events match this  |
| `eventMemberString`    | `scale23x__EVENT__MEMBER__`    | Booked appointment within the container       |
| `eventContainerString` | `scale23x__EVENT__CONTAINER__` | Time block defining when booking is available |

These strings are embedded in Google Calendar event summaries. The system uses them as search/filter tokens -- no database, just calendar events as the store.

## How It Works

```
Google Calendar
  |
  |  "scale23x__EVENT__CONTAINER__"   <-- admin creates this (the time window)
  |    Mar 8, 10:00-17:00
  |
  |  "scale23x__EVENT__MEMBER__"      <-- system creates this (a booking)
  |    Mar 8, 11:00-11:30
  |
  v
fetchAllCalendarEvents()            fetch all events in date range
  |
  v
filterEventsForQuery('scale23x')    filter by magic strings
  |
  +-- containers[]    events with __EVENT__CONTAINER__
  +-- members[]       events with __EVENT__MEMBER__
  +-- busyQuery[]     start/end from members (used for overlap detection)
```

## Slug Config → Calendar Connection

In `fetchSlugConfigurationData.ts`, a slug config declares its container:

```ts
{
  bookingSlug: ['scale23x'],
  type: 'fixed-location',
  eventContainer: 'scale23x',      // the query prefix
  blockingScope: 'general',        // or 'event' (default)
  instantConfirm: true,
  // ...
}
```

### blockingScope

- **`'event'`** (default): Only other `__EVENT__MEMBER__` bookings for the same container cause conflicts. Regular calendar events are ignored. Good for events where you're dedicated to that event.
- **`'general'`**: ALL calendar events block availability -- both `__EVENT__MEMBER__` bookings across all containers AND regular calendar events. Good for containers that share your general schedule (e.g. `mr_pasadena`, `recharge_chair`, `free-30`).

## fetchPageData Path Selection

`fetchPageData.ts` routes to the container path when:

```ts
isContainerBasedPath =
  (config.type === 'scheduled-site' && !!bookingSlug) || !!config.eventContainer
```

`fetchContainerResult` in `fetchPageData.handlers.ts`:

1. Fetches all calendar events for the next 21 days
2. Filters locally by the container's query string
3. Returns `busy` (member bookings) and `containers` (available time blocks)
4. The frontend shows availability only within container time blocks

## Booking Flow

When a user books through a container slug:

1. `generateContainerStrings` builds the magic strings from the slug's `eventContainer`
2. These strings are sent with the booking form data (`eventBaseString` field)
3. `checkSlotAvailability` uses them to check for overlapping `__EVENT__MEMBER__` events
4. On confirmation, `eventDescription.ts` appends all three magic strings to the calendar event description, making future bookings discoverable

## Creating Containers

### Admin UI

`/admin/create-container` -- form with:

- **Container query**: free-text input with datalist suggestions from known queries
- **Date, start/end time**: defines the availability window (LA timezone)
- **Title prefix** (optional): prepended to the container string in the calendar summary

The API (`/api/admin/create-container`) creates a Google Calendar event:

```
summary: "{titlePrefix} {containerQuery}__EVENT__CONTAINER__"
```

### In Code

Add a new slug config in `fetchSlugConfigurationData.ts`:

```ts
{
  ...initialStateWithoutType,
  bookingSlug: ['my-event'],
  type: 'fixed-location',
  eventContainer: 'my_event',        // matches the container query
  blockingScope: 'general',          // or omit for 'event' scoping
  location: createLocationObject('123 Main St', 'City', '90000'),
  locationIsReadOnly: true,
  pricing: { 30: 50, 60: 100 },
  allowedDurations: [30, 60],
  leadTimeMinimum: 0,
  instantConfirm: true,
}
```

Then create container events in Google Calendar (via admin UI or API) with the summary containing `my_event__EVENT__CONTAINER__`.

## Existing Containers

| eventContainer         | Slug(s)                          | blockingScope      | Use Case                               |
| ---------------------- | -------------------------------- | ------------------ | -------------------------------------- |
| `scale23x`             | `scale23x`                       | event              | Conference pop-up (free chair massage) |
| `scale23x_after_hours` | `scale23x-after-hours`           | event              | After-hours extension                  |
| `100Devs`              | `100Devs`                        | event              | Community event                        |
| `recharge_chair`       | `recharge`                       | general            | Recurring chair massage at EV charger  |
| `free-30`              | `playa-free-30`, `free-30`, etc. | general            | Free 30-min promo sessions             |
| `mr_pasadena`          | `mr_pasadena`                    | general            | Fixed office location                  |
| `chat`                 | `chat-with-me`                   | (no blockingScope) | Phone/video call scheduling            |

## Key Files

- `lib/slugConfigurations/fetchSlugConfigurationData.ts` -- slug config definitions
- `lib/slugConfigurations/helpers/generateContainerStrings.ts` -- builds magic strings
- `lib/slugConfigurations/helpers/fetchPageData.ts` -- routing logic
- `lib/slugConfigurations/helpers/fetchPageData.handlers.ts` -- container fetch/filter
- `lib/fetch/fetchContainersByQuery.ts` -- Google Calendar fetch + local filtering
- `lib/availability/checkSlotAvailability.ts` -- booking conflict detection
- `lib/messaging/templates/events/eventDescription.ts` -- embeds magic strings in event descriptions
- `app/admin/create-container/page.tsx` -- admin UI
- `app/api/admin/create-container/route.ts` -- admin API
- `data/siteConfig.json` -- `eventBaseString` definition
