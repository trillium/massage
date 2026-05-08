-- slot_holds
CREATE TABLE IF NOT EXISTS monica_massage.slot_holds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  shoo_count  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_slot_holds_time_range
  ON monica_massage.slot_holds(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_slot_holds_session_id
  ON monica_massage.slot_holds(session_id);
CREATE INDEX IF NOT EXISTS idx_slot_holds_expires_at
  ON monica_massage.slot_holds(expires_at);

ALTER TABLE monica_massage.slot_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on slot_holds"
  ON monica_massage.slot_holds FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can read slot_holds"
  ON monica_massage.slot_holds FOR SELECT
  USING (auth.role() = 'anon');


-- reviews
CREATE TABLE IF NOT EXISTS monica_massage.reviews (
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

ALTER TABLE monica_massage.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on reviews"
  ON monica_massage.reviews FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can read reviews"
  ON monica_massage.reviews FOR SELECT
  USING (auth.role() = 'anon');


-- admin_emails
CREATE TABLE IF NOT EXISTS monica_massage.admin_emails (
  email    TEXT PRIMARY KEY,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by UUID REFERENCES auth.users(id)
);

ALTER TABLE monica_massage.admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on admin_emails"
  ON monica_massage.admin_emails FOR ALL
  USING (auth.role() = 'service_role');


-- raffles
CREATE TABLE IF NOT EXISTS monica_massage.raffles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open',
  is_active  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  drawn_at   TIMESTAMPTZ,

  CONSTRAINT raffles_status_check CHECK (status IN ('open', 'closed', 'drawn'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_raffles_active
  ON monica_massage.raffles(is_active) WHERE is_active = true;

ALTER TABLE monica_massage.raffles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on raffles"
  ON monica_massage.raffles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can read raffles"
  ON monica_massage.raffles FOR SELECT
  USING (auth.role() = 'anon');


-- raffle_entries
CREATE TABLE IF NOT EXISTS monica_massage.raffle_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id     UUID NOT NULL REFERENCES monica_massage.raffles(id),
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

CREATE INDEX IF NOT EXISTS idx_raffle_entries_raffle
  ON monica_massage.raffle_entries(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_entries_email_raffle
  ON monica_massage.raffle_entries(email, raffle_id);

ALTER TABLE monica_massage.raffle_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on raffle_entries"
  ON monica_massage.raffle_entries FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can insert raffle_entries"
  ON monica_massage.raffle_entries FOR INSERT
  WITH CHECK (auth.role() = 'anon');


-- sandbox_sessions
CREATE TABLE IF NOT EXISTS monica_massage.sandbox_sessions (
  session_id TEXT PRIMARY KEY,
  events     JSONB NOT NULL DEFAULT '[]',
  emails     JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sandbox_sessions_created_at
  ON monica_massage.sandbox_sessions(created_at);

ALTER TABLE monica_massage.sandbox_sessions ENABLE ROW LEVEL SECURITY;
