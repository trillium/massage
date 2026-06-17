CREATE TABLE IF NOT EXISTS trillium_devblog.contact_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  subject      TEXT,
  message      TEXT NOT NULL,
  send_state   TEXT NOT NULL DEFAULT 'received',
  error_detail TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT contact_submissions_send_state_check CHECK (
    send_state IN ('received', 'success', 'failed')
  )
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email      ON trillium_devblog.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON trillium_devblog.contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_send_state ON trillium_devblog.contact_submissions(send_state);

ALTER TABLE trillium_devblog.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on contact_submissions"
  ON trillium_devblog.contact_submissions FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS trillium_devblog.email_sends (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template     TEXT NOT NULL,
  to_address   TEXT NOT NULL,
  subject      TEXT,
  variables    JSONB,
  send_state   TEXT NOT NULL DEFAULT 'pending',
  error_detail TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at      TIMESTAMPTZ,

  CONSTRAINT email_sends_send_state_check CHECK (
    send_state IN ('success', 'failed')
  )
);

CREATE INDEX IF NOT EXISTS idx_email_sends_template    ON trillium_devblog.email_sends(template);
CREATE INDEX IF NOT EXISTS idx_email_sends_to_address  ON trillium_devblog.email_sends(to_address);
CREATE INDEX IF NOT EXISTS idx_email_sends_created_at  ON trillium_devblog.email_sends(created_at);
CREATE INDEX IF NOT EXISTS idx_email_sends_send_state  ON trillium_devblog.email_sends(send_state);

ALTER TABLE trillium_devblog.email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on email_sends"
  ON trillium_devblog.email_sends FOR ALL
  USING (auth.role() = 'service_role');
