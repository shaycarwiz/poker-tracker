-- Add user preferences to players table
-- This migration adds language preference support

-- Add preferred_language column to players table
ALTER TABLE players 
ADD COLUMN preferred_language VARCHAR(5) NOT NULL DEFAULT 'he';

-- Update existing players to have Hebrew as default language
UPDATE players 
SET preferred_language = 'he' 
WHERE preferred_language IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN players.preferred_language IS 'User preferred language code (he, en, es, fr)';

-- Create index for better query performance
CREATE INDEX idx_players_preferred_language ON players(preferred_language);
