# massage-w2e — Add RLS policies scoped to tenant_key on all multi-tenant tables

**Priority:** P2
**Status:** open
**Blocked by:** massage-2ql

## Approach

- Enable RLS on `google_credentials` and all therapist-specific tables
- Policy: allow read/write only where `tenant_key = current_setting('app.tenant_key')`
  or via service role with explicit `.eq('tenant_key', ...)` filter in app code
- Document pattern for future tables

## Notes

- Service role key bypasses RLS by default — app-level filtering in `loadGoogleCredentials()` is the primary guard
- RLS is a secondary safety net, not the primary isolation mechanism
- Add migration + document pattern in supabase/README or .planning/
