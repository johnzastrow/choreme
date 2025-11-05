package sqlite

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/choreme/choreme/internal/model"
	"github.com/shopspring/decimal"
)

// Account operations

func (s *Store) CreateAccount(ctx context.Context, account *model.Account) error {
	query := `
		INSERT INTO accounts (user_id, account_type, name, is_active, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`
	result, err := s.db.ExecContext(ctx, query,
		account.UserID,
		account.AccountType,
		account.Name,
		account.IsActive,
		time.Now(),
		time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to create account: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get account ID: %w", err)
	}
	account.ID = int(id)
	return nil
}

func (s *Store) GetAccountByID(ctx context.Context, id int) (*model.Account, error) {
	query := `
		SELECT id, user_id, account_type, name, is_active, created_at, updated_at
		FROM accounts
		WHERE id = ?
	`
	account := &model.Account{}
	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&account.ID,
		&account.UserID,
		&account.AccountType,
		&account.Name,
		&account.IsActive,
		&account.CreatedAt,
		&account.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("account not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get account: %w", err)
	}
	return account, nil
}

func (s *Store) GetAccountsByUser(ctx context.Context, userID int) ([]*model.Account, error) {
	query := `
		SELECT id, user_id, account_type, name, is_active, created_at, updated_at
		FROM accounts
		WHERE user_id = ? AND is_active = 1
		ORDER BY created_at ASC
	`
	rows, err := s.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get accounts: %w", err)
	}
	defer rows.Close()

	var accounts []*model.Account
	for rows.Next() {
		account := &model.Account{}
		err := rows.Scan(
			&account.ID,
			&account.UserID,
			&account.AccountType,
			&account.Name,
			&account.IsActive,
			&account.CreatedAt,
			&account.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan account: %w", err)
		}
		accounts = append(accounts, account)
	}
	return accounts, nil
}

func (s *Store) GetPrimaryAccount(ctx context.Context, userID int) (*model.Account, error) {
	query := `
		SELECT id, user_id, account_type, name, is_active, created_at, updated_at
		FROM accounts
		WHERE user_id = ? AND account_type = 'primary' AND is_active = 1
		LIMIT 1
	`
	account := &model.Account{}
	err := s.db.QueryRowContext(ctx, query, userID).Scan(
		&account.ID,
		&account.UserID,
		&account.AccountType,
		&account.Name,
		&account.IsActive,
		&account.CreatedAt,
		&account.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("primary account not found for user")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get primary account: %w", err)
	}
	return account, nil
}

func (s *Store) UpdateAccount(ctx context.Context, account *model.Account) error {
	query := `
		UPDATE accounts
		SET account_type = ?, name = ?, is_active = ?, updated_at = ?
		WHERE id = ?
	`
	_, err := s.db.ExecContext(ctx, query,
		account.AccountType,
		account.Name,
		account.IsActive,
		time.Now(),
		account.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update account: %w", err)
	}
	return nil
}

func (s *Store) DeleteAccount(ctx context.Context, id int) error {
	query := `DELETE FROM accounts WHERE id = ?`
	_, err := s.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete account: %w", err)
	}
	return nil
}

// Spending limit operations

