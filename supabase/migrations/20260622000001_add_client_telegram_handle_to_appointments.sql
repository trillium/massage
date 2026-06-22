-- Add nullable client_telegram_handle column to appointments tables.
-- Mirrors client_phone in shape (TEXT, nullable). At least one of phone/telegram
-- is enforced at the application layer (zod refine) so existing rows with only
-- a phone (or only a future telegram) remain valid without a backfill.

-- public schema (legacy non-tenant table from initial migration)
ALTER TABLE IF EXISTS public.appointments
  ADD COLUMN IF NOT EXISTS client_telegram_handle TEXT;

-- Tenant schemas: trillium_massage, sarah_music, monica_massage, kendra_tarot
-- trillium_devblog has no booking surface; skipped.
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
        'ALTER TABLE %I.appointments ADD COLUMN IF NOT EXISTS client_telegram_handle TEXT',
        tenant_schema
      );
    END IF;
  END LOOP;
END $$;
