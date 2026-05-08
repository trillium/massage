-- Combined migration script for Trillium's live Supabase instance.
-- Run steps 1-4 in the Supabase SQL editor or via CLI.
-- After verifying, set TENANT_SLUG=trillium_massage in Vercel env and deploy.

-- ============================================
-- Step 1: Domains registry (public schema)
-- ============================================

CREATE TABLE IF NOT EXISTS public.tenants (
  tenant_slug TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on tenants"
  ON public.tenants FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated can read tenants"
  ON public.tenants FOR SELECT
  USING (auth.role() IN ('authenticated', 'anon'));

CREATE TABLE IF NOT EXISTS public.domains (
  domain      TEXT PRIMARY KEY,
  tenant_slug TEXT NOT NULL REFERENCES public.tenants(tenant_slug) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_domains_tenant_slug ON public.domains(tenant_slug);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on domains"
  ON public.domains FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated can read domains"
  ON public.domains FOR SELECT
  USING (auth.role() IN ('authenticated', 'anon'));

-- ============================================
-- Step 2: Create trillium_massage schema + register
-- ============================================

CREATE SCHEMA IF NOT EXISTS trillium_massage;

INSERT INTO public.tenants (tenant_slug) VALUES ('trillium_massage') ON CONFLICT DO NOTHING;

INSERT INTO public.domains (domain, tenant_slug) VALUES
  ('trilliummassage.la', 'trillium_massage'),
  ('trilliummassage.vercel.app', 'trillium_massage')
ON CONFLICT DO NOTHING;

-- ============================================
-- Step 3: Create tables in trillium_massage schema
-- (from tenants/trillium_massage/001_init.sql + 002_init_extended.sql)
-- ============================================

-- google_credentials
CREATE TABLE IF NOT EXISTS trillium_massage.google_credentials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  access_token  TEXT,
  refresh_token TEXT,
  expiry_date   BIGINT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tm_gcred_email ON trillium_massage.google_credentials(email);
ALTER TABLE trillium_massage.google_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_gcred" ON trillium_massage.google_credentials FOR ALL USING (auth.role() = 'service_role');

-- appointments
CREATE TABLE IF NOT EXISTS trillium_massage.appointments (
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
  CONSTRAINT appointments_status_check CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show'))
);
CREATE INDEX IF NOT EXISTS idx_tm_appt_start ON trillium_massage.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_tm_appt_status ON trillium_massage.appointments(status);
CREATE INDEX IF NOT EXISTS idx_tm_appt_cal ON trillium_massage.appointments(calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_tm_appt_email ON trillium_massage.appointments(client_email);
ALTER TABLE trillium_massage.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_appt" ON trillium_massage.appointments FOR ALL USING (auth.role() = 'service_role');

-- reminders
CREATE TABLE IF NOT EXISTS trillium_massage.reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL REFERENCES trillium_massage.appointments(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL,
  reminder_type   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_for   TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tm_rem_due ON trillium_massage.reminders(scheduled_for, status) WHERE status = 'scheduled';
ALTER TABLE trillium_massage.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_rem" ON trillium_massage.reminders FOR ALL USING (auth.role() = 'service_role');

-- reminder_logs
CREATE TABLE IF NOT EXISTS trillium_massage.reminder_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id     UUID NOT NULL REFERENCES trillium_massage.reminders(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL,
  recipient       TEXT NOT NULL,
  status          TEXT NOT NULL,
  error_message   TEXT,
  response_data   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE trillium_massage.reminder_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_remlog" ON trillium_massage.reminder_logs FOR ALL USING (auth.role() = 'service_role');

-- invoices
CREATE TABLE IF NOT EXISTS trillium_massage.invoices (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         UUID NOT NULL REFERENCES trillium_massage.appointments(id) UNIQUE,
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
);
ALTER TABLE trillium_massage.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_inv" ON trillium_massage.invoices FOR ALL USING (auth.role() = 'service_role');

-- invoice_audit_log
CREATE TABLE IF NOT EXISTS trillium_massage.invoice_audit_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID NOT NULL REFERENCES trillium_massage.appointments(id),
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
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tm_audit_idemp ON trillium_massage.invoice_audit_log(idempotency_key) WHERE idempotency_key IS NOT NULL;
ALTER TABLE trillium_massage.invoice_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_audit" ON trillium_massage.invoice_audit_log FOR ALL USING (auth.role() = 'service_role');

-- slot_holds
CREATE TABLE IF NOT EXISTS trillium_massage.slot_holds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  shoo_count  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_tm_sh_time ON trillium_massage.slot_holds(start_time, end_time);
ALTER TABLE trillium_massage.slot_holds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_sh" ON trillium_massage.slot_holds FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "anon_read_sh" ON trillium_massage.slot_holds FOR SELECT USING (auth.role() = 'anon');

-- reviews
CREATE TABLE IF NOT EXISTS trillium_massage.reviews (
  id         SERIAL PRIMARY KEY,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  date       DATE NOT NULL,
  name       TEXT NOT NULL,
  source     TEXT NOT NULL,
  comment    TEXT,
  type       TEXT,
  helpful    INTEGER,
  spellcheck TEXT
);
ALTER TABLE trillium_massage.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_rev" ON trillium_massage.reviews FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "anon_read_rev" ON trillium_massage.reviews FOR SELECT USING (auth.role() = 'anon');

-- admin_emails
CREATE TABLE IF NOT EXISTS trillium_massage.admin_emails (
  email    TEXT PRIMARY KEY,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by UUID REFERENCES auth.users(id)
);
ALTER TABLE trillium_massage.admin_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_ae" ON trillium_massage.admin_emails FOR ALL USING (auth.role() = 'service_role');

-- raffles
CREATE TABLE IF NOT EXISTS trillium_massage.raffles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open',
  is_active  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  drawn_at   TIMESTAMPTZ,
  CONSTRAINT raffles_status_check CHECK (status IN ('open', 'closed', 'drawn'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tm_raf_active ON trillium_massage.raffles(is_active) WHERE is_active = true;
ALTER TABLE trillium_massage.raffles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_raf" ON trillium_massage.raffles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "anon_read_raf" ON trillium_massage.raffles FOR SELECT USING (auth.role() = 'anon');

-- raffle_entries
CREATE TABLE IF NOT EXISTS trillium_massage.raffle_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id     UUID NOT NULL REFERENCES trillium_massage.raffles(id),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL DEFAULT '',
  is_local      BOOLEAN NOT NULL DEFAULT false,
  zip_code      TEXT,
  interested_in JSONB NOT NULL DEFAULT '[]',
  is_winner     BOOLEAN NOT NULL DEFAULT false,
  excluded      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE trillium_massage.raffle_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_re" ON trillium_massage.raffle_entries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "anon_insert_re" ON trillium_massage.raffle_entries FOR INSERT WITH CHECK (auth.role() = 'anon');

-- sandbox_sessions
CREATE TABLE IF NOT EXISTS trillium_massage.sandbox_sessions (
  session_id TEXT PRIMARY KEY,
  events     JSONB NOT NULL DEFAULT '[]',
  emails     JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE trillium_massage.sandbox_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 4: Copy existing data from public to trillium_massage
-- ============================================

INSERT INTO trillium_massage.google_credentials (id, email, access_token, refresh_token, expiry_date, updated_at)
  SELECT id, email, access_token, refresh_token, expiry_date, updated_at
  FROM public.google_credentials
  ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.appointments
  SELECT * FROM public.appointments
  ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.reminders
  SELECT * FROM public.reminders
  ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.reminder_logs
  SELECT * FROM public.reminder_logs
  ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.invoices
  SELECT * FROM public.invoices
  ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.invoice_audit_log
  SELECT * FROM public.invoice_audit_log
  ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.slot_holds
  SELECT * FROM public.slot_holds
  ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.reviews (id, rating, date, name, source, comment, type, helpful, spellcheck)
  SELECT id, rating, date, name, source, comment, type, helpful, spellcheck
  FROM public.reviews
  ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.admin_emails
  SELECT * FROM public.admin_emails
  ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.raffles
  SELECT * FROM public.raffles
  ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.raffle_entries
  SELECT * FROM public.raffle_entries
  ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.sandbox_sessions
  SELECT * FROM public.sandbox_sessions
  ON CONFLICT DO NOTHING;
