CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  date DATE NOT NULL,
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  comment TEXT,
  type TEXT,
  helpful INTEGER,
  spellcheck TEXT
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
