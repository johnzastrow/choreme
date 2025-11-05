-- Migration 002: Enhanced Account Management Features
-- Adds support for: interest rates, spending limits, transfers, running balances
-- MariaDB/MySQL version

-- Add interest tracking to users table
ALTER TABLE users ADD COLUMN interest_rate_annual DECIMAL(5,2) DEFAULT 0.00 AFTER notification_pref_push;
ALTER TABLE users ADD COLUMN last_interest_date DATETIME DEFAULT NULL AFTER interest_rate_annual;

-- Create accounts table (for future multi-account support)
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_type ENUM('primary', 'savings', 'checking', 'goal') DEFAULT 'primary',
    name VARCHAR(100) NOT NULL DEFAULT 'Primary Account',
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_accounts_user_id (user_id),
    INDEX idx_accounts_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create spending_limits table
CREATE TABLE spending_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,

    -- Limit amounts
    daily_limit DECIMAL(10,2) DEFAULT NULL,
    weekly_limit DECIMAL(10,2) DEFAULT NULL,
    monthly_limit DECIMAL(10,2) DEFAULT NULL,

    -- Current period spending
    daily_spent DECIMAL(10,2) DEFAULT 0.00,
    weekly_spent DECIMAL(10,2) DEFAULT 0.00,
    monthly_spent DECIMAL(10,2) DEFAULT 0.00,

    -- Reset tracking
    daily_reset_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    weekly_reset_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    monthly_reset_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Limit status
    is_daily_blocked TINYINT(1) DEFAULT 0,
    is_weekly_blocked TINYINT(1) DEFAULT 0,
    is_monthly_blocked TINYINT(1) DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_spending_limits_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create transfer_requests table
CREATE TABLE transfer_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME DEFAULT NULL,
    approved_by INT DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_transfer_requests_from_user (from_user_id),
    INDEX idx_transfer_requests_to_user (to_user_id),
    INDEX idx_transfer_requests_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add running_balance and transfer_request_id to ledger table
ALTER TABLE ledger ADD COLUMN running_balance DECIMAL(10,2) DEFAULT 0.00 AFTER created_at;
ALTER TABLE ledger ADD COLUMN transfer_request_id INT DEFAULT NULL AFTER running_balance;
ALTER TABLE ledger ADD FOREIGN KEY (transfer_request_id) REFERENCES transfer_requests(id) ON DELETE SET NULL;
CREATE INDEX idx_ledger_running_balance ON ledger(running_balance);
CREATE INDEX idx_ledger_transfer_request_id ON ledger(transfer_request_id);

-- Create default accounts for existing users
INSERT INTO accounts (user_id, account_type, name, is_active)
SELECT id, 'primary', 'Primary Account', 1 FROM users;

-- Create default spending limits for existing users (no limits initially)
INSERT INTO spending_limits (user_id, daily_limit, weekly_limit, monthly_limit)
SELECT id, NULL, NULL, NULL FROM users;

-- Update running balances for existing ledger entries
-- This is done by calculating cumulative sum for each user
SET @running_total := 0;
SET @current_user := 0;

UPDATE ledger l
JOIN (
    SELECT
        id,
        user_id,
        @running_total := IF(@current_user = user_id, @running_total + amount, amount) AS running_balance,
        @current_user := user_id
    FROM ledger
    ORDER BY user_id, id
) AS calc ON l.id = calc.id
SET l.running_balance = calc.running_balance;
