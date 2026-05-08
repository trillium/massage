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

INSERT INTO trillium_massage.appointments (
  id, calendar_event_id, client_email, client_phone, client_first_name, client_last_name,
  start_time, end_time, duration_minutes, timezone, location, price, status, promo,
  booking_url, slug_config, source, instant_confirm, admin_notes, created_at, updated_at,
  confirmed_at, cancelled_at
)
SELECT
  id, calendar_event_id, client_email, client_phone, client_first_name, client_last_name,
  start_time, end_time, duration_minutes, timezone, location, price, status::TEXT, promo,
  booking_url, slug_config, source, instant_confirm, admin_notes, created_at, updated_at,
  confirmed_at, cancelled_at
FROM public.appointments
ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.reminders (
  id, appointment_id, channel, reminder_type, status,
  scheduled_for, sent_at, created_at, updated_at
)
SELECT
  id, appointment_id, channel::TEXT, reminder_type::TEXT, status::TEXT,
  scheduled_for, sent_at, created_at, updated_at
FROM public.reminders
ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.reminder_logs (
  id, reminder_id, channel, recipient, status, error_message, response_data, created_at
)
SELECT
  id, reminder_id, channel::TEXT, recipient, status, error_message, response_data, created_at
FROM public.reminder_logs
ON CONFLICT DO NOTHING;

-- Note: public.invoices and public.invoice_audit_log were never created on live DB.

INSERT INTO trillium_massage.slot_holds (
  id, session_id, start_time, end_time, expires_at, created_at, shoo_count
)
SELECT id, session_id, start_time, end_time, expires_at, created_at, shoo_count
FROM public.slot_holds
ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.reviews (id, rating, date, name, source, comment, type, helpful, spellcheck)
SELECT id, rating, date, name, source, comment, type, helpful, spellcheck
FROM public.reviews
ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.admin_emails (email, added_at, added_by)
SELECT email, added_at, added_by
FROM public.admin_emails
ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.raffles (id, name, status, is_active, created_at, drawn_at)
SELECT id, name, status, is_active, created_at, drawn_at
FROM public.raffles
ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.raffle_entries (
  id, raffle_id, name, email, phone, is_local, zip_code,
  interested_in, is_winner, excluded, created_at
)
SELECT
  id, raffle_id, name, email, phone, is_local, zip_code,
  interested_in, is_winner, excluded, created_at
FROM public.raffle_entries
ON CONFLICT DO NOTHING;

INSERT INTO trillium_massage.sandbox_sessions (session_id, events, emails, created_at, updated_at)
SELECT session_id, events, emails, created_at, updated_at
FROM public.sandbox_sessions
ON CONFLICT DO NOTHING;
