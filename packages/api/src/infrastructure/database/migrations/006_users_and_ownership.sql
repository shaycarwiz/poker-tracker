-- Migration: Users table and ownership model
-- Separates auth users from domain players; sessions owned by users

-- Step 1: Create users table (default_player_id FK added after backfill)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    google_id VARCHAR(255) NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'he',
    default_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    default_player_id UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

COMMENT ON TABLE users IS 'App accounts (authentication identity)';
COMMENT ON COLUMN users.default_player_id IS 'Default player profile for this user';

-- Step 2: Migrate existing Google-authenticated players into users
INSERT INTO users (id, google_id, email, name, preferred_language, default_currency, created_at, updated_at)
SELECT
    gen_random_uuid(),
    p.google_id,
    COALESCE(p.email, p.google_id || '@placeholder.local'),
    p.name,
    COALESCE(p.preferred_language, 'he'),
    COALESCE(p.currency, 'USD'),
    p.created_at,
    p.updated_at
FROM players p
WHERE p.google_id IS NOT NULL;

-- Step 3: Add ownership columns to players
ALTER TABLE players ADD COLUMN owner_user_id UUID NULL;
ALTER TABLE players ADD COLUMN linked_user_id UUID NULL;

-- Link players with google_id to their user
UPDATE players p
SET owner_user_id = u.id
FROM users u
WHERE p.google_id IS NOT NULL AND p.google_id = u.google_id;

-- Set default_player_id on users
UPDATE users u
SET default_player_id = p.id
FROM players p
WHERE p.google_id IS NOT NULL AND p.google_id = u.google_id;

-- Step 4: Add owner_user_id to sessions and backfill
ALTER TABLE sessions ADD COLUMN owner_user_id UUID NULL;

UPDATE sessions s
SET owner_user_id = p.owner_user_id
FROM players p
WHERE s.player_id = p.id AND p.owner_user_id IS NOT NULL;

-- Delete sessions that cannot be attributed to a user (orphan data)
DELETE FROM sessions WHERE owner_user_id IS NULL;

-- Step 5: Drop old views that depend on sessions.player_id
DROP VIEW IF EXISTS player_statistics;
DROP VIEW IF EXISTS session_summaries;

-- Step 6: Drop old session player_id constraints and column
DROP INDEX IF EXISTS idx_sessions_player_id;
DROP INDEX IF EXISTS idx_sessions_player_status;
DROP INDEX IF EXISTS idx_sessions_player_start_time;

ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_player_id_fkey;
ALTER TABLE sessions DROP COLUMN player_id;

ALTER TABLE sessions ALTER COLUMN owner_user_id SET NOT NULL;
ALTER TABLE sessions ADD CONSTRAINT sessions_owner_user_id_fkey
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_sessions_owner_user_id ON sessions(owner_user_id);
CREATE INDEX idx_sessions_owner_status ON sessions(owner_user_id, status);
CREATE INDEX idx_sessions_owner_start_time ON sessions(owner_user_id, start_time DESC);

-- Step 7: Finalize players ownership
-- Delete orphan players without an owner (no google_id, not linked to a user)
DELETE FROM players WHERE owner_user_id IS NULL;

ALTER TABLE players ALTER COLUMN owner_user_id SET NOT NULL;
ALTER TABLE players ADD CONSTRAINT players_owner_user_id_fkey
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE players ADD CONSTRAINT players_linked_user_id_fkey
    FOREIGN KEY (linked_user_id) REFERENCES users(id) ON DELETE SET NULL;

DROP INDEX IF EXISTS idx_players_google_id;
ALTER TABLE players DROP COLUMN IF EXISTS google_id;
ALTER TABLE players DROP COLUMN IF EXISTS preferred_language;

-- Relax email uniqueness on players (contacts may share emails)
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_email_key;
DROP INDEX IF EXISTS idx_players_email;
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_owner_user_id ON players(owner_user_id);

