ALTER TABLE raffles
  ADD COLUMN upgrade_minutes INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN booking_link TEXT;
