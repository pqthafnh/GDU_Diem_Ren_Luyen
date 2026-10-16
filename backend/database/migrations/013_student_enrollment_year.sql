ALTER TABLE users
    ADD COLUMN IF NOT EXISTS enrollment_year INTEGER;

UPDATE users
SET enrollment_year = LEFT(student_id, 4)::INTEGER
WHERE enrollment_year IS NULL
  AND student_id ~ '^[0-9]{4}';

CREATE INDEX IF NOT EXISTS idx_users_students_enrollment_year
    ON users(enrollment_year)
    WHERE role = 'STUDENT';
