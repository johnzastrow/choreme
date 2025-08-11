-- Drop indexes
DROP INDEX IF EXISTS idx_audit_logs_created_at;
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_audit_logs_household_id;
DROP INDEX IF EXISTS idx_ledger_created_at;
DROP INDEX IF EXISTS idx_ledger_user_id;
DROP INDEX IF EXISTS idx_assignments_status;
DROP INDEX IF EXISTS idx_assignments_due_date;
DROP INDEX IF EXISTS idx_assignments_assigned_to;
DROP INDEX IF EXISTS idx_assignments_chore_id;
DROP INDEX IF EXISTS idx_chores_household_id;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_household_id;

-- Drop tables in reverse order
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS ledger;
DROP TABLE IF EXISTS redemptions;
DROP TABLE IF EXISTS rewards;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS chores;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS households;