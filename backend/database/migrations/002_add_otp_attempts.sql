ALTER TABLE users
    ADD COLUMN IF NOT EXISTS otp_attempts INTEGER NOT NULL DEFAULT 0
    CHECK (otp_attempts >= 0);
