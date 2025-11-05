package service

import (
	"context"
	"fmt"
	"time"

	"github.com/choreme/choreme/internal/model"
	"github.com/choreme/choreme/internal/store"
	"github.com/shopspring/decimal"
)

type AccountService struct {
	store store.Store
	audit *AuditService
}

func NewAccountService(store store.Store, audit *AuditService) *AccountService {
	return &AccountService{
		store: store,
		audit: audit,
	}
}

// Deposit adds money to a user's account
func (s *AccountService) Deposit(ctx context.Context, userID int, amount decimal.Decimal, description string, depositedBy int) error {
	if amount.LessThanOrEqual(decimal.Zero) {
		return fmt.Errorf("deposit amount must be positive")
	}

	// Create ledger entry
	entry := &model.LedgerEntry{
		UserID:      userID,
		Type:        model.LedgerTypeDeposit,
		Amount:      amount,
		Description: &description,
	}

	err := s.store.CreateLedgerEntryWithBalance(ctx, entry)
	if err != nil {
		return fmt.Errorf("failed to create deposit: %w", err)
	}

	// Log audit
	user, _ := s.store.GetUserByID(ctx, userID)
	if user != nil {
		s.audit.Log(ctx, user.HouseholdID, depositedBy, "deposit", map[string]interface{}{
			"user_id":     userID,
			"amount":      amount.String(),
			"description": description,
		})
	}

	return nil
}

// Withdraw removes money from a user's account (with spending limit check)
func (s *AccountService) Withdraw(ctx context.Context, userID int, amount decimal.Decimal, description string) error {
	if amount.LessThanOrEqual(decimal.Zero) {
		return fmt.Errorf("withdrawal amount must be positive")
	}

	// Check spending limits
	check, err := s.store.CheckSpendingLimit(ctx, userID, amount)
	if err != nil {
		return fmt.Errorf("failed to check spending limit: %w", err)
	}

	if !check.Allowed {
		return fmt.Errorf("spending limit exceeded: %s", check.Message)
	}

	// Create ledger entry (negative amount for withdrawal)
	entry := &model.LedgerEntry{
		UserID:      userID,
		Type:        model.LedgerTypeWithdraw,
		Amount:      amount.Neg(), // Negative for withdrawal
		Description: &description,
	}

	err = s.store.CreateLedgerEntryWithBalance(ctx, entry)
	if err != nil {
		return fmt.Errorf("failed to create withdrawal: %w", err)
	}

	// Record spending for limit tracking
	err = s.store.RecordSpending(ctx, userID, amount)
	if err != nil {
		return fmt.Errorf("failed to record spending: %w", err)
	}

	// Log audit
	user, _ := s.store.GetUserByID(ctx, userID)
	if user != nil {
		s.audit.Log(ctx, user.HouseholdID, userID, "withdrawal", map[string]interface{}{
			"amount":      amount.String(),
			"description": description,
		})
	}

	return nil
}

// CreateTransfer initiates a transfer request between users
func (s *AccountService) CreateTransfer(ctx context.Context, fromUserID, toUserID int, amount decimal.Decimal, description string) (*model.TransferRequest, error) {
	if amount.LessThanOrEqual(decimal.Zero) {
		return nil, fmt.Errorf("transfer amount must be positive")
	}

	if fromUserID == toUserID {
		return nil, fmt.Errorf("cannot transfer to yourself")
	}

	// Verify both users exist and are in same household
	fromUser, err := s.store.GetUserByID(ctx, fromUserID)
	if err != nil {
		return nil, fmt.Errorf("from user not found: %w", err)
	}

	toUser, err := s.store.GetUserByID(ctx, toUserID)
	if err != nil {
		return nil, fmt.Errorf("to user not found: %w", err)
	}

	if fromUser.HouseholdID != toUser.HouseholdID {
		return nil, fmt.Errorf("can only transfer within same household")
	}

	// Check if from user has sufficient balance
	balance, err := s.store.GetUserBalance(ctx, fromUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get balance: %w", err)
	}

	if balance.LessThan(amount) {
		return nil, fmt.Errorf("insufficient balance for transfer")
	}

	// Create transfer request
	transfer := &model.TransferRequest{
		FromUserID:  fromUserID,
		ToUserID:    toUserID,
		Amount:      amount,
		Description: description,
		Status:      model.TransferStatusPending,
	}

	err = s.store.CreateTransferRequest(ctx, transfer)
	if err != nil {
		return nil, fmt.Errorf("failed to create transfer request: %w", err)
	}

	// Log audit
	s.audit.Log(ctx, fromUser.HouseholdID, fromUserID, "transfer_requested", map[string]interface{}{
		"transfer_id": transfer.ID,
		"to_user_id":  toUserID,
		"amount":      amount.String(),
		"description": description,
	})

	return transfer, nil
}

