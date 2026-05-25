CREATE TABLE IF NOT EXISTS device_events (
    id UUID PRIMARY KEY,
    device_id VARCHAR(128) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drone_registry (
    drone_id VARCHAR(80) PRIMARY KEY,
    model VARCHAR(120) NOT NULL,
    firmware_version VARCHAR(80) NOT NULL,
    max_speed_mps DOUBLE PRECISION NOT NULL,
    max_altitude_m DOUBLE PRECISION NOT NULL,
    battery_capacity_mah INTEGER NOT NULL,
    camera_types JSONB NOT NULL DEFAULT '[]'::jsonb,
    sensors JSONB NOT NULL DEFAULT '[]'::jsonb,
    payload_supported BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(32) NOT NULL DEFAULT 'offline',
    protocol VARCHAR(40) NOT NULL DEFAULT 'simulated',
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_drone_registry_status ON drone_registry(status);
