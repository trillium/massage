ALTER TABLE raffles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX idx_raffles_active ON raffles(is_active) WHERE is_active = true;
UPDATE raffles SET is_active = true WHERE id = (SELECT id FROM raffles WHERE status = 'open' ORDER BY created_at DESC LIMIT 1);
