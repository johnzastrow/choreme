-- Create households table
CREATE TABLE households (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    household_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role ENUM('system_admin', 'admin', 'manager', 'worker', 'observer') NOT NULL,
    notification_pref_email BOOLEAN DEFAULT TRUE,
    notification_pref_push BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

-- Create chores table
CREATE TABLE chores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    household_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    value DECIMAL(10,2) NOT NULL,
    frequency VARCHAR(50), -- daily, weekly, monthly, custom
    category VARCHAR(50),
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    auto_approve BOOLEAN DEFAULT FALSE,
    proof_required BOOLEAN DEFAULT FALSE,
    late_penalty_pct DECIMAL(5,2) DEFAULT 0.00,
    expire_days INT DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create assignments table
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chore_id INT NOT NULL,
    assigned_to INT NOT NULL,
    due_date TIMESTAMP NOT NULL,
    percent_complete DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('pending', 'in_progress', 'completed', 'approved', 'rejected', 'late') DEFAULT 'pending',
    proof_image LONGBLOB,
    approval_notes TEXT,
    completed_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chore_id) REFERENCES chores(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE
);

-- Create rewards table
CREATE TABLE rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    household_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

-- Create redemptions table
CREATE TABLE redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reward_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create ledger table
CREATE TABLE ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('earn', 'spend', 'adjust') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    chore_assignment_id INT NULL,
    redemption_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chore_assignment_id) REFERENCES assignments(id) ON DELETE SET NULL,
    FOREIGN KEY (redemption_id) REFERENCES redemptions(id) ON DELETE SET NULL
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    household_id INT NOT NULL,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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