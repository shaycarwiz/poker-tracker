-- Migration: Add Google ID to players table
-- Description: Adds google_id column to support OAuth authentication
-- Version: 003
-- Created: 2024-01-01

-- Add google_id column to players table
ALTER TABLE players 
ADD COLUMN google_id VARCHAR(255) NULL;

-- Create unique index on google_id for fast lookups
CREATE UNIQUE INDEX idx_players_google_id ON players(google_id) WHERE google_id IS NOT NULL;

-- Add comment to the column
COMMENT ON COLUMN players.google_id IS 'Google OAuth user ID for authentication';
