ALTER TABLE events
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_events_public
    ON events(status, start_time)
    WHERE deleted_at IS NULL;
