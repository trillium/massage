# massage-ow3 — Audit all therapist-specific Supabase tables for missing tenant key

**Priority:** P1
**Status:** closed
**Blocks:** massage-2ql, massage-03u (epic)

---

## Tables Needing Tenant Key (priority order)

| #   | Table                | Why                                                                                              | Urgency  |
| --- | -------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| 1   | `google_credentials` | No migration file — schema unmanaged. Pulls most recent row, breaks with 2+ therapists           | CRITICAL |
| 2   | `appointments`       | All bookings in one table, no therapist discriminator. Cascades fix reminders/invoices/audit_log | HIGH     |
| 3   | `slot_holds`         | Slot locks not scoped — therapist A hold blocks therapist B booking                              | HIGH     |
| 4   | `raffles`            | Shared raffle pool across therapists. raffle_entries cascades via raffle_id FK                   | MEDIUM   |
| 5   | `reviews`            | All reviews visible to all therapists                                                            | MEDIUM   |
| 6   | `admin_emails`       | Wrong therapist could be granted admin access                                                    | MEDIUM   |
| 7   | `sandbox_sessions`   | Ephemeral, UUID-isolated in practice                                                             | LOW      |

## Tables Already Isolated (no action needed)

| Table               | Why                                                             |
| ------------------- | --------------------------------------------------------------- |
| `profiles`          | Scoped to auth.users.id                                         |
| `reminders`         | Child of appointments via FK — cascades once appointments fixed |
| `reminder_logs`     | Child of reminders via FK                                       |
| `invoices`          | Child of appointments via FK                                    |
| `invoice_audit_log` | Child of appointments via FK                                    |

## Tenant Key Convention

- Column: `tenant_key TEXT NOT NULL`
- Value: `OWNER_EMAIL` env var (e.g. `'trilliummassagela@gmail.com'`)
- Index: `CREATE INDEX ON <table>(tenant_key)` on all flagged tables
- Backfill: `UPDATE <table> SET tenant_key = 'trilliummassagela@gmail.com'`

## Key Finding

`google_credentials` has no migration file in `supabase/migrations/`. Must create
the migration from scratch — both to bring it under migration control and to add
`tenant_key`. First migration in the sequence.
