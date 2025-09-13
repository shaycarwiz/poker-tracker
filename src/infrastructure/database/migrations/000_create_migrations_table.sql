-- Create migrations tracking table
-- This table tracks which migrations have been applied

CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64) NOT NULL,
    execution_time_ms INTEGER NOT NULL DEFAULT 0
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_migrations_filename ON migrations(filename);
CREATE INDEX IF NOT EXISTS idx_migrations_applied_at ON migrations(applied_at);
