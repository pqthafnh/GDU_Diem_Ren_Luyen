ALTER TABLE training_points_ledger
    ALTER COLUMN idempotency_key DROP DEFAULT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_training_points_ledger_idempotency
    ON training_points_ledger(idempotency_key);