func (s *Store) CreateSpendingLimit(ctx context.Context, limit *model.SpendingLimit) error {
	query := `
		INSERT INTO spending_limits (
			user_id, daily_limit, weekly_limit, monthly_limit,
			daily_spent, weekly_spent, monthly_spent,
			daily_reset_at, weekly_reset_at, monthly_reset_at,
			is_daily_blocked, is_weekly_blocked, is_monthly_blocked,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	result, err := s.db.ExecContext(ctx, query,
		limit.UserID,
		limit.DailyLimit,
		limit.WeeklyLimit,
		limit.MonthlyLimit,
		limit.DailySpent,
		limit.WeeklySpent,
		limit.MonthlySpent,
		time.Now(),
		time.Now(),
		time.Now(),
		limit.IsDailyBlocked,
		limit.IsWeeklyBlocked,
		limit.IsMonthlyBlocked,
		time.Now(),
		time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to create spending limit: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get spending limit ID: %w", err)
	}
	limit.ID = int(id)
	return nil
}

func (s *Store) GetSpendingLimitByUserID(ctx context.Context, userID int) (*model.SpendingLimit, error) {
	query := `
		SELECT id, user_id, daily_limit, weekly_limit, monthly_limit,
			daily_spent, weekly_spent, monthly_spent,
			daily_reset_at, weekly_reset_at, monthly_reset_at,
			is_daily_blocked, is_weekly_blocked, is_monthly_blocked,
			created_at, updated_at
		FROM spending_limits
		WHERE user_id = ?
	`
	limit := &model.SpendingLimit{}
	err := s.db.QueryRowContext(ctx, query, userID).Scan(
		&limit.ID,
		&limit.UserID,
		&limit.DailyLimit,
		&limit.WeeklyLimit,
		&limit.MonthlyLimit,
		&limit.DailySpent,
		&limit.WeeklySpent,
		&limit.MonthlySpent,
		&limit.DailyResetAt,
		&limit.WeeklyResetAt,
		&limit.MonthlyResetAt,
		&limit.IsDailyBlocked,
		&limit.IsWeeklyBlocked,
		&limit.IsMonthlyBlocked,
		&limit.CreatedAt,
		&limit.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("spending limit not found for user")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get spending limit: %w", err)
	}
	return limit, nil
}

func (s *Store) UpdateSpendingLimit(ctx context.Context, limit *model.SpendingLimit) error {
	query := `
		UPDATE spending_limits
		SET daily_limit = ?, weekly_limit = ?, monthly_limit = ?,
			daily_spent = ?, weekly_spent = ?, monthly_spent = ?,
			daily_reset_at = ?, weekly_reset_at = ?, monthly_reset_at = ?,
			is_daily_blocked = ?, is_weekly_blocked = ?, is_monthly_blocked = ?,
			updated_at = ?
		WHERE id = ?
	`
	_, err := s.db.ExecContext(ctx, query,
		limit.DailyLimit,
		limit.WeeklyLimit,
		limit.MonthlyLimit,
		limit.DailySpent,
		limit.WeeklySpent,
		limit.MonthlySpent,
		limit.DailyResetAt,
		limit.WeeklyResetAt,
		limit.MonthlyResetAt,
		limit.IsDailyBlocked,
		limit.IsWeeklyBlocked,
		limit.IsMonthlyBlocked,
		time.Now(),
		limit.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update spending limit: %w", err)
	}
	return nil
}

func (s *Store) CheckSpendingLimit(ctx context.Context, userID int, amount decimal.Decimal) (*model.SpendingCheckResult, error) {
	limit, err := s.GetSpendingLimitByUserID(ctx, userID)
	if err != nil {
		// If no limit exists, allow the transaction
		return &model.SpendingCheckResult{
			Allowed: true,
			Amount:  amount,
			Message: "No spending limits set",
		}, nil
	}

	result := &model.SpendingCheckResult{
		Allowed: true,
		Amount:  amount,
	}

	now := time.Now()

	// Check if any limits need reset
	if limit.DailyLimit != nil && now.After(limit.DailyResetAt.Add(24*time.Hour)) {
		limit.DailySpent = decimal.Zero
		limit.DailyResetAt = time.Now().Truncate(24 * time.Hour)
		limit.IsDailyBlocked = false
	}
	if limit.WeeklyLimit != nil && now.After(limit.WeeklyResetAt.Add(7*24*time.Hour)) {
		limit.WeeklySpent = decimal.Zero
		limit.WeeklyResetAt = time.Now()
		limit.IsWeeklyBlocked = false
	}
	if limit.MonthlyLimit != nil && now.After(limit.MonthlyResetAt.AddDate(0, 1, 0)) {
		limit.MonthlySpent = decimal.Zero
		limit.MonthlyResetAt = time.Now()
		limit.IsMonthlyBlocked = false
	}

	// Check daily limit
	if limit.DailyLimit != nil {
		newDailySpent := limit.DailySpent.Add(amount)
		remaining := limit.DailyLimit.Sub(limit.DailySpent)
		result.DailyRemaining = &remaining

		if limit.IsDailyBlocked {
			result.Allowed = false
			limitType := "daily"
			result.LimitType = &limitType
			result.Message = "Daily spending limit reached"
			return result, nil
		}

		if newDailySpent.GreaterThan(*limit.DailyLimit) {
			result.Allowed = false
			limitType := "daily"
			result.LimitType = &limitType
			result.SuggestedAmount = &remaining
			result.Message = fmt.Sprintf("Transaction would exceed daily limit. Maximum allowed: %s", remaining.String())
			return result, nil
		}
	}

	// Check weekly limit
	if limit.WeeklyLimit != nil {
		newWeeklySpent := limit.WeeklySpent.Add(amount)
		remaining := limit.WeeklyLimit.Sub(limit.WeeklySpent)
		result.WeeklyRemaining = &remaining

		if limit.IsWeeklyBlocked {
			result.Allowed = false
			limitType := "weekly"
			result.LimitType = &limitType
			result.Message = "Weekly spending limit reached"
			return result, nil
		}

		if newWeeklySpent.GreaterThan(*limit.WeeklyLimit) {
			result.Allowed = false
			limitType := "weekly"
			result.LimitType = &limitType
			result.SuggestedAmount = &remaining
			result.Message = fmt.Sprintf("Transaction would exceed weekly limit. Maximum allowed: %s", remaining.String())
			return result, nil
		}
	}

	// Check monthly limit
	if limit.MonthlyLimit != nil {
		newMonthlySpent := limit.MonthlySpent.Add(amount)
		remaining := limit.MonthlyLimit.Sub(limit.MonthlySpent)
		result.MonthlyRemaining = &remaining

		if limit.IsMonthlyBlocked {
			result.Allowed = false
			limitType := "monthly"
			result.LimitType = &limitType
			result.Message = "Monthly spending limit reached"
			return result, nil
		}

		if newMonthlySpent.GreaterThan(*limit.MonthlyLimit) {
			result.Allowed = false
			limitType := "monthly"
			result.LimitType = &limitType
			result.SuggestedAmount = &remaining
			result.Message = fmt.Sprintf("Transaction would exceed monthly limit. Maximum allowed: %s", remaining.String())
			return result, nil
		}
	}

	result.Message = "Transaction approved"
	return result, nil
}

func (s *Store) RecordSpending(ctx context.Context, userID int, amount decimal.Decimal) error {
	limit, err := s.GetSpendingLimitByUserID(ctx, userID)
	if err != nil {
		// No limit exists, nothing to record
		return nil
	}

	// Update spent amounts
	limit.DailySpent = limit.DailySpent.Add(amount)
	limit.WeeklySpent = limit.WeeklySpent.Add(amount)
	limit.MonthlySpent = limit.MonthlySpent.Add(amount)

	// Check if limits are now reached and block if necessary
	if limit.DailyLimit != nil && limit.DailySpent.GreaterThanOrEqual(*limit.DailyLimit) {
		limit.IsDailyBlocked = true
	}
	if limit.WeeklyLimit != nil && limit.WeeklySpent.GreaterThanOrEqual(*limit.WeeklyLimit) {
		limit.IsWeeklyBlocked = true
	}
	if limit.MonthlyLimit != nil && limit.MonthlySpent.GreaterThanOrEqual(*limit.MonthlyLimit) {
		limit.IsMonthlyBlocked = true
	}

	return s.UpdateSpendingLimit(ctx, limit)
}

func (s *Store) ResetSpendingLimits(ctx context.Context) error {
	query := `
		UPDATE spending_limits
		SET
			daily_spent = 0,
			daily_reset_at = ?,
			is_daily_blocked = 0,
			weekly_spent = CASE
				WHEN julianday('now') - julianday(weekly_reset_at) >= 7 THEN 0
				ELSE weekly_spent
			END,
			weekly_reset_at = CASE
				WHEN julianday('now') - julianday(weekly_reset_at) >= 7 THEN ?
				ELSE weekly_reset_at
			END,
			is_weekly_blocked = CASE
				WHEN julianday('now') - julianday(weekly_reset_at) >= 7 THEN 0
				ELSE is_weekly_blocked
			END,
			monthly_spent = CASE
				WHEN julianday('now') - julianday(monthly_reset_at) >= 30 THEN 0
				ELSE monthly_spent
			END,
			monthly_reset_at = CASE
				WHEN julianday('now') - julianday(monthly_reset_at) >= 30 THEN ?
				ELSE monthly_reset_at
			END,
			is_monthly_blocked = CASE
				WHEN julianday('now') - julianday(monthly_reset_at) >= 30 THEN 0
				ELSE is_monthly_blocked
			END,
			updated_at = ?
		WHERE julianday('now') - julianday(daily_reset_at) >= 1
	`
	now := time.Now()
	_, err := s.db.ExecContext(ctx, query, now, now, now, now)
	if err != nil {
		return fmt.Errorf("failed to reset spending limits: %w", err)
	}
	return nil
}

// Transfer request operations

func (s *Store) CreateTransferRequest(ctx context.Context, transfer *model.TransferRequest) error {
	query := `
		INSERT INTO transfer_requests (
			from_user_id, to_user_id, amount, description, status,
			requested_at, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`
	now := time.Now()
	result, err := s.db.ExecContext(ctx, query,
		transfer.FromUserID,
		transfer.ToUserID,
		transfer.Amount,
		transfer.Description,
		transfer.Status,
		now,
		now,
		now,
	)
	if err != nil {
		return fmt.Errorf("failed to create transfer request: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get transfer request ID: %w", err)
	}
	transfer.ID = int(id)
	transfer.RequestedAt = now
	return nil
}

func (s *Store) GetTransferRequestByID(ctx context.Context, id int) (*model.TransferRequest, error) {
	query := `
		SELECT id, from_user_id, to_user_id, amount, description, status,
			requested_at, approved_at, approved_by, rejection_reason,
			created_at, updated_at
		FROM transfer_requests
		WHERE id = ?
	`
	transfer := &model.TransferRequest{}
	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&transfer.ID,
		&transfer.FromUserID,
		&transfer.ToUserID,
		&transfer.Amount,
		&transfer.Description,
		&transfer.Status,
		&transfer.RequestedAt,
		&transfer.ApprovedAt,
		&transfer.ApprovedBy,
		&transfer.RejectionReason,
		&transfer.CreatedAt,
		&transfer.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("transfer request not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get transfer request: %w", err)
	}
	return transfer, nil
}

func (s *Store) GetTransferRequestsByUser(ctx context.Context, userID int) ([]*model.TransferRequest, error) {
	query := `
		SELECT id, from_user_id, to_user_id, amount, description, status,
			requested_at, approved_at, approved_by, rejection_reason,
			created_at, updated_at
		FROM transfer_requests
		WHERE from_user_id = ? OR to_user_id = ?
		ORDER BY created_at DESC
	`
	rows, err := s.db.QueryContext(ctx, query, userID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get transfer requests: %w", err)
	}
	defer rows.Close()

	var transfers []*model.TransferRequest
	for rows.Next() {
		transfer := &model.TransferRequest{}
		err := rows.Scan(
			&transfer.ID,
			&transfer.FromUserID,
			&transfer.ToUserID,
			&transfer.Amount,
			&transfer.Description,
			&transfer.Status,
			&transfer.RequestedAt,
			&transfer.ApprovedAt,
			&transfer.ApprovedBy,
			&transfer.RejectionReason,
			&transfer.CreatedAt,
			&transfer.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan transfer request: %w", err)
		}
		transfers = append(transfers, transfer)
	}
	return transfers, nil
}

func (s *Store) GetPendingTransferRequests(ctx context.Context, householdID int) ([]*model.TransferRequest, error) {
	query := `
		SELECT tr.id, tr.from_user_id, tr.to_user_id, tr.amount, tr.description, tr.status,
			tr.requested_at, tr.approved_at, tr.approved_by, tr.rejection_reason,
			tr.created_at, tr.updated_at
		FROM transfer_requests tr
		JOIN users u ON u.id = tr.from_user_id
		WHERE u.household_id = ? AND tr.status = 'pending'
		ORDER BY tr.created_at ASC
	`
	rows, err := s.db.QueryContext(ctx, query, householdID)
	if err != nil {
		return nil, fmt.Errorf("failed to get pending transfer requests: %w", err)
	}
	defer rows.Close()

	var transfers []*model.TransferRequest
	for rows.Next() {
		transfer := &model.TransferRequest{}
		err := rows.Scan(
			&transfer.ID,
			&transfer.FromUserID,
			&transfer.ToUserID,
			&transfer.Amount,
			&transfer.Description,
			&transfer.Status,
			&transfer.RequestedAt,
			&transfer.ApprovedAt,
			&transfer.ApprovedBy,
			&transfer.RejectionReason,
			&transfer.CreatedAt,
			&transfer.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan transfer request: %w", err)
		}
		transfers = append(transfers, transfer)
	}
	return transfers, nil
}

func (s *Store) UpdateTransferRequest(ctx context.Context, transfer *model.TransferRequest) error {
	query := `
		UPDATE transfer_requests
		SET status = ?, approved_at = ?, approved_by = ?, rejection_reason = ?, updated_at = ?
		WHERE id = ?
	`
	_, err := s.db.ExecContext(ctx, query,
		transfer.Status,
		transfer.ApprovedAt,
		transfer.ApprovedBy,
		transfer.RejectionReason,
		time.Now(),
		transfer.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update transfer request: %w", err)
	}
	return nil
}

func (s *Store) ApproveTransferRequest(ctx context.Context, transferID int, approvedBy int) error {
	now := time.Now()
	query := `
		UPDATE transfer_requests
		SET status = 'approved', approved_at = ?, approved_by = ?, updated_at = ?
		WHERE id = ?
	`
	_, err := s.db.ExecContext(ctx, query, now, approvedBy, now, transferID)
	if err != nil {
		return fmt.Errorf("failed to approve transfer request: %w", err)
	}
	return nil
}

func (s *Store) RejectTransferRequest(ctx context.Context, transferID int, approvedBy int, reason string) error {
	now := time.Now()
	query := `
		UPDATE transfer_requests
		SET status = 'rejected', approved_at = ?, approved_by = ?, rejection_reason = ?, updated_at = ?
		WHERE id = ?
	`
	_, err := s.db.ExecContext(ctx, query, now, approvedBy, reason, now, transferID)
	if err != nil {
		return fmt.Errorf("failed to reject transfer request: %w", err)
	}
	return nil
}

// Enhanced ledger operations

func (s *Store) CreateLedgerEntryWithBalance(ctx context.Context, entry *model.LedgerEntry) error {
	// Get current balance for user
	currentBalance, err := s.GetUserBalance(ctx, entry.UserID)
	if err != nil {
		currentBalance = decimal.Zero
	}

	// Calculate new running balance
	entry.RunningBalance = currentBalance.Add(entry.Amount)

	query := `
		INSERT INTO ledger (
			user_id, type, amount, description,
			chore_assignment_id, redemption_id, transfer_request_id,
			running_balance, created_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	result, err := s.db.ExecContext(ctx, query,
		entry.UserID,
		entry.Type,
		entry.Amount,
		entry.Description,
		entry.ChoreAssignmentID,
		entry.RedemptionID,
		entry.TransferRequestID,
		entry.RunningBalance,
		time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to create ledger entry: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get ledger entry ID: %w", err)
	}
	entry.ID = int(id)
	return nil
}

// Interest operations

func (s *Store) GetUsersEligibleForInterest(ctx context.Context) ([]*model.User, error) {
	query := `
		SELECT id, household_id, name, email, password_hash, role,
			notification_pref_email, notification_pref_push,
			interest_rate_annual, last_interest_date,
			created_at, updated_at
		FROM users
		WHERE interest_rate_annual > 0
			AND (last_interest_date IS NULL OR julianday('now') - julianday(last_interest_date) >= 30)
	`
	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get users eligible for interest: %w", err)
	}
	defer rows.Close()

	var users []*model.User
	for rows.Next() {
		user := &model.User{}
		err := rows.Scan(
			&user.ID,
			&user.HouseholdID,
			&user.Name,
			&user.Email,
			&user.PasswordHash,
			&user.Role,
			&user.NotificationPrefEmail,
			&user.NotificationPrefPush,
			&user.InterestRateAnnual,
			&user.LastInterestDate,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}
	return users, nil
}

func (s *Store) UpdateUserInterestDate(ctx context.Context, userID int, date time.Time) error {
	query := `UPDATE users SET last_interest_date = ?, updated_at = ? WHERE id = ?`
	_, err := s.db.ExecContext(ctx, query, date, time.Now(), userID)
	if err != nil {
		return fmt.Errorf("failed to update user interest date: %w", err)
	}
	return nil
}
