ALTER TABLE training_points_ledger
    ALTER COLUMN idempotency_key SET DEFAULT gen_random_uuid()::text;
