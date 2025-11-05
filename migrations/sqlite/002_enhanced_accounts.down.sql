-- Rollback Migration 002: Enhanced Account Management Features

-- Drop indexes
DROP INDEX IF EXISTS idx_ledger_transfer_request_id;
DROP INDEX IF EXISTS idx_ledger_running_balance;
DROP INDEX IF EXISTS idx_transfer_requests_status;
DROP INDEX IF EXISTS idx_transfer_requests_to_user;
DROP INDEX IF EXISTS idx_transfer_requests_from_user;
DROP INDEX IF EXISTS idx_spending_limits_user_id;
DROP INDEX IF EXISTS idx_accounts_is_active;
DROP INDEX IF EXISTS idx_accounts_user_id;

-- Note: SQLite doesn't support DROP COLUMN, so we would need to recreate the ledger table
-- For now, we'll leave the columns but mark them as deprecated
-- In a production system, you'd recreate the table without these columns

-- Drop new tables
DROP TABLE IF EXISTS transfer_requests;
DROP TABLE IF EXISTS spending_limits;
DROP TABLE IF EXISTS accounts;

-- Note: Cannot remove columns from users table in SQLite without recreating table
-- interest_rate_annual and last_interest_date columns will remain but be unused
