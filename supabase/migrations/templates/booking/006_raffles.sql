CREATE TABLE IF NOT EXISTS raffles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open',
  is_active  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  drawn_at   TIMESTAMPTZ,

  CONSTRAINT raffles_status_check CHECK (status IN ('open', 'closed', 'drawn'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_raffles_active ON raffles(is_active) WHERE is_active = true;

ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on raffles"
  ON raffles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can read raffles"
  ON raffles FOR SELECT
  USING (auth.role() = 'anon');
