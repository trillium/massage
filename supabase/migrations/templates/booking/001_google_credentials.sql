CREATE TABLE IF NOT EXISTS google_credentials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  access_token  TEXT,
  refresh_token TEXT,
  expiry_date   BIGINT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_google_credentials_email ON google_credentials(email);

ALTER TABLE google_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on google_credentials"
  ON google_credentials FOR ALL
  USING (auth.role() = 'service_role');
