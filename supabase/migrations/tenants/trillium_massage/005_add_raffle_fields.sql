-- Add raffle columns that were mistakenly added only to public.raffles
-- (migrations 20260615000001, 0004, 0005 targeted the wrong schema)

ALTER TABLE trillium_massage.raffles
  ADD COLUMN expiration_date        DATE,
  ADD COLUMN sms_template_winner    TEXT,
  ADD COLUMN sms_template_non_winner TEXT,
  ADD COLUMN upgrade_minutes        INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN booking_link           TEXT;

-- Copy existing values from public.raffles for rows that exist in both schemas
UPDATE trillium_massage.raffles AS t
SET
  expiration_date        = p.expiration_date,
  sms_template_winner    = p.sms_template_winner,
  sms_template_non_winner = p.sms_template_non_winner,
  upgrade_minutes        = p.upgrade_minutes,
  booking_link           = p.booking_link
FROM public.raffles AS p
WHERE t.id = p.id;
