CREATE TABLE IF NOT EXISTS site_content (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on site_content"
  ON site_content FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can read site_content"
  ON site_content FOR SELECT
  USING (auth.role() IN ('anon', 'authenticated'));
