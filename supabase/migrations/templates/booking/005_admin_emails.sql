CREATE TABLE IF NOT EXISTS admin_emails (
  email    TEXT PRIMARY KEY,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by UUID REFERENCES auth.users(id)
);

ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on admin_emails"
  ON admin_emails FOR ALL
  USING (auth.role() = 'service_role');
