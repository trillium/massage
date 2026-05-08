# massage-1vm — Update OAuth connect flow to store tenant_key on credential save

**Priority:** P2
**Status:** open
**Blocked by:** massage-2ql

## Changes

- On OAuth callback (`app/auth/callback/supabase/route.ts` or `app/admin/connect-google/`), identify tenant from `process.env.OWNER_EMAIL` (server-side)
- Pass `tenant_key` to `saveGoogleCredentials()`
- Ensure only the matching tenant can overwrite their own credentials

## Files

- `app/admin/connect-google/` — ConnectGoogleClient + page
- `lib/google/credentials.ts` — `saveGoogleCredentials()` accepts tenant_key
