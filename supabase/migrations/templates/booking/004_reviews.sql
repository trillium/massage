CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  date       DATE NOT NULL,
  name       TEXT NOT NULL,
  source     TEXT NOT NULL,
  comment    TEXT,
  type       TEXT,
  helpful    INTEGER,
  spellcheck TEXT
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on reviews"
  ON reviews FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon can read reviews"
  ON reviews FOR SELECT
  USING (auth.role() = 'anon');
