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
