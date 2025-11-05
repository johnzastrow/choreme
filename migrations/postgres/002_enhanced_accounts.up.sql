-- Migration 002: Enhanced Account Management Features
-- Adds support for: interest rates, spending limits, transfers, running balances
-- PostgreSQL version

-- Add interest tracking to users table
ALTER TABLE users ADD COLUMN interest_rate_annual NUMERIC(5,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN last_interest_date TIMESTAMP DEFAULT NULL;

-- Create accounts table (for future multi-account support)
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_type VARCHAR(20) DEFAULT 'primary' CHECK (account_type IN ('primary', 'savings', 'checking', 'goal')),
    name VARCHAR(100) NOT NULL DEFAULT 'Primary Account',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spending_limits table
CREATE TABLE spending_limits (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Limit amounts
    daily_limit NUMERIC(10,2) DEFAULT NULL,
    weekly_limit NUMERIC(10,2) DEFAULT NULL,
    monthly_limit NUMERIC(10,2) DEFAULT NULL,

    -- Current period spending
    daily_spent NUMERIC(10,2) DEFAULT 0.00,
    weekly_spent NUMERIC(10,2) DEFAULT 0.00,
    monthly_spent NUMERIC(10,2) DEFAULT 0.00,

    -- Reset tracking
    daily_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    weekly_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monthly_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Limit status
    is_daily_blocked BOOLEAN DEFAULT FALSE,
    is_weekly_blocked BOOLEAN DEFAULT FALSE,
    is_monthly_blocked BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transfer_requests table
CREATE TABLE transfer_requests (
    id SERIAL PRIMARY KEY,
    from_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP DEFAULT NULL,
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add running_balance and transfer_request_id to ledger table
ALTER TABLE ledger ADD COLUMN running_balance NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE ledger ADD COLUMN transfer_request_id INT REFERENCES transfer_requests(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_is_active ON accounts(is_active);
CREATE INDEX idx_spending_limits_user_id ON spending_limits(user_id);
CREATE INDEX idx_transfer_requests_from_user ON transfer_requests(from_user_id);
CREATE INDEX idx_transfer_requests_to_user ON transfer_requests(to_user_id);
CREATE INDEX idx_transfer_requests_status ON transfer_requests(status);
CREATE INDEX idx_ledger_running_balance ON ledger(running_balance);
CREATE INDEX idx_ledger_transfer_request_id ON ledger(transfer_request_id);

-- Create default accounts for existing users
INSERT INTO accounts (user_id, account_type, name, is_active)
SELECT id, 'primary', 'Primary Account', TRUE FROM users;

-- Create default spending limits for existing users (no limits initially)
INSERT INTO spending_limits (user_id, daily_limit, weekly_limit, monthly_limit)
SELECT id, NULL, NULL, NULL FROM users;

-- Update running balances for existing ledger entries
-- This is done by calculating cumulative sum for each user using window functions
WITH running_totals AS (
    SELECT
        id,
        SUM(amount) OVER (PARTITION BY user_id ORDER BY id) AS running_balance
    FROM ledger
)
UPDATE ledger
SET running_balance = running_totals.running_balance
FROM running_totals
WHERE ledger.id = running_totals.id;
