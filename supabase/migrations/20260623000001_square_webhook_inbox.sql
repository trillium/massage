-- Webhook inbox (process each Square event once) + provider version on invoices.
-- Applied to public and every existing tenant schema.

DO $$
DECLARE
  s TEXT;
BEGIN
  FOREACH s IN ARRAY ARRAY['public', 'trillium_massage', 'sarah_music', 'monica_massage']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = s) THEN
      EXECUTE format($sql$
        CREATE TABLE IF NOT EXISTS %I.square_webhook_events (
          event_id     TEXT PRIMARY KEY,
          event_type   TEXT NOT NULL,
          payload      JSONB,
          received_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
          processed_at TIMESTAMPTZ
        )
      $sql$, s);
      EXECUTE format('ALTER TABLE %I.square_webhook_events ENABLE ROW LEVEL SECURITY', s);
      BEGIN
        EXECUTE format('CREATE POLICY "Service role full access on square_webhook_events" ON %I.square_webhook_events FOR ALL USING (auth.role() = ''service_role'')', s);
      EXCEPTION WHEN duplicate_object THEN NULL; END;
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = s AND table_name = 'invoices') THEN
        EXECUTE format('ALTER TABLE %I.invoices ADD COLUMN IF NOT EXISTS square_version INTEGER', s);
      END IF;
    END IF;
  END LOOP;
END $$;
