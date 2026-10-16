CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
    name VARCHAR(255) PRIMARY KEY,
    checksum CHAR(64) NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) UNIQUE,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) NOT NULL DEFAULT 'Nam' CHECK (gender IN ('Nam', 'Nữ', 'Khác')),
    birth_date DATE NOT NULL,
    class_name VARCHAR(50),
    major VARCHAR(100),
    phone_number VARCHAR(15),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_password_changed BOOLEAN NOT NULL DEFAULT FALSE,
    pending_password_hash VARCHAR(255),
    otp_hash VARCHAR(255),
    otp_expires_at TIMESTAMPTZ,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('ADMIN', 'MOD', 'STUDENT')),
    theme_preference VARCHAR(20) NOT NULL DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    banner_url TEXT,
    category VARCHAR(50) NOT NULL,
    event_type VARCHAR(20) NOT NULL DEFAULT 'STANDARD' CHECK (event_type IN ('STANDARD', 'INTERACTIVE')),
    check_in_method VARCHAR(30) NOT NULL DEFAULT 'QR_GPS'
        CHECK (check_in_method IN ('QR_GPS', 'MANUAL_ROLLCALL', 'SOCIAL_INTERACTIVE')),
    facebook_post_url TEXT,
    interactive_instruction TEXT,
    target_major VARCHAR(100) NOT NULL DEFAULT 'Toàn trường',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL CHECK (start_time < end_time),
    location_name VARCHAR(255) NOT NULL,
    gps_lat DOUBLE PRECISION,
    gps_lng DOUBLE PRECISION,
    gps_radius_meters INTEGER DEFAULT 100 CHECK (gps_radius_meters IS NULL OR gps_radius_meters > 0),
    capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
    points_reward INTEGER NOT NULL DEFAULT 0 CHECK (points_reward >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'APPROVED',
                          'REJECTED', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    review_feedback TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interactive_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    action_type VARCHAR(30) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    points_reward INTEGER NOT NULL CHECK (points_reward >= 0),
    order_index INTEGER NOT NULL CHECK (order_index > 0),
    UNIQUE (event_id, action_type)
);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('OFFICIAL', 'WAITLIST', 'CANCELLED')),
    queue_number INTEGER NOT NULL CHECK (queue_number > 0),
    seat_number VARCHAR(50),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, student_id)
);

CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMPTZ,
    scanned_lat DOUBLE PRECISION NOT NULL DEFAULT 0,
    scanned_lng DOUBLE PRECISION NOT NULL DEFAULT 0,
    distance_meters DOUBLE PRECISION NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL CHECK (status IN ('VALID', 'INVALID_GPS', 'EXPIRED_QR', 'CHECKED_IN',
        'CHECKED_OUT', 'MISSING_CHECKOUT', 'MANUAL_OVERRIDE')),
    call_status VARCHAR(30) NOT NULL DEFAULT 'NOT_CONTACTED',
    call_note TEXT,
    verified_by_call_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (event_id, student_id)
);

CREATE TABLE IF NOT EXISTS training_points_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    points_awarded INTEGER NOT NULL CHECK (points_awarded >= 0),
    criteria_category VARCHAR(100) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, event_id, criteria_category, semester, academic_year)
);

CREATE TABLE IF NOT EXISTS system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL DEFAULT 'EVENT',
    target_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_status_start ON events(status, start_time);
CREATE INDEX IF NOT EXISTS idx_tickets_event_status_queue ON tickets(event_id, status, queue_number);
CREATE INDEX IF NOT EXISTS idx_ledger_student_created ON training_points_ledger(student_id, created_at);
