# massage-2ql — Add tenant_key column to google_credentials table

**Priority:** P1
**Status:** open
**Blocked by:** massage-ow3
**Blocks:** massage-g01, massage-1vm, massage-w2e

## Migration

```sql
ALTER TABLE google_credentials ADD COLUMN tenant_key TEXT NOT NULL DEFAULT '';
UPDATE google_credentials SET tenant_key = 'trilliummassagela@gmail.com'; -- backfill Trillium
CREATE INDEX idx_google_credentials_tenant_key ON google_credentials(tenant_key);
```

## App changes

- `loadGoogleCredentials()` → filter `.eq('tenant_key', process.env.OWNER_EMAIL)`
- `saveGoogleCredentials()` → include `tenant_key` on insert/update
- OAuth connect flow → attach `tenant_key` from `OWNER_EMAIL` env var

## Files

- `supabase/migrations/` — new migration file
- `lib/google/credentials.ts`
