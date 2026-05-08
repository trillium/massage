# massage-03u — [epic] Multi-tenant Supabase: per-tenant Postgres schemas

**Priority:** P1
**Status:** open

## Decision (2026-05-08)

- Shared Supabase project for all tenants
- Isolation via Postgres schemas (one schema per tenant)
- Tenants can extend beyond base template without affecting others
- Domains map to tenant slugs via public.domains registry
- `TENANT_SLUG` env var identifies the deployment's schema at runtime

## Tenants

| Slug               | Templates |
| ------------------ | --------- |
| `trillium_massage` | booking   |
| `monica_massage`   | booking   |
| `sarah_music`      | booking   |
| `kendra_tarot`     | TBD       |
| `trillium_devblog` | feedtack  |

## Templates

- **booking** — google_credentials, appointments, slot_holds, reviews, admin_emails, raffles, sandbox_sessions + children
- **feedtack** — submissions, commentary, site_content

## Sub-issues (in order)

1. `massage-ow3` — audit ✅ complete
2. `massage-2ql` — shared/001_domains_registry.sql + tenant registry
3. Write booking template migrations (templates/booking/001..008)
4. Write feedtack template migrations (templates/feedtack/001..003)
5. Write tenant init migrations (tenants/\*/001_init.sql)
6. Migrate Trillium's existing public schema data → trillium_massage schema
7. `massage-g01` — credential cache + revalidate-on-fail
8. `massage-1vm` — OAuth connect flow stores to tenant schema
9. `massage-w2e` — RLS policies per schema
10. Update app code: all queries use TENANT_SLUG schema

## See also

MIGRATION_STORY.md — full order of operations and SQL