// ApproveTransfer approves a transfer and executes it
func (s *AccountService) ApproveTransfer(ctx context.Context, transferID int, approvedBy int) error {
	transfer, err := s.store.GetTransferRequestByID(ctx, transferID)
	if err != nil {
		return fmt.Errorf("transfer not found: %w", err)
	}

	if transfer.Status != model.TransferStatusPending {
		return fmt.Errorf("transfer is not pending")
	}

	// Check if approver has permission (admin or manager)
	approver, err := s.store.GetUserByID(ctx, approvedBy)
	if err != nil {
		return fmt.Errorf("approver not found: %w", err)
	}

	if approver.Role != model.RoleSystemAdmin && approver.Role != model.RoleAdmin && approver.Role != model.RoleManager {
		return fmt.Errorf("insufficient permissions to approve transfers")
	}

	// Verify from user still has sufficient balance
	balance, err := s.store.GetUserBalance(ctx, transfer.FromUserID)
	if err != nil {
		return fmt.Errorf("failed to get balance: %w", err)
	}

	if balance.LessThan(transfer.Amount) {
		return fmt.Errorf("insufficient balance for transfer")
	}

	// Execute transfer by creating two ledger entries
	desc := fmt.Sprintf("Transfer to user %d: %s", transfer.ToUserID, transfer.Description)
	fromEntry := &model.LedgerEntry{
		UserID:            transfer.FromUserID,
		Type:              model.LedgerTypeTransfer,
		Amount:            transfer.Amount.Neg(),
		Description:       &desc,
		TransferRequestID: &transfer.ID,
	}

	err = s.store.CreateLedgerEntryWithBalance(ctx, fromEntry)
	if err != nil {
		return fmt.Errorf("failed to debit sender: %w", err)
	}

	desc = fmt.Sprintf("Transfer from user %d: %s", transfer.FromUserID, transfer.Description)
	toEntry := &model.LedgerEntry{
		UserID:            transfer.ToUserID,
		Type:              model.LedgerTypeTransfer,
		Amount:            transfer.Amount,
		Description:       &desc,
		TransferRequestID: &transfer.ID,
	}

	err = s.store.CreateLedgerEntryWithBalance(ctx, toEntry)
	if err != nil {
		return fmt.Errorf("failed to credit receiver: %w", err)
	}

	// Mark transfer as approved
	err = s.store.ApproveTransferRequest(ctx, transferID, approvedBy)
	if err != nil {
		return fmt.Errorf("failed to approve transfer: %w", err)
	}

	// Log audit
	s.audit.Log(ctx, approver.HouseholdID, approvedBy, "transfer_approved", map[string]interface{}{
		"transfer_id":  transferID,
		"from_user_id": transfer.FromUserID,
		"to_user_id":   transfer.ToUserID,
		"amount":       transfer.Amount.String(),
	})

	return nil
}

// RejectTransfer rejects a transfer request
func (s *AccountService) RejectTransfer(ctx context.Context, transferID int, rejectedBy int, reason string) error {
	transfer, err := s.store.GetTransferRequestByID(ctx, transferID)
	if err != nil {
		return fmt.Errorf("transfer not found: %w", err)
	}

	if transfer.Status != model.TransferStatusPending {
		return fmt.Errorf("transfer is not pending")
	}

	// Check if rejecter has permission
	rejecter, err := s.store.GetUserByID(ctx, rejectedBy)
	if err != nil {
		return fmt.Errorf("rejecter not found: %w", err)
	}

	if rejecter.Role != model.RoleSystemAdmin && rejecter.Role != model.RoleAdmin && rejecter.Role != model.RoleManager {
		return fmt.Errorf("insufficient permissions to reject transfers")
	}

	// Reject transfer
	err = s.store.RejectTransferRequest(ctx, transferID, rejectedBy, reason)
	if err != nil {
		return fmt.Errorf("failed to reject transfer: %w", err)
	}

	// Log audit
	s.audit.Log(ctx, rejecter.HouseholdID, rejectedBy, "transfer_rejected", map[string]interface{}{
		"transfer_id": transferID,
		"reason":      reason,
	})

	return nil
}

// SetSpendingLimits sets spending limits for a user
func (s *AccountService) SetSpendingLimits(ctx context.Context, userID int, daily, weekly, monthly *decimal.Decimal, setBy int) error {
	// Get or create spending limit
	limit, err := s.store.GetSpendingLimitByUserID(ctx, userID)
	if err != nil {
		// Create new if doesn't exist
		limit = &model.SpendingLimit{
			UserID:      userID,
			DailyLimit:  daily,
			WeeklyLimit: weekly,
			MonthlyLimit: monthly,
		}
		err = s.store.CreateSpendingLimit(ctx, limit)
	} else {
		// Update existing
		if daily != nil {
			limit.DailyLimit = daily
		}
		if weekly != nil {
			limit.WeeklyLimit = weekly
		}
		if monthly != nil {
			limit.MonthlyLimit = monthly
		}
		err = s.store.UpdateSpendingLimit(ctx, limit)
	}

	if err != nil {
		return fmt.Errorf("failed to set spending limits: %w", err)
	}

	// Log audit
	user, _ := s.store.GetUserByID(ctx, userID)
	if user != nil {
		s.audit.Log(ctx, user.HouseholdID, setBy, "spending_limits_set", map[string]interface{}{
			"user_id":       userID,
			"daily_limit":   daily,
			"weekly_limit":  weekly,
			"monthly_limit": monthly,
		})
	}

	return nil
}

