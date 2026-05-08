CREATE TABLE IF NOT EXISTS trillium_massage.feedtack_submissions (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE trillium_massage.feedtack_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_feedtack" ON trillium_massage.feedtack_submissions FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS trillium_massage.feedtack_replies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id  TEXT NOT NULL REFERENCES trillium_massage.feedtack_submissions(id) ON DELETE CASCADE,
  author       JSONB NOT NULL,
  body         TEXT NOT NULL,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE trillium_massage.feedtack_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_feedtack_replies" ON trillium_massage.feedtack_replies FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS trillium_massage.feedtack_resolutions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id  TEXT NOT NULL REFERENCES trillium_massage.feedtack_submissions(id) ON DELETE CASCADE,
  resolvedBy   JSONB NOT NULL,
  note         TEXT,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE trillium_massage.feedtack_resolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_feedtack_resolutions" ON trillium_massage.feedtack_resolutions FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS trillium_massage.feedtack_archives (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id  TEXT NOT NULL REFERENCES trillium_massage.feedtack_submissions(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE trillium_massage.feedtack_archives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srfa_feedtack_archives" ON trillium_massage.feedtack_archives FOR ALL USING (auth.role() = 'service_role');
