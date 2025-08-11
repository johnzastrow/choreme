-- Create households table
CREATE TABLE households (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    household_id INT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('system_admin', 'admin', 'manager', 'worker', 'observer')),
    notification_pref_email BOOLEAN DEFAULT true,
    notification_pref_push BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chores table
CREATE TABLE chores (
    id SERIAL PRIMARY KEY,
    household_id INT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    value NUMERIC(10,2) NOT NULL,
    frequency VARCHAR(50), -- daily, weekly, monthly, custom
    category VARCHAR(50),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    auto_approve BOOLEAN DEFAULT FALSE,
    proof_required BOOLEAN DEFAULT FALSE,
    late_penalty_pct NUMERIC(5,2) DEFAULT 0.00,
    expire_days INT DEFAULT NULL,
    created_by INT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assignments table
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    chore_id INT NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
    assigned_to INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date TIMESTAMP NOT NULL,
    percent_complete NUMERIC(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected', 'late')),
    proof_image BYTEA,
    approval_notes TEXT,
    completed_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rewards table
CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    household_id INT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    cost NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create redemptions table
CREATE TABLE redemptions (
    id SERIAL PRIMARY KEY,
    reward_id INT NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

-- Create ledger table
CREATE TABLE ledger (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('earn', 'spend', 'adjust')),
    amount NUMERIC(10,2) NOT NULL,
    description TEXT,
    chore_assignment_id INT REFERENCES assignments(id) ON DELETE SET NULL,
    redemption_id INT REFERENCES redemptions(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    household_id INT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_household_id ON users(household_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_chores_household_id ON chores(household_id);
CREATE INDEX idx_assignments_chore_id ON assignments(chore_id);
CREATE INDEX idx_assignments_assigned_to ON assignments(assigned_to);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_ledger_user_id ON ledger(user_id);
CREATE INDEX idx_ledger_created_at ON ledger(created_at);
CREATE INDEX idx_audit_logs_household_id ON audit_logs(household_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);