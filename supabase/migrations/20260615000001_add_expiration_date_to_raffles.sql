ALTER TABLE raffles ADD COLUMN expiration_date DATE;

UPDATE raffles SET expiration_date = '2026-05-23' WHERE name = 'OpenClaw May 2026';
