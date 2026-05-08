CREATE TABLE IF NOT EXISTS slot_holds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  shoo_count  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_slot_holds_time_range ON slot_holds(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_slot_holds_session_id ON slot_holds(session_id);
CREATE INDEX IF NOT EXISTS idx_slot_holds_expires_at ON slot_holds(expires_at);

ALTER TABLE slot_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on slot_holds"
  ON slot_holds FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can read slot_holds"
  ON slot_holds FOR SELECT
  USING (auth.role() = 'anon');
