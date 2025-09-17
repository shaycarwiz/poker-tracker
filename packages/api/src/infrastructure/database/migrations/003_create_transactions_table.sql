-- Create transactions table
-- This table stores all financial transactions within sessions

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    description VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_session_id ON transactions(session_id);
CREATE INDEX idx_transactions_player_id ON transactions(player_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_transactions_amount ON transactions(amount);

-- Add check constraints for data integrity
ALTER TABLE transactions ADD CONSTRAINT chk_transactions_amount_positive CHECK (amount > 0);
ALTER TABLE transactions ADD CONSTRAINT chk_transactions_type_valid CHECK (
    type IN ('buy_in', 'cash_out', 'rebuy', 'add_on', 'tip', 'rakeback', 'bonus', 'other')
);

-- Add comments for documentation
COMMENT ON TABLE transactions IS 'Stores all financial transactions within poker sessions';
COMMENT ON COLUMN transactions.id IS 'Unique identifier for the transaction';
COMMENT ON COLUMN transactions.session_id IS 'Reference to the session this transaction belongs to';
COMMENT ON COLUMN transactions.player_id IS 'Reference to the player who made this transaction';
COMMENT ON COLUMN transactions.type IS 'Type of transaction (buy_in, cash_out, etc.)';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount';
COMMENT ON COLUMN transactions.currency IS 'Currency code for the amount';
COMMENT ON COLUMN transactions.timestamp IS 'When the transaction occurred';
COMMENT ON COLUMN transactions.description IS 'Human-readable description of the transaction';
COMMENT ON COLUMN transactions.notes IS 'Additional notes about the transaction';
