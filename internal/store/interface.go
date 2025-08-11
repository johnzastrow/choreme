package store

import (
	"context"

	"github.com/choreme/choreme/internal/model"
	"github.com/shopspring/decimal"
)

type Store interface {
	// Connection management
	Close() error
	Ping() error

	// Transaction support
	BeginTx(ctx context.Context) (interface{}, error)

	// Household operations
	CreateHousehold(ctx context.Context, household *model.Household) error
	GetHouseholdByID(ctx context.Context, id int) (*model.Household, error)
	GetHouseholdByInviteCode(ctx context.Context, inviteCode string) (*model.Household, error)
	UpdateHouseholdInviteCode(ctx context.Context, id int, inviteCode string) error

	// User operations
	CreateUser(ctx context.Context, user *model.User) error
	GetUserByID(ctx context.Context, id int) (*model.User, error)
	GetUserByEmail(ctx context.Context, email string) (*model.User, error)
	GetUsersByHousehold(ctx context.Context, householdID int) ([]*model.User, error)
	UpdateUser(ctx context.Context, user *model.User) error
	DeleteUser(ctx context.Context, id int) error

	// Chore operations
	CreateChore(ctx context.Context, chore *model.Chore) error
	GetChoreByID(ctx context.Context, id int) (*model.Chore, error)
	GetChoresByHousehold(ctx context.Context, householdID int, filters model.ChoreFilters) ([]*model.Chore, error)
	UpdateChore(ctx context.Context, chore *model.Chore) error
	DeleteChore(ctx context.Context, id int) error

	// Assignment operations
	CreateAssignment(ctx context.Context, assignment *model.Assignment) error
	GetAssignmentByID(ctx context.Context, id int) (*model.Assignment, error)
	GetAssignmentsByUser(ctx context.Context, userID int, filters model.AssignmentFilters) ([]*model.Assignment, error)
	GetAssignmentsByHousehold(ctx context.Context, householdID int, filters model.AssignmentFilters) ([]*model.Assignment, error)
	UpdateAssignment(ctx context.Context, assignment *model.Assignment) error
	DeleteAssignment(ctx context.Context, id int) error
	GetOverdueAssignments(ctx context.Context) ([]*model.Assignment, error)

	// Reward operations
	CreateReward(ctx context.Context, reward *model.Reward) error
	GetRewardByID(ctx context.Context, id int) (*model.Reward, error)
	GetRewardsByHousehold(ctx context.Context, householdID int) ([]*model.Reward, error)
	UpdateReward(ctx context.Context, reward *model.Reward) error
	DeleteReward(ctx context.Context, id int) error

	// Redemption operations
	CreateRedemption(ctx context.Context, redemption *model.Redemption) error
	GetRedemptionByID(ctx context.Context, id int) (*model.Redemption, error)
	GetRedemptionsByUser(ctx context.Context, userID int) ([]*model.Redemption, error)
	GetRedemptionsByHousehold(ctx context.Context, householdID int) ([]*model.Redemption, error)
	UpdateRedemption(ctx context.Context, redemption *model.Redemption) error

	// Ledger operations
	CreateLedgerEntry(ctx context.Context, entry *model.LedgerEntry) error
	GetLedgerEntriesByUser(ctx context.Context, userID int, filters model.LedgerFilters) ([]*model.LedgerEntry, error)
	GetLedgerEntriesByHousehold(ctx context.Context, householdID int, filters model.LedgerFilters) ([]*model.LedgerEntry, error)
	GetUserBalance(ctx context.Context, userID int) (decimal.Decimal, error)
	GetAllUserBalances(ctx context.Context, householdID int) ([]*model.UserBalance, error)

	// Audit log operations
	CreateAuditLog(ctx context.Context, log *model.AuditLog) error
	GetAuditLogsByHousehold(ctx context.Context, householdID int, filters model.AuditFilters) ([]*model.AuditLog, error)
	GetAuditLogsByUser(ctx context.Context, userID int, filters model.AuditFilters) ([]*model.AuditLog, error)
}

type Tx interface {
	Store
	Commit() error
	Rollback() error
}

// Common transaction interface that all implementations satisfy
type Transaction interface {
	Commit() error
	Rollback() error
}

