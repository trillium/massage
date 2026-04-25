CREATE TABLE raffles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  drawn_at   TIMESTAMPTZ,

  CONSTRAINT raffles_status_check CHECK (status IN ('open', 'closed', 'drawn'))
);

CREATE TABLE raffle_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id       UUID NOT NULL REFERENCES raffles(id),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  is_local        BOOLEAN NOT NULL DEFAULT false,
  zip_code        TEXT,
  interested_in   JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_winner       BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_raffle_entries_raffle ON raffle_entries(raffle_id);
CREATE INDEX idx_raffle_entries_email_raffle ON raffle_entries(email, raffle_id);

ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on raffles"
  ON raffles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can read raffles"
  ON raffles FOR SELECT
  USING (auth.role() = 'anon');

CREATE POLICY "Service role full access on raffle_entries"
  ON raffle_entries FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can insert raffle_entries"
  ON raffle_entries FOR INSERT
  WITH CHECK (auth.role() = 'anon');

INSERT INTO raffles (name, status) VALUES ('OpenClaw May 2026', 'open');
