CREATE TABLE IF NOT EXISTS sandbox_sessions (
  session_id TEXT PRIMARY KEY,
  events     JSONB NOT NULL DEFAULT '[]',
  emails     JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sandbox_sessions_created_at ON sandbox_sessions(created_at);

ALTER TABLE sandbox_sessions ENABLE ROW LEVEL SECURITY;
