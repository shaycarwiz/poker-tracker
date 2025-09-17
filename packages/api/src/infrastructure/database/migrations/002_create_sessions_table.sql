-- Create sessions table
-- This table stores poker session information

CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    location VARCHAR(255) NOT NULL,
    small_blind DECIMAL(15,2) NOT NULL,
    big_blind DECIMAL(15,2) NOT NULL,
    ante DECIMAL(15,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_sessions_player_id ON sessions(player_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_sessions_end_time ON sessions(end_time);
CREATE INDEX idx_sessions_location ON sessions(location);

-- Add check constraints for data integrity
ALTER TABLE sessions ADD CONSTRAINT chk_sessions_small_blind_positive CHECK (small_blind > 0);
ALTER TABLE sessions ADD CONSTRAINT chk_sessions_big_blind_positive CHECK (big_blind > 0);
ALTER TABLE sessions ADD CONSTRAINT chk_sessions_big_blind_greater CHECK (big_blind > small_blind);
ALTER TABLE sessions ADD CONSTRAINT chk_sessions_ante_positive CHECK (ante IS NULL OR ante >= 0);
ALTER TABLE sessions ADD CONSTRAINT chk_sessions_status_valid CHECK (status IN ('active', 'completed', 'cancelled'));
ALTER TABLE sessions ADD CONSTRAINT chk_sessions_end_time_after_start CHECK (end_time IS NULL OR end_time >= start_time);

-- Add comments for documentation
COMMENT ON TABLE sessions IS 'Stores poker session information';
COMMENT ON COLUMN sessions.id IS 'Unique identifier for the session';
COMMENT ON COLUMN sessions.player_id IS 'Reference to the player who played this session';
COMMENT ON COLUMN sessions.location IS 'Where the poker game was played';
COMMENT ON COLUMN sessions.small_blind IS 'Small blind amount';
COMMENT ON COLUMN sessions.big_blind IS 'Big blind amount';
COMMENT ON COLUMN sessions.ante IS 'Ante amount (optional)';
COMMENT ON COLUMN sessions.currency IS 'Currency code for the stakes';
COMMENT ON COLUMN sessions.start_time IS 'When the session started';
COMMENT ON COLUMN sessions.end_time IS 'When the session ended (NULL for active sessions)';
COMMENT ON COLUMN sessions.status IS 'Current status of the session';
COMMENT ON COLUMN sessions.notes IS 'Additional notes about the session';
