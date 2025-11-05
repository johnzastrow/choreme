-- Rollback Migration 002: Enhanced Account Management Features
-- PostgreSQL version

-- Drop indexes
DROP INDEX IF EXISTS idx_ledger_transfer_request_id;
DROP INDEX IF EXISTS idx_ledger_running_balance;
DROP INDEX IF EXISTS idx_transfer_requests_status;
DROP INDEX IF EXISTS idx_transfer_requests_to_user;
DROP INDEX IF EXISTS idx_transfer_requests_from_user;
DROP INDEX IF EXISTS idx_spending_limits_user_id;
DROP INDEX IF EXISTS idx_accounts_is_active;
DROP INDEX IF EXISTS idx_accounts_user_id;

-- Drop columns from ledger (PostgreSQL supports DROP COLUMN)
ALTER TABLE ledger DROP COLUMN IF EXISTS transfer_request_id;
ALTER TABLE ledger DROP COLUMN IF EXISTS running_balance;

-- Drop new tables
DROP TABLE IF EXISTS transfer_requests CASCADE;
DROP TABLE IF EXISTS spending_limits CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

-- Drop columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS last_interest_date;
ALTER TABLE users DROP COLUMN IF EXISTS interest_rate_annual;
