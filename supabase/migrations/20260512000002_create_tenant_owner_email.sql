-- Extend create_tenant with:
--   1. p_owner_email  — seeds admin_emails so the trigger grants admin on signup
--   2. PostgREST exposure — appends the new schema to pgrst.db_schemas and reloads

CREATE OR REPLACE FUNCTION public.create_tenant(
  p_tenant_slug  TEXT,
  p_domain       TEXT DEFAULT NULL,
  p_owner_email  TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role_cfg    TEXT[];
  _cfg         TEXT;
  _cur_schemas TEXT;
BEGIN
  -- Slug guard
  IF p_tenant_slug IS NULL OR p_tenant_slug = '' THEN
    RAISE EXCEPTION 'p_tenant_slug must not be empty';
  END IF;

  IF p_tenant_slug = 'public' OR p_tenant_slug LIKE 'pg_%' OR p_tenant_slug = 'auth' OR p_tenant_slug = 'storage' THEN
    RAISE EXCEPTION 'p_tenant_slug % is reserved', p_tenant_slug;
  END IF;

  IF p_tenant_slug !~ '^[a-z][a-z0-9_]*$' THEN
    RAISE EXCEPTION 'p_tenant_slug must match ^[a-z][a-z0-9_]*$ — got: %', p_tenant_slug;
  END IF;

  -- Schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', p_tenant_slug);

  -- Registry
  INSERT INTO public.tenants (tenant_slug) VALUES (p_tenant_slug) ON CONFLICT DO NOTHING;

  IF p_domain IS NOT NULL THEN
    INSERT INTO public.domains (domain, tenant_slug) VALUES (p_domain, p_tenant_slug) ON CONFLICT DO NOTHING;
  END IF;

  -- google_credentials
  EXECUTE format($sql$
    CREATE TABLE IF NOT EXISTS %I.google_credentials (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         TEXT NOT NULL,
      access_token  TEXT,
      refresh_token TEXT,
      expiry_date   BIGINT,
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  $sql$, p_tenant_slug);

  EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS idx_%s_google_credentials_email ON %I.google_credentials(email)', p_tenant_slug, p_tenant_slug);
  EXECUTE format('ALTER TABLE %I.google_credentials ENABLE ROW LEVEL SECURITY', p_tenant_slug);
  BEGIN
    EXECUTE format('CREATE POLICY "Service role full access on google_credentials" ON %I.google_credentials FOR ALL USING (auth.role() = ''service_role'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- appointments
  EXECUTE format($sql$
    CREATE TABLE IF NOT EXISTS %I.appointments (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      calendar_event_id TEXT UNIQUE,
      client_email      TEXT NOT NULL,
      client_phone      TEXT,
      client_first_name TEXT NOT NULL,
      client_last_name  TEXT NOT NULL,
      start_time        TIMESTAMPTZ NOT NULL,
      end_time          TIMESTAMPTZ NOT NULL,
      duration_minutes  INTEGER NOT NULL,
      timezone          TEXT NOT NULL DEFAULT 'America/Los_Angeles',
      location          TEXT,
      price             INTEGER,
      status            TEXT NOT NULL DEFAULT 'pending',
      promo             TEXT,
      booking_url       TEXT,
      slug_config       JSONB,
      source            TEXT DEFAULT 'web',
      instant_confirm   BOOLEAN NOT NULL DEFAULT false,
      admin_notes       TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
      confirmed_at      TIMESTAMPTZ,
      cancelled_at      TIMESTAMPTZ,
      CONSTRAINT appointments_status_check CHECK (
        status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')
      )
    )
  $sql$, p_tenant_slug);

  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_appts_start     ON %I.appointments(start_time)',        p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_appts_status    ON %I.appointments(status)',             p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_appts_cal_event ON %I.appointments(calendar_event_id)', p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_appts_email     ON %I.appointments(client_email)',       p_tenant_slug, p_tenant_slug);
  EXECUTE format('ALTER TABLE %I.appointments ENABLE ROW LEVEL SECURITY', p_tenant_slug);
  BEGIN
    EXECUTE format('CREATE POLICY "Service role full access on appointments" ON %I.appointments FOR ALL USING (auth.role() = ''service_role'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- reminders
  EXECUTE format($sql$
    CREATE TABLE IF NOT EXISTS %I.reminders (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id UUID NOT NULL REFERENCES %I.appointments(id) ON DELETE CASCADE,
      channel        TEXT NOT NULL,
      reminder_type  TEXT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'scheduled',
      scheduled_for  TIMESTAMPTZ NOT NULL,
      sent_at        TIMESTAMPTZ,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  $sql$, p_tenant_slug, p_tenant_slug);

  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_reminders_due  ON %I.reminders(scheduled_for, status) WHERE status = ''scheduled''', p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_reminders_appt ON %I.reminders(appointment_id)', p_tenant_slug, p_tenant_slug);
  EXECUTE format('ALTER TABLE %I.reminders ENABLE ROW LEVEL SECURITY', p_tenant_slug);
  BEGIN
    EXECUTE format('CREATE POLICY "Service role full access on reminders" ON %I.reminders FOR ALL USING (auth.role() = ''service_role'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- reminder_logs
  EXECUTE format($sql$
    CREATE TABLE IF NOT EXISTS %I.reminder_logs (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reminder_id    UUID NOT NULL REFERENCES %I.reminders(id) ON DELETE CASCADE,
      channel        TEXT NOT NULL,
      recipient      TEXT NOT NULL,
      status         TEXT NOT NULL,
      error_message  TEXT,
      response_data  JSONB,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  $sql$, p_tenant_slug, p_tenant_slug);

  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_reminder_logs ON %I.reminder_logs(reminder_id)', p_tenant_slug, p_tenant_slug);
  EXECUTE format('ALTER TABLE %I.reminder_logs ENABLE ROW LEVEL SECURITY', p_tenant_slug);
  BEGIN
    EXECUTE format('CREATE POLICY "Service role full access on reminder_logs" ON %I.reminder_logs FOR ALL USING (auth.role() = ''service_role'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- invoices
  EXECUTE format($sql$
    CREATE TABLE IF NOT EXISTS %I.invoices (
      id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id         UUID NOT NULL REFERENCES %I.appointments(id) UNIQUE,
      square_invoice_id  TEXT NOT NULL UNIQUE,
      square_order_id    TEXT NOT NULL,
      square_customer_id TEXT NOT NULL,
      status             TEXT NOT NULL DEFAULT 'DRAFT',
      public_url         TEXT,
      invoice_number     TEXT,
      amount_cents       INTEGER NOT NULL,
      currency           TEXT NOT NULL DEFAULT 'USD',
      email_sent_to      TEXT,
      email_updated_at   TIMESTAMPTZ,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      paid_at            TIMESTAMPTZ,
      canceled_at        TIMESTAMPTZ
    )
  $sql$, p_tenant_slug, p_tenant_slug);

  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_invoices_booking ON %I.invoices(booking_id)',        p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_invoices_square  ON %I.invoices(square_invoice_id)', p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_invoices_status  ON %I.invoices(status)',             p_tenant_slug, p_tenant_slug);
  EXECUTE format('ALTER TABLE %I.invoices ENABLE ROW LEVEL SECURITY', p_tenant_slug);
  BEGIN
    EXECUTE format('CREATE POLICY "Service role full access on invoices" ON %I.invoices FOR ALL USING (auth.role() = ''service_role'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- invoice_audit_log
  EXECUTE format($sql$
    CREATE TABLE IF NOT EXISTS %I.invoice_audit_log (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id        UUID NOT NULL REFERENCES %I.appointments(id),
      square_invoice_id TEXT,
      square_order_id   TEXT,
      event_type        TEXT NOT NULL,
      event_source      TEXT NOT NULL,
      status_before     TEXT,
      status_after      TEXT,
      payload           JSONB,
      error_detail      JSONB,
      idempotency_key   TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  $sql$, p_tenant_slug, p_tenant_slug);

  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_audit_booking    ON %I.invoice_audit_log(booking_id)',        p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_audit_sq_inv     ON %I.invoice_audit_log(square_invoice_id)', p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_audit_event_type ON %I.invoice_audit_log(event_type)',        p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_audit_created    ON %I.invoice_audit_log(created_at)',        p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS idx_%s_audit_idempotency ON %I.invoice_audit_log(idempotency_key) WHERE idempotency_key IS NOT NULL', p_tenant_slug, p_tenant_slug);
  EXECUTE format('ALTER TABLE %I.invoice_audit_log ENABLE ROW LEVEL SECURITY', p_tenant_slug);
  BEGIN
    EXECUTE format('CREATE POLICY "Service role full access on invoice_audit_log" ON %I.invoice_audit_log FOR ALL USING (auth.role() = ''service_role'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- slot_holds
  EXECUTE format($sql$
    CREATE TABLE IF NOT EXISTS %I.slot_holds (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id  UUID NOT NULL,
      start_time  TIMESTAMPTZ NOT NULL,
      end_time    TIMESTAMPTZ NOT NULL,
      expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      shoo_count  INTEGER NOT NULL DEFAULT 0
    )
  $sql$, p_tenant_slug);

  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_slot_holds_time    ON %I.slot_holds(start_time, end_time)', p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_slot_holds_session ON %I.slot_holds(session_id)',           p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_slot_holds_expires ON %I.slot_holds(expires_at)',           p_tenant_slug, p_tenant_slug);
  EXECUTE format('ALTER TABLE %I.slot_holds ENABLE ROW LEVEL SECURITY', p_tenant_slug);
  BEGIN
    EXECUTE format('CREATE POLICY "Service role full access on slot_holds" ON %I.slot_holds FOR ALL USING (auth.role() = ''service_role'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    EXECUTE format('CREATE POLICY "Anon can read slot_holds" ON %I.slot_holds FOR SELECT USING (auth.role() = ''anon'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- reviews
  EXECUTE format($sql$
    CREATE TABLE IF NOT EXISTS %I.reviews (
      id         SERIAL PRIMARY KEY,
      rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      date       DATE NOT NULL,
      name       TEXT NOT NULL,
      source     TEXT NOT NULL,
      comment    TEXT,
      type       TEXT,
      helpful    INTEGER,
      spellcheck TEXT
    )
  $sql$, p_tenant_slug);

  EXECUTE format('ALTER TABLE %I.reviews ENABLE ROW LEVEL SECURITY', p_tenant_slug);
  BEGIN
    EXECUTE format('CREATE POLICY "Service role full access on reviews" ON %I.reviews FOR ALL USING (auth.role() = ''service_role'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    EXECUTE format('CREATE POLICY "Anon can read reviews" ON %I.reviews FOR SELECT USING (auth.role() = ''anon'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- admin_emails
  EXECUTE format($sql$
    CREATE TABLE IF NOT EXISTS %I.admin_emails (
      email    TEXT PRIMARY KEY,
      added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      added_by UUID REFERENCES auth.users(id)
    )
  $sql$, p_tenant_slug);

  EXECUTE format('ALTER TABLE %I.admin_emails ENABLE ROW LEVEL SECURITY', p_tenant_slug);
  BEGIN
    EXECUTE format('CREATE POLICY "Service role full access on admin_emails" ON %I.admin_emails FOR ALL USING (auth.role() = ''service_role'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- Seed owner email if provided
  IF p_owner_email IS NOT NULL THEN
    EXECUTE format(
      'INSERT INTO %I.admin_emails (email) VALUES ($1) ON CONFLICT DO NOTHING',
      p_tenant_slug
    ) USING p_owner_email;
  END IF;

  -- raffles
  EXECUTE format($sql$
    CREATE TABLE IF NOT EXISTS %I.raffles (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'open',
      is_active  BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      drawn_at   TIMESTAMPTZ,
      CONSTRAINT raffles_status_check CHECK (status IN ('open', 'closed', 'drawn'))
    )
  $sql$, p_tenant_slug);

  EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS idx_%s_raffles_active ON %I.raffles(is_active) WHERE is_active = true', p_tenant_slug, p_tenant_slug);
  EXECUTE format('ALTER TABLE %I.raffles ENABLE ROW LEVEL SECURITY', p_tenant_slug);
  BEGIN
    EXECUTE format('CREATE POLICY "Service role full access on raffles" ON %I.raffles FOR ALL USING (auth.role() = ''service_role'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    EXECUTE format('CREATE POLICY "Anon can read raffles" ON %I.raffles FOR SELECT USING (auth.role() = ''anon'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- raffle_entries
  EXECUTE format($sql$
    CREATE TABLE IF NOT EXISTS %I.raffle_entries (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      raffle_id     UUID NOT NULL REFERENCES %I.raffles(id),
      name          TEXT NOT NULL,
      email         TEXT NOT NULL,
      phone         TEXT NOT NULL DEFAULT '',
      is_local      BOOLEAN NOT NULL DEFAULT false,
      zip_code      TEXT,
      interested_in JSONB NOT NULL DEFAULT '[]',
      is_winner     BOOLEAN NOT NULL DEFAULT false,
      excluded      BOOLEAN NOT NULL DEFAULT false,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  $sql$, p_tenant_slug, p_tenant_slug);

  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_raffle_entries_raffle ON %I.raffle_entries(raffle_id)',        p_tenant_slug, p_tenant_slug);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_raffle_entries_email  ON %I.raffle_entries(email, raffle_id)', p_tenant_slug, p_tenant_slug);
  EXECUTE format('ALTER TABLE %I.raffle_entries ENABLE ROW LEVEL SECURITY', p_tenant_slug);
  BEGIN
    EXECUTE format('CREATE POLICY "Service role full access on raffle_entries" ON %I.raffle_entries FOR ALL USING (auth.role() = ''service_role'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    EXECUTE format('CREATE POLICY "Anon can insert raffle_entries" ON %I.raffle_entries FOR INSERT WITH CHECK (auth.role() = ''anon'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- sandbox_sessions
  EXECUTE format($sql$
    CREATE TABLE IF NOT EXISTS %I.sandbox_sessions (
      session_id TEXT PRIMARY KEY,
      events     JSONB NOT NULL DEFAULT '[]',
      emails     JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  $sql$, p_tenant_slug);

  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_sandbox_created ON %I.sandbox_sessions(created_at)', p_tenant_slug, p_tenant_slug);
  EXECUTE format('ALTER TABLE %I.sandbox_sessions ENABLE ROW LEVEL SECURITY', p_tenant_slug);
  BEGIN
    EXECUTE format('CREATE POLICY "Service role full access on sandbox_sessions" ON %I.sandbox_sessions FOR ALL USING (auth.role() = ''service_role'')', p_tenant_slug);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  -- Permissions
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO anon, authenticated, service_role', p_tenant_slug);
  EXECUTE format('GRANT ALL ON ALL TABLES IN SCHEMA %I TO service_role', p_tenant_slug);
  EXECUTE format('GRANT SELECT ON ALL TABLES IN SCHEMA %I TO anon, authenticated', p_tenant_slug);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON TABLES TO service_role', p_tenant_slug);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT SELECT ON TABLES TO anon, authenticated', p_tenant_slug);

  -- Expose in PostgREST (append to existing schema list if not already present)
  SELECT rolconfig INTO _role_cfg FROM pg_roles WHERE rolname = 'authenticator';
  _cur_schemas := '';
  IF _role_cfg IS NOT NULL THEN
    FOREACH _cfg IN ARRAY _role_cfg LOOP
      IF _cfg LIKE 'pgrst.db_schemas=%' THEN
        _cur_schemas := substring(_cfg, length('pgrst.db_schemas=') + 1);
      END IF;
    END LOOP;
  END IF;
  IF _cur_schemas = '' THEN
    _cur_schemas := 'public';
  END IF;
  IF position(p_tenant_slug IN _cur_schemas) = 0 THEN
    EXECUTE format('ALTER ROLE authenticator SET pgrst.db_schemas = %L', _cur_schemas || ',' || p_tenant_slug);
    NOTIFY pgrst, 'reload config';
    NOTIFY pgrst, 'reload schema';
  END IF;

  RETURN jsonb_build_object('ok', true, 'tenant_slug', p_tenant_slug);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_tenant(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.create_tenant(TEXT, TEXT, TEXT) TO service_role;