-- Step 8: Add default_player_id FK on users
ALTER TABLE users ADD CONSTRAINT users_default_player_id_fkey
    FOREIGN KEY (default_player_id) REFERENCES players(id) ON DELETE SET NULL;

-- Step 9: Recreate views with new ownership model
CREATE VIEW session_summaries AS
SELECT
    s.id AS session_id,
    s.owner_user_id,
    u.name AS owner_name,
    s.location,
    CONCAT(s.small_blind, '/', s.big_blind,
           CASE WHEN s.ante IS NOT NULL THEN CONCAT('/', s.ante) ELSE '' END) AS stakes,
    s.start_time,
    s.end_time,
    s.status,
    EXTRACT(EPOCH FROM (COALESCE(s.end_time, NOW()) - s.start_time)) / 60 AS duration_minutes,
    COALESCE(buy_ins.total, 0) AS total_buy_in,
    COALESCE(cash_outs.total, 0) AS total_cash_out,
    COALESCE(cash_outs.total, 0) - COALESCE(buy_ins.total, 0) AS net_result,
    CASE
        WHEN s.end_time IS NOT NULL AND EXTRACT(EPOCH FROM (s.end_time - s.start_time)) > 0
        THEN (COALESCE(cash_outs.total, 0) - COALESCE(buy_ins.total, 0)) /
             (EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 3600)
        ELSE NULL
    END AS hourly_rate,
    CASE
        WHEN s.big_blind > 0
        THEN (COALESCE(cash_outs.total, 0) - COALESCE(buy_ins.total, 0)) / s.big_blind
        ELSE 0
    END AS big_blinds_won,
    s.notes,
    s.created_at,
    s.updated_at
FROM sessions s
JOIN users u ON s.owner_user_id = u.id
LEFT JOIN (
    SELECT session_id, SUM(amount) AS total
    FROM transactions
    WHERE type IN ('buy_in', 'rebuy')
    GROUP BY session_id
) buy_ins ON s.id = buy_ins.session_id
LEFT JOIN (
    SELECT session_id, SUM(amount) AS total
    FROM transactions
    WHERE type = 'cash_out'
    GROUP BY session_id
) cash_outs ON s.id = cash_outs.session_id;

CREATE VIEW player_statistics AS
SELECT
    p.id AS player_id,
    p.owner_user_id,
    p.name AS player_name,
    p.current_bankroll,
    p.currency,
    COUNT(DISTINCT t.session_id) FILTER (WHERE s.status = 'completed') AS total_sessions,
    SUM(ss.duration_minutes) AS total_duration_minutes,
    SUM(ss.total_buy_in) AS total_buy_in,
    SUM(ss.total_cash_out) AS total_cash_out,
    SUM(ss.net_result) AS net_profit,
    MAX(ss.net_result) AS biggest_win,
    MIN(ss.net_result) AS biggest_loss,
    AVG(ss.net_result) AS average_session,
    AVG(ss.hourly_rate) AS average_hourly_rate,
    COUNT(CASE WHEN ss.net_result > 0 THEN 1 END) AS winning_sessions,
    ROUND(
        COUNT(CASE WHEN ss.net_result > 0 THEN 1 END) * 100.0 /
        NULLIF(COUNT(ss.session_id), 0), 2
    ) AS win_rate,
    MAX(ss.end_time) AS last_session_date
FROM players p
LEFT JOIN transactions t ON t.player_id = p.id
LEFT JOIN session_summaries ss ON t.session_id = ss.session_id AND ss.status = 'completed'
LEFT JOIN sessions s ON t.session_id = s.id
GROUP BY p.id, p.owner_user_id, p.name, p.current_bankroll, p.currency;

COMMENT ON VIEW session_summaries IS 'Pre-calculated session data with derived metrics (user-owned sessions)';
COMMENT ON VIEW player_statistics IS 'Aggregated player statistics and performance metrics';
