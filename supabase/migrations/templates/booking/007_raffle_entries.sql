CREATE TABLE IF NOT EXISTS raffle_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id     UUID NOT NULL REFERENCES raffles(id),
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

CREATE INDEX IF NOT EXISTS idx_raffle_entries_raffle ON raffle_entries(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_entries_email_raffle ON raffle_entries(email, raffle_id);

ALTER TABLE raffle_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on raffle_entries"
  ON raffle_entries FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can insert raffle_entries"
  ON raffle_entries FOR INSERT
  WITH CHECK (auth.role() = 'anon');
