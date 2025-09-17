-- Create additional indexes and views for better performance and analytics

-- Composite indexes for common query patterns
CREATE INDEX idx_sessions_player_status ON sessions(player_id, status);
CREATE INDEX idx_sessions_player_start_time ON sessions(player_id, start_time DESC);
CREATE INDEX idx_transactions_session_type ON transactions(session_id, type);
CREATE INDEX idx_transactions_player_timestamp ON transactions(player_id, timestamp DESC);

-- Create a view for session summaries with calculated fields
CREATE VIEW session_summaries AS
SELECT 
    s.id as session_id,
    s.player_id,
    p.name as player_name,
    s.location,
    CONCAT(s.small_blind, '/', s.big_blind, 
           CASE WHEN s.ante IS NOT NULL THEN CONCAT('/', s.ante) ELSE '' END) as stakes,
    s.start_time,
    s.end_time,
    s.status,
    EXTRACT(EPOCH FROM (COALESCE(s.end_time, NOW()) - s.start_time)) / 60 as duration_minutes,
    COALESCE(buy_ins.total, 0) as total_buy_in,
    COALESCE(cash_outs.total, 0) as total_cash_out,
    COALESCE(cash_outs.total, 0) - COALESCE(buy_ins.total, 0) as net_result,
    CASE 
        WHEN s.end_time IS NOT NULL AND EXTRACT(EPOCH FROM (s.end_time - s.start_time)) > 0 
        THEN (COALESCE(cash_outs.total, 0) - COALESCE(buy_ins.total, 0)) / 
             (EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 3600)
        ELSE NULL 
    END as hourly_rate,
    CASE 
        WHEN s.big_blind > 0 
        THEN (COALESCE(cash_outs.total, 0) - COALESCE(buy_ins.total, 0)) / s.big_blind
        ELSE 0 
    END as big_blinds_won,
    s.notes,
    s.created_at,
    s.updated_at
FROM sessions s
JOIN players p ON s.player_id = p.id
LEFT JOIN (
    SELECT 
        session_id, 
        SUM(amount) as total
    FROM transactions 
    WHERE type IN ('buy_in', 'rebuy')
    GROUP BY session_id
) buy_ins ON s.id = buy_ins.session_id
LEFT JOIN (
    SELECT 
        session_id, 
        SUM(amount) as total
    FROM transactions 
    WHERE type = 'cash_out'
    GROUP BY session_id
) cash_outs ON s.id = cash_outs.session_id;

-- Create a view for player statistics
CREATE VIEW player_statistics AS
SELECT 
    p.id as player_id,
    p.name as player_name,
    p.current_bankroll,
    p.currency,
    COUNT(ss.session_id) as total_sessions,
    SUM(ss.duration_minutes) as total_duration_minutes,
    SUM(ss.total_buy_in) as total_buy_in,
    SUM(ss.total_cash_out) as total_cash_out,
    SUM(ss.net_result) as net_profit,
    MAX(ss.net_result) as biggest_win,
    MIN(ss.net_result) as biggest_loss,
    AVG(ss.net_result) as average_session,
    AVG(ss.hourly_rate) as average_hourly_rate,
    COUNT(CASE WHEN ss.net_result > 0 THEN 1 END) as winning_sessions,
    ROUND(
        COUNT(CASE WHEN ss.net_result > 0 THEN 1 END) * 100.0 / 
        NULLIF(COUNT(ss.session_id), 0), 2
    ) as win_rate,
    MAX(ss.end_time) as last_session_date
FROM players p
LEFT JOIN session_summaries ss ON p.id = ss.player_id AND ss.status = 'completed'
GROUP BY p.id, p.name, p.current_bankroll, p.currency;

-- Add comments for views
COMMENT ON VIEW session_summaries IS 'Pre-calculated session data with derived metrics';
COMMENT ON VIEW player_statistics IS 'Aggregated player statistics and performance metrics';
