-- Migrate Trillium's existing public schema data to trillium_massage schema.
-- Run AFTER 001_init.sql and AFTER confirming schema created successfully.
-- DO NOT drop public tables here — leave for manual verification.

-- google_credentials (may not exist in public yet — safe to skip if empty)
INSERT INTO trillium_massage.google_credentials (id, email, access_token, refresh_token, expiry_date, updated_at)
  SELECT id, email, access_token, refresh_token, expiry_date, updated_at
  FROM public.google_credentials
  ON CONFLICT DO NOTHING;

-- appointments
INSERT INTO trillium_massage.appointments
  SELECT * FROM public.appointments
  ON CONFLICT DO NOTHING;

-- reminders
INSERT INTO trillium_massage.reminders
  SELECT * FROM public.reminders
  ON CONFLICT DO NOTHING;

-- reminder_logs
INSERT INTO trillium_massage.reminder_logs
  SELECT * FROM public.reminder_logs
  ON CONFLICT DO NOTHING;

-- invoices
INSERT INTO trillium_massage.invoices
  SELECT * FROM public.invoices
  ON CONFLICT DO NOTHING;

-- invoice_audit_log
INSERT INTO trillium_massage.invoice_audit_log
  SELECT * FROM public.invoice_audit_log
  ON CONFLICT DO NOTHING;

-- slot_holds
INSERT INTO trillium_massage.slot_holds
  SELECT * FROM public.slot_holds
  ON CONFLICT DO NOTHING;

-- reviews
INSERT INTO trillium_massage.reviews (id, rating, date, name, source, comment, type, helpful, spellcheck)
  SELECT id, rating, date, name, source, comment, type, helpful, spellcheck
  FROM public.reviews
  ON CONFLICT DO NOTHING;

-- admin_emails
INSERT INTO trillium_massage.admin_emails
  SELECT * FROM public.admin_emails
  ON CONFLICT DO NOTHING;

-- raffles
INSERT INTO trillium_massage.raffles
  SELECT * FROM public.raffles
  ON CONFLICT DO NOTHING;

-- raffle_entries
INSERT INTO trillium_massage.raffle_entries
  SELECT * FROM public.raffle_entries
  ON CONFLICT DO NOTHING;

-- sandbox_sessions
INSERT INTO trillium_massage.sandbox_sessions
  SELECT * FROM public.sandbox_sessions
  ON CONFLICT DO NOTHING;
