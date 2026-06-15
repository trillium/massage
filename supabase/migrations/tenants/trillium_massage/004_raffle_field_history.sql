CREATE TABLE IF NOT EXISTS trillium_massage.raffle_field_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id  UUID NOT NULL REFERENCES trillium_massage.raffles(id) ON DELETE CASCADE,
  field      TEXT NOT NULL,
  old_value  TEXT,
  new_value  TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_raffle_field_history_raffle
  ON trillium_massage.raffle_field_history(raffle_id, changed_at DESC);

ALTER TABLE trillium_massage.raffle_field_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on raffle_field_history"
  ON trillium_massage.raffle_field_history FOR ALL
  USING (auth.role() = 'service_role');
