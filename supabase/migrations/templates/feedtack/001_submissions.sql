CREATE TABLE IF NOT EXISTS submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT,
  email      TEXT,
  message    TEXT NOT NULL,
  source     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(email);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on submissions"
  ON submissions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can insert submissions"
  ON submissions FOR INSERT
  WITH CHECK (auth.role() = 'anon');
