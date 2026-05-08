CREATE SCHEMA IF NOT EXISTS trillium_devblog;

INSERT INTO public.tenants (tenant_slug) VALUES ('trillium_devblog') ON CONFLICT DO NOTHING;


-- submissions
CREATE TABLE IF NOT EXISTS trillium_devblog.submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT,
  email      TEXT,
  message    TEXT NOT NULL,
  source     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON trillium_devblog.submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON trillium_devblog.submissions(email);

ALTER TABLE trillium_devblog.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on submissions"
  ON trillium_devblog.submissions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can insert submissions"
  ON trillium_devblog.submissions FOR INSERT
  WITH CHECK (auth.role() = 'anon');


-- commentary
CREATE TABLE IF NOT EXISTS trillium_devblog.commentary (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES trillium_devblog.submissions(id) ON DELETE CASCADE,
  note          TEXT NOT NULL,
  author        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commentary_submission ON trillium_devblog.commentary(submission_id);

ALTER TABLE trillium_devblog.commentary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on commentary"
  ON trillium_devblog.commentary FOR ALL
  USING (auth.role() = 'service_role');


-- site_content
CREATE TABLE IF NOT EXISTS trillium_devblog.site_content (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE trillium_devblog.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on site_content"
  ON trillium_devblog.site_content FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can read site_content"
  ON trillium_devblog.site_content FOR SELECT
  USING (auth.role() IN ('anon', 'authenticated'));
