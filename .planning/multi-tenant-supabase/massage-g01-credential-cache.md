# massage-g01 — Implement credential cache with fetch-cache-forever + revalidate-on-fail

**Priority:** P1
**Status:** open
**Blocked by:** massage-2ql

## Pattern

```
loadGoogleCredentials()
  ├── cachedCreds in memory? → return it       (no Supabase hit)
  └── no → query Supabase → cache → return

getAccessToken()
  ├── cachedToken? → return it
  └── no → getRefreshToken() → exchange with Google
      ├── success → cache access_token → return
      └── fail (invalid_grant, revoked, etc.)
          → clearCredentialsCache()
          → re-fetch from Supabase
          → retry exchange once
          ├── success → cache → return
          └── fail → throw (real error)
```

## Files

- `lib/google/credentials.ts`
  - Add module-level `cachedCreds` var
  - Export `clearCredentialsCache()`
  - Call `clearCredentialsCache()` at end of `saveGoogleCredentials()`
- `lib/availability/getAccessToken.ts`
  - Add retry-on-fail logic after failed token exchange
