# Barter shortlinks — unique per-client links minted at a trade show

Standing at a booth, Trillium trades a massage session with another service provider and
texts them a link that is theirs alone. When they tap it, the site routes them to the
barter booking page and PostHog knows exactly which barter arrangement they are.

Everything rides on two systems that already exist:

- the **ref-code pipeline** (`lib/ref/`) — deterministic tag → XOR+base62 code, tracked
  site-wide via `?ref=` (`ref_link_visit` event, `initial_ref`/`latest_ref` person props,
  server-side `referred_by` tagging)
- the **`barter` slug configuration** (`lib/slugConfigurations/fetchSlugConfigurationData.ts`)
  — `/barter` renders a $0 booking page ("Free / Barter Session") with all durations open

Barter adds a thin layer on top: a tag convention, a mint page shaped for a phone, and a
one-tap path into the SMS composer.

## Design decisions

### 1. Link shape

```
https://trilliummassage.la/barter?ref=<code>
```

One shared `/barter` landing page; per-client identity lives entirely in the `?ref=` code.
No new routes, no per-show slug sprawl, and the whole existing ref pipeline (client
tracker, server tagging, PostHog props) works unchanged. Codes are ≈ tag-length × 4/3, so
a typical tag like `b-scale-dj` yields a ~14-char code and a link comfortably inside one
SMS segment.

Per-show _slugs_ were considered and rejected: they require a code change per show, and
the show is already encoded in the tag.

### 2. Tag convention — `b-<show>-<client>`

- `b-` prefix marks a barter tag. In PostHog, "all barter traffic" is simply
  `ref_decoded` starts with `b-`.
- `<show>` is the trade-show/event context, normalized to lowercase alphanumerics with
  **no dashes** (e.g. `scale23x`), so the tag stays machine-parseable: first segment after
  `b-` is always the show.
- `<client>` is a short human label for the provider/client, normalized to lowercase
  `a-z0-9-` (dashes allowed, e.g. `dj-beard`).
- **Never PII.** Same rule as all ref tags: the secret ships in the JS bundle, so any code
  decodes. First name or handle, never a phone number or email.

Helpers live in `lib/ref/barter.ts` (`barterTag`, `parseBarterTag`, `buildBarterUrl`,
`barterSmsHref`), sharing the one codec. Deterministic: same show + client → same tag →
same code.

### 3. Mint flow — `/admin/ref-links/barter`

Mobile-first page under the existing admin auth gate, linked from `/admin/ref-links`:

1. **Show** field — persisted in `localStorage`, so it is typed once per trade show.
2. **Client** field — the short label for the person standing in front of you.
3. **Mint** → the finished link, plus three one-tap actions:
   - **Text it** — `sms:?&body=<friendly message + link>` opens the native SMS composer
     with the message prefilled; Trillium adds the recipient and hits send.
   - **Share** — native share sheet (`navigator.share`) where available.
   - **Copy** — clipboard fallback.

Target: under 15 seconds from unlocking the phone to the composer being open.

### 4. Landing experience

The existing `barter` slug configuration: $0 pricing across 30–270 min, no payment,
notes field on. `RefTracker` is mounted site-wide, so the `?ref=` fires there like
anywhere else. If a particular show wants special presentation later, a per-show slug
config can be added without touching the barter link layer (mint with a different base
path).

### 5. Attribution — reading results in PostHog

The barter code flows through the existing pipeline untouched:

- **Who tapped:** break down the `ref_link_visit` event by `ref_decoded`, filtered to
  values starting `b-`. Each distinct value is one client.
- **Per show:** filter `ref_decoded` starts with `b-<show>-`.
- **Who booked:** the site identifies people by email at booking; a converted client's
  person profile carries `initial_ref` / `latest_ref` / `referred_by` = the barter tag
  alongside their email. Filter persons where `referred_by` starts with `b-` to list
  barter clients who booked.

## Scope guard

Deliberately not built: trade-value ledgers, provider accounts, or any SMS-sending
backend. The `sms:` URL only opens the composer on Trillium's own phone — no Twilio, no
messages sent by the site.
