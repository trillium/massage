ALTER TABLE IF EXISTS public.appointments
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

DO $$
DECLARE
  tenant_schema TEXT;
BEGIN
  FOREACH tenant_schema IN ARRAY ARRAY[
    'trillium_massage',
    'sarah_music',
    'monica_massage',
    'kendra_tarot'
  ] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = tenant_schema AND table_name = 'appointments'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I.appointments ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT, ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ',
        tenant_schema
      );
    END IF;
  END LOOP;
END $$;
