-- Clean up columns that were mistakenly added to public.raffles
-- They belong in each tenant schema instead (see tenants/*/005_add_raffle_fields.sql)

ALTER TABLE public.raffles
  DROP COLUMN expiration_date,
  DROP COLUMN sms_template_winner,
  DROP COLUMN sms_template_non_winner,
  DROP COLUMN upgrade_minutes,
  DROP COLUMN booking_link;

-- Cleanup: raffle_field_history was created in wrong schema
-- The correct version lives in each tenant schema (see tenants/*/004_raffle_field_history.sql)
DROP TABLE IF EXISTS public.raffle_field_history CASCADE;
