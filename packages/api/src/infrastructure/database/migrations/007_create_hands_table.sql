-- Create hands table for session-scoped poker hand capture

CREATE TABLE hands (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    capture_type VARCHAR(20) NOT NULL,
    hero_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    pot_amount DECIMAL(15,2),
    net_result DECIMAL(15,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    tags TEXT[] DEFAULT '{}',
    note TEXT,
    hand_state JSONB NOT NULL,
    schema_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hands_session_id ON hands(session_id);
CREATE INDEX idx_hands_owner_user_id ON hands(owner_user_id);
CREATE INDEX idx_hands_session_created_at ON hands(session_id, created_at DESC);
CREATE INDEX idx_hands_tags ON hands USING GIN(tags);

ALTER TABLE hands ADD CONSTRAINT chk_hands_capture_type_valid
    CHECK (capture_type IN ('snapshot', 'full'));
ALTER TABLE hands ADD CONSTRAINT chk_hands_schema_version_positive
    CHECK (schema_version >= 1);

COMMENT ON TABLE hands IS 'Stores captured poker hands within sessions';
COMMENT ON COLUMN hands.hand_state IS 'Versioned JSON document with full hand snapshot or builder state';
