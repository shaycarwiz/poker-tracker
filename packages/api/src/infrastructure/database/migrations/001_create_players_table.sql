-- Create players table
-- This table stores player information and basic statistics

CREATE TABLE players (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    current_bankroll DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    total_sessions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_players_created_at ON players(created_at);

-- Add comments for documentation
COMMENT ON TABLE players IS 'Stores player information and basic statistics';
COMMENT ON COLUMN players.id IS 'Unique identifier for the player';
COMMENT ON COLUMN players.name IS 'Player display name';
COMMENT ON COLUMN players.email IS 'Player email address (optional)';
COMMENT ON COLUMN players.current_bankroll IS 'Current bankroll amount';
COMMENT ON COLUMN players.currency IS 'Currency code (USD, EUR, etc.)';
COMMENT ON COLUMN players.total_sessions IS 'Total number of completed sessions';