// ResetUserSpendingLimits manually resets spending limits for a user
func (s *AccountService) ResetUserSpendingLimits(ctx context.Context, userID int, resetBy int) error {
	limit, err := s.store.GetSpendingLimitByUserID(ctx, userID)
	if err != nil {
		return fmt.Errorf("spending limit not found: %w", err)
	}

	limit.DailySpent = decimal.Zero
	limit.WeeklySpent = decimal.Zero
	limit.MonthlySpent = decimal.Zero
	limit.IsDailyBlocked = false
	limit.IsWeeklyBlocked = false
	limit.IsMonthlyBlocked = false
	limit.DailyResetAt = time.Now()
	limit.WeeklyResetAt = time.Now()
	limit.MonthlyResetAt = time.Now()

	err = s.store.UpdateSpendingLimit(ctx, limit)
	if err != nil {
		return fmt.Errorf("failed to reset spending limits: %w", err)
	}

	// Log audit
	user, _ := s.store.GetUserByID(ctx, userID)
	if user != nil {
		s.audit.Log(ctx, user.HouseholdID, resetBy, "spending_limits_reset", map[string]interface{}{
			"user_id": userID,
		})
	}

	return nil
}

// SetInterestRate sets the annual interest rate for a user
func (s *AccountService) SetInterestRate(ctx context.Context, userID int, annualRate decimal.Decimal, setBy int) error {
	if annualRate.LessThan(decimal.Zero) || annualRate.GreaterThan(decimal.NewFromInt(100)) {
		return fmt.Errorf("interest rate must be between 0 and 100")
	}

	user, err := s.store.GetUserByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	user.InterestRateAnnual = annualRate

	err = s.store.UpdateUser(ctx, user)
	if err != nil {
		return fmt.Errorf("failed to set interest rate: %w", err)
	}

	// Log audit
	s.audit.Log(ctx, user.HouseholdID, setBy, "interest_rate_set", map[string]interface{}{
		"user_id":      userID,
		"annual_rate":  annualRate.String(),
	})

	return nil
}

// AccrueInterest calculates and applies monthly interest for all eligible users
func (s *AccountService) AccrueInterest(ctx context.Context) error {
	users, err := s.store.GetUsersEligibleForInterest(ctx)
	if err != nil {
		return fmt.Errorf("failed to get eligible users: %w", err)
	}

	for _, user := range users {
		// Get current balance
		balance, err := s.store.GetUserBalance(ctx, user.ID)
		if err != nil {
			continue
		}

		if balance.LessThanOrEqual(decimal.Zero) {
			// Skip if balance is zero or negative
			continue
		}

		// Calculate monthly interest (annual rate / 12)
		monthlyRate := user.InterestRateAnnual.Div(decimal.NewFromInt(12)).Div(decimal.NewFromInt(100))
		interest := balance.Mul(monthlyRate).Round(2)

		if interest.GreaterThan(decimal.Zero) {
			// Create ledger entry for interest
			desc := fmt.Sprintf("Monthly interest (%s%% annual)", user.InterestRateAnnual.String())
			entry := &model.LedgerEntry{
				UserID:      user.ID,
				Type:        model.LedgerTypeInterest,
				Amount:      interest,
				Description: &desc,
			}

			err = s.store.CreateLedgerEntryWithBalance(ctx, entry)
			if err != nil {
				// Log error but continue with other users
				continue
			}

			// Update last interest date
			err = s.store.UpdateUserInterestDate(ctx, user.ID, time.Now())
			if err != nil {
				continue
			}

			// Log audit
			s.audit.Log(ctx, user.HouseholdID, user.ID, "interest_accrued", map[string]interface{}{
				"user_id":      user.ID,
				"balance":      balance.String(),
				"interest":     interest.String(),
				"annual_rate":  user.InterestRateAnnual.String(),
			})
		}
	}

	return nil
}

// CheckSpendingLimit checks if a transaction is allowed under spending limits
func (s *AccountService) CheckSpendingLimit(ctx context.Context, userID int, amount decimal.Decimal) (*model.SpendingCheckResult, error) {
	return s.store.CheckSpendingLimit(ctx, userID, amount)
}
