-- sarah_music tenant schema — feedtack tables
-- Applied May 10 2026 via fix/auth-public-schema branch; stub recreated for history accuracy.

CREATE TABLE IF NOT EXISTS sarah_music.feedtack_submissions (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE sarah_music.feedtack_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_feedtack" ON sarah_music.feedtack_submissions FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS sarah_music.feedtack_replies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id  TEXT NOT NULL REFERENCES sarah_music.feedtack_submissions(id) ON DELETE CASCADE,
  author       JSONB NOT NULL,
  body         TEXT NOT NULL,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE sarah_music.feedtack_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_feedtack_replies" ON sarah_music.feedtack_replies FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS sarah_music.feedtack_resolutions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id  TEXT NOT NULL REFERENCES sarah_music.feedtack_submissions(id) ON DELETE CASCADE,
  resolvedBy   JSONB NOT NULL,
  note         TEXT,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE sarah_music.feedtack_resolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_feedtack_resolutions" ON sarah_music.feedtack_resolutions FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS sarah_music.feedtack_archives (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id  TEXT NOT NULL REFERENCES sarah_music.feedtack_submissions(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE sarah_music.feedtack_archives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_feedtack_archives" ON sarah_music.feedtack_archives FOR ALL USING (auth.role() = 'service_role');
