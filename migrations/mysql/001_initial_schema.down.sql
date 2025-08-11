-- Drop indexes
DROP INDEX idx_audit_logs_created_at ON audit_logs;
DROP INDEX idx_audit_logs_user_id ON audit_logs;
DROP INDEX idx_audit_logs_household_id ON audit_logs;
DROP INDEX idx_ledger_created_at ON ledger;
DROP INDEX idx_ledger_user_id ON ledger;
DROP INDEX idx_assignments_status ON assignments;
DROP INDEX idx_assignments_due_date ON assignments;
DROP INDEX idx_assignments_assigned_to ON assignments;
DROP INDEX idx_assignments_chore_id ON assignments;
DROP INDEX idx_chores_household_id ON chores;
DROP INDEX idx_users_email ON users;
DROP INDEX idx_users_household_id ON users;

-- Drop tables in reverse order
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS ledger;
DROP TABLE IF EXISTS redemptions;
DROP TABLE IF EXISTS rewards;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS chores;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS households;