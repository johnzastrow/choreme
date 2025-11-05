-- Rollback Migration 002: Enhanced Account Management Features
-- MariaDB/MySQL version

-- Drop foreign key constraints first
ALTER TABLE ledger DROP FOREIGN KEY IF EXISTS ledger_ibfk_transfer_request_id;

-- Drop indexes
DROP INDEX idx_ledger_transfer_request_id ON ledger;
DROP INDEX idx_ledger_running_balance ON ledger;

-- Drop columns from ledger
ALTER TABLE ledger DROP COLUMN transfer_request_id;
ALTER TABLE ledger DROP COLUMN running_balance;

-- Drop new tables
DROP TABLE IF EXISTS transfer_requests;
DROP TABLE IF EXISTS spending_limits;
DROP TABLE IF EXISTS accounts;

-- Drop columns from users table
ALTER TABLE users DROP COLUMN last_interest_date;
ALTER TABLE users DROP COLUMN interest_rate_annual;
