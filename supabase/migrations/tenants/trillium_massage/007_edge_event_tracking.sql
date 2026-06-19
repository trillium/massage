CREATE TABLE IF NOT EXISTS trillium_massage.edge_event_budget (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_tag    TEXT NOT NULL UNIQUE,
  total_minutes INTEGER NOT NULL DEFAULT 600,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO trillium_massage.edge_event_budget (event_tag, total_minutes)
VALUES ('edge', 600)
ON CONFLICT (event_tag) DO NOTHING;

ALTER TABLE trillium_massage.edge_event_budget ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on edge_event_budget"
  ON trillium_massage.edge_event_budget FOR ALL
  USING (auth.role() = 'service_role');


CREATE TABLE IF NOT EXISTS trillium_massage.edge_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   UUID REFERENCES trillium_massage.appointments(id) ON DELETE SET NULL,
  event_tag        TEXT NOT NULL DEFAULT 'edge',
  session_type     TEXT NOT NULL,
  member_type      TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  calendar_event_id TEXT,
  recorded_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT edge_sessions_session_type_check CHECK (
    session_type IN ('office_hours', 'private')
  ),
  CONSTRAINT edge_sessions_member_type_check CHECK (
    member_type IN ('community', 'team')
  )
);

CREATE INDEX IF NOT EXISTS idx_edge_sessions_event_tag    ON trillium_massage.edge_sessions(event_tag);
CREATE INDEX IF NOT EXISTS idx_edge_sessions_session_type ON trillium_massage.edge_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_edge_sessions_member_type  ON trillium_massage.edge_sessions(member_type);
CREATE INDEX IF NOT EXISTS idx_edge_sessions_recorded_at  ON trillium_massage.edge_sessions(recorded_at);

ALTER TABLE trillium_massage.edge_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on edge_sessions"
  ON trillium_massage.edge_sessions FOR ALL
  USING (auth.role() = 'service_role');
