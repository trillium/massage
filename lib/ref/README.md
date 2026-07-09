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

**Admin UI:** `/admin/ref-links` (auth-gated) — type a label, mint, copy the link. No terminal needed.

**CLI:**

```sh
bun --env-file=.env.local scripts/ref-code.ts encode jane-2
# E7nIWXGt
# https://trilliummassage.la/?ref=E7nIWXGt

bun --env-file=.env.local scripts/ref-code.ts decode E7nIWXGt
# jane-2
```

Keep tags short (4–7 chars, e.g. `jane2`, `mike-r`) so URLs stay SMS-friendly. The label is a **human tag, never PII** — e.g. `kris` or a last-4 like `kris-3333`, never a full phone number (the secret ships in the bundle, so any code is trivially decodable).

## Reading results in PostHog

- Who clicked: break down the `ref_link_visit` event by `ref_decoded`.
- Did they book: the site identifies people by email on booking/contact submission, so a converted clicker's person profile carries both their email and `initial_ref`/`latest_ref`.

## Config

- `NEXT_PUBLIC_REF_CODE_SECRET` — in `.env.local` and Vercel env. Inlined at build time; without it, production still captures raw codes but skips `ref_decoded`.
- PostHog init already lists `ref` in `custom_campaign_params` (`context/AnalyticsContext.tsx`), so the raw code additionally rides on all session events as a super property. Note: custom campaign params do NOT get an automatic `$initial_ref` person property (verified against posthog-js 1.258.5 source) — that's why RefTracker sets person props explicitly.

Full design history: brain entry `brain-ky6n9` (slug `implement-sms-link-tracking-with-ref-params`).

## Server-side person tagging

The client tracker above stamps `initial_ref`/`latest_ref`. There is also a **server** path that tags the same person with canonical `referred_by` (decoded) + `ref_token` (raw), using the PostHog write key on the server.

```
visitor lands with ?ref=Xk93aQ
  → RefTracker (client) fires its capture, then pings /api/ref?ref=Xk93aQ
  → app/api/ref/route.ts reads the ph_<key>_posthog cookie → distinct_id
  → tagReferral() decodes Xk93aQ → "instagram-bio"
  → posthog-node capture on that SAME distinct_id:
        $set: { referred_by: "instagram-bio", ref_token: "Xk93aQ" }
```

Pieces (all in `lib/ref/`, framework-agnostic):

- **`refCodec.ts`** — the one shared obfuscation module (XOR + base62). Used by client and server.
- **`refServerConfig.ts`** — all PostHog host/keys/property-names from env; dev/prod aware; zero hardcoded hosts or secrets.
- **`distinctId.ts`** — resolve the visitor `distinct_id` from the `ph_<key>_posthog` cookie (matched by shape, so it is instance-agnostic).
- **`serverRefTag.ts`** — `tagReferral({ refToken, distinctId })`. No-ops on blank/undecodable/disabled input. When there is no cookie yet it **defers** (returns without capturing) so it never creates an orphan person; set `REF_TAG_FALLBACK=generate` to instead capture on a throwaway id (`ref_orphan: true`).
- **`refUrl.ts`** — client-safe `buildRefUrl(label, baseUrl)` / `refTokenFor(label)` / `labelFromRefUrl(url)` for a share/admin surface.
- **`app/api/ref/route.ts`** — thin GET adapter; picks the dev/prod instance from the request host to mirror `AnalyticsContext`.

### Which person gets tagged

`referred_by`/`ref_token` land on the person identified by the `distinct_id` in the visitor's PostHog cookie — the same person the browser is tracking, not a new anonymous one. The raw `ref_token` is set explicitly (PostHog does not auto-capture it). No cookie → deferred (see above).

## Config (server path)

Server-only unless prefixed `NEXT_PUBLIC_`:

| Env                                                                      | Purpose                                   | Default                                     |
| ------------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_REF_PARAM`                                                  | query param carrying the token            | `ref`                                       |
| `POSTHOG_HOST`                                                           | ingest host for posthog-node              | — (required to capture)                     |
| `NEXT_PUBLIC_POSTHOG_KEY_DEV` / `_PROD`                                  | project write key per instance            | —                                           |
| `REF_CODE_SECRET`                                                        | server obfuscation secret                 | falls back to `NEXT_PUBLIC_REF_CODE_SECRET` |
| `REF_PROP_REFERRED_BY` / `REF_PROP_TOKEN`                                | person property names                     | `referred_by` / `ref_token`                 |
| `REF_EVENT`                                                              | event name emitted with the `$set`        | `referral_tagged`                           |
| `REF_TAG_FALLBACK`                                                       | `defer` or `generate` when no cookie      | `defer`                                     |
| `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID_DEV`, `POSTHOG_API_HOST` | live integration test readback (dev only) | — (test skips if unset)                     |

## Testing

- `bun run test:all` (vitest) — unit suites for the codec, cookie parsing, and `tagReferral` (tagging, configurable names, defer/generate fallbacks, no-op paths, key rotation).
- `lib/ref/__tests__/refTag.integration.test.ts` — LIVE dev round-trip: encode → tag → read the person back via the Persons API → assert both properties. Gated on the dev env vars above; **skips cleanly** with a message when unset (CI stays green). Never targets prod.

## Porting to another Next.js app

1. Copy `lib/ref/` (`refCodec`, `refConfig`, `refServerConfig`, `distinctId`, `serverRefTag`, `refUrl`) and `app/api/ref/route.ts`.
2. In the route, replace the host→dev/prod resolution with your app's rule (or delete it and rely on `POSTHOG_ENV` / `NODE_ENV`).
3. Set env: `NEXT_PUBLIC_REF_PARAM`, `POSTHOG_HOST`, your `NEXT_PUBLIC_POSTHOG_KEY_*`, and `NEXT_PUBLIC_REF_CODE_SECRET`. Point them at any PostHog instance — nothing is hardcoded.
4. Fire the server hook on visits: either ping `/api/ref?ref=<token>` from your analytics provider (as `RefTracker` does), or call `tagReferral()` directly from middleware / a server component.
5. (Optional) fill `POSTHOG_PERSONAL_API_KEY` + `POSTHOG_PROJECT_ID_DEV` to run the live round-trip test against your dev instance.
