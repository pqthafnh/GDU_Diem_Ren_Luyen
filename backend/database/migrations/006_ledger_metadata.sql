ALTER TABLE training_points_ledger
    ADD COLUMN IF NOT EXISTS source_type VARCHAR(40) NOT NULL DEFAULT 'ATTENDANCE',
    ADD COLUMN IF NOT EXISTS source_id UUID,
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255),
    ADD COLUMN IF NOT EXISTS awarded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS correction_of UUID REFERENCES training_points_ledger(id) ON DELETE RESTRICT;

UPDATE training_points_ledger
SET idempotency_key = id::text
WHERE idempotency_key IS NULL;

ALTER TABLE training_points_ledger
    ALTER COLUMN idempotency_key SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_training_points_ledger_idempotency
    ON training_points_ledger(idempotency_key);
