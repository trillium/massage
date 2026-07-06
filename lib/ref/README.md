# SMS ref link tracking

Send a client a link like `https://trilliummassage.la/?ref=E7nIWXGt` and PostHog tells you who clicked — plus everything they do afterward (pageviews, bookings) stays tied to that code.

## How it works

```
you                     client                  PostHog
 │                        │                        │
 │ mint code from tag     │                        │
 │ "jane-2" → E7nIWXGt    │                        │
 │──── SMS with link ────▶│                        │
 │                        │ taps link              │
 │                        │ RefTracker decodes ────▶ ref_link_visit
 │                        │ E7nIWXGt → "jane-2"    │   ref: E7nIWXGt
 │                        │                        │   ref_decoded: jane-2
 │                        │                        │ person props:
 │                        │                        │   initial_ref / latest_ref
```

- **Codec** (`refCodec.ts`): tag → XOR with `NEXT_PUBLIC_REF_CODE_SECRET` → base62 (`A-Z a-z 0-9` only, no `_`/`-`/`=`). Deterministic: same tag always mints the same code. Length ≈ tag × 4/3.
- **Tracker** (`components/utilities/RefTracker.tsx`, mounted site-wide in `app/theme-providers.tsx`): on page load with `?ref=`, captures `ref_link_visit` with the raw code and, when decodable, `ref_decoded`. Person properties `initial_ref` ($set_once) and `latest_ref` ($set) store the decoded tag.
- **Threat model**: obfuscation, not encryption. The secret ships in the JS bundle so the browser can decode — the point is that a client glancing at their link sees noise, not their name. Never put real PII (phone/email) in tags.

## Minting codes

```sh
bun --env-file=.env.local scripts/ref-code.ts encode jane-2
# E7nIWXGt
# https://trilliummassage.la/?ref=E7nIWXGt

bun --env-file=.env.local scripts/ref-code.ts decode E7nIWXGt
# jane-2
```

Keep tags short (4–7 chars, e.g. `jane2`, `mike-r`) so URLs stay SMS-friendly.

## Reading results in PostHog

- Who clicked: break down the `ref_link_visit` event by `ref_decoded`.
- Did they book: the site identifies people by email on booking/contact submission, so a converted clicker's person profile carries both their email and `initial_ref`/`latest_ref`.

## Config

- `NEXT_PUBLIC_REF_CODE_SECRET` — in `.env.local` and Vercel env. Inlined at build time; without it, production still captures raw codes but skips `ref_decoded`.
- PostHog init already lists `ref` in `custom_campaign_params` (`context/AnalyticsContext.tsx`), so the raw code additionally rides on all session events as a super property. Note: custom campaign params do NOT get an automatic `$initial_ref` person property (verified against posthog-js 1.258.5 source) — that's why RefTracker sets person props explicitly.

Full design history: brain entry `brain-ky6n9` (slug `implement-sms-link-tracking-with-ref-params`).
