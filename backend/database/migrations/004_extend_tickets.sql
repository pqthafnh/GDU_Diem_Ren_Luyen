ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS waitlist_position INTEGER,
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(15),
    ADD COLUMN IF NOT EXISTS note TEXT,
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_tickets_waitlist
    ON tickets(event_id, waitlist_position)
    WHERE status = 'WAITLIST';
