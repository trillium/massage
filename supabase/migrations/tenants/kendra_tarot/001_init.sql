CREATE SCHEMA IF NOT EXISTS kendra_tarot;

INSERT INTO public.tenants (tenant_slug) VALUES ('kendra_tarot') ON CONFLICT DO NOTHING;


-- submissions
CREATE TABLE IF NOT EXISTS kendra_tarot.submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT,
  email      TEXT,
  message    TEXT NOT NULL,
  source     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at
  ON kendra_tarot.submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_email
  ON kendra_tarot.submissions(email);

ALTER TABLE kendra_tarot.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on submissions"
  ON kendra_tarot.submissions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can insert submissions"
  ON kendra_tarot.submissions FOR INSERT
  WITH CHECK (auth.role() = 'anon');


-- commentary
CREATE TABLE IF NOT EXISTS kendra_tarot.commentary (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES kendra_tarot.submissions(id) ON DELETE CASCADE,
  note          TEXT NOT NULL,
  author        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commentary_submission
  ON kendra_tarot.commentary(submission_id);

ALTER TABLE kendra_tarot.commentary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on commentary"
  ON kendra_tarot.commentary FOR ALL
  USING (auth.role() = 'service_role');


-- site_content
CREATE TABLE IF NOT EXISTS kendra_tarot.site_content (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE kendra_tarot.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on site_content"
  ON kendra_tarot.site_content FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can read site_content"
  ON kendra_tarot.site_content FOR SELECT
  USING (auth.role() IN ('anon', 'authenticated'));
