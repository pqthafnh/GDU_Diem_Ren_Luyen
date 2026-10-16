ALTER TABLE training_points_ledger
    DROP CONSTRAINT IF EXISTS training_points_ledger_points_awarded_check;

ALTER TABLE training_points_ledger
    ADD CONSTRAINT training_points_ledger_points_awarded_check
    CHECK (points_awarded BETWEEN -100 AND 100);
