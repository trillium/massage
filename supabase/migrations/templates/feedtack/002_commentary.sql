CREATE TABLE IF NOT EXISTS commentary (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  note          TEXT NOT NULL,
  author        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commentary_submission ON commentary(submission_id);

ALTER TABLE commentary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on commentary"
  ON commentary FOR ALL
  USING (auth.role() = 'service_role');
