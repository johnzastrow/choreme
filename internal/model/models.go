package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type Role string

const (
	RoleSystemAdmin Role = "system_admin"
	RoleAdmin       Role = "admin"
	RoleManager     Role = "manager"
	RoleWorker      Role = "worker"
	RoleObserver    Role = "observer"
)

type Priority string

const (
	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)

type AssignmentStatus string

const (
	StatusPending    AssignmentStatus = "pending"
	StatusInProgress AssignmentStatus = "in_progress"
	StatusCompleted  AssignmentStatus = "completed"
	StatusApproved   AssignmentStatus = "approved"
	StatusRejected   AssignmentStatus = "rejected"
	StatusLate       AssignmentStatus = "late"
)

type LedgerType string

const (
	LedgerTypeEarn     LedgerType = "earn"
	LedgerTypeSpend    LedgerType = "spend"
	LedgerTypeAdjust   LedgerType = "adjust"
	LedgerTypeDeposit  LedgerType = "deposit"
	LedgerTypeWithdraw LedgerType = "withdrawal"
	LedgerTypeTransfer LedgerType = "transfer"
	LedgerTypeInterest LedgerType = "interest"
)

type RedemptionStatus string

const (
	RedemptionStatusPending  RedemptionStatus = "pending"
	RedemptionStatusApproved RedemptionStatus = "approved"
	RedemptionStatusRejected RedemptionStatus = "rejected"
)

type TransferStatus string

const (
	TransferStatusPending   TransferStatus = "pending"
	TransferStatusApproved  TransferStatus = "approved"
	TransferStatusRejected  TransferStatus = "rejected"
	TransferStatusCancelled TransferStatus = "cancelled"
)

type AccountType string

const (
	AccountTypePrimary  AccountType = "primary"
	AccountTypeSavings  AccountType = "savings"
	AccountTypeChecking AccountType = "checking"
	AccountTypeGoal     AccountType = "goal"
)

type Household struct {
	ID         int       `json:"id" db:"id"`
	Name       string    `json:"name" db:"name"`
	InviteCode *string   `json:"invite_code,omitempty" db:"invite_code"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type User struct {
	ID                     int             `json:"id" db:"id"`
	HouseholdID           int             `json:"household_id" db:"household_id"`
	Name                  string          `json:"name" db:"name"`
	Email                 string          `json:"email" db:"email"`
	PasswordHash          string          `json:"-" db:"password_hash"`
	Role                  Role            `json:"role" db:"role"`
	NotificationPrefEmail bool            `json:"notification_pref_email" db:"notification_pref_email"`
	NotificationPrefPush  bool            `json:"notification_pref_push" db:"notification_pref_push"`
	InterestRateAnnual    decimal.Decimal `json:"interest_rate_annual" db:"interest_rate_annual"`
	LastInterestDate      *time.Time      `json:"last_interest_date,omitempty" db:"last_interest_date"`
	CreatedAt             time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt             time.Time       `json:"updated_at" db:"updated_at"`
}

type Chore struct {
	ID              int             `json:"id" db:"id"`
	HouseholdID     int             `json:"household_id" db:"household_id"`
	Title           string          `json:"title" db:"title"`
	Description     *string         `json:"description,omitempty" db:"description"`
	Value           decimal.Decimal `json:"value" db:"value"`
	Frequency       *string         `json:"frequency,omitempty" db:"frequency"`
	Category        *string         `json:"category,omitempty" db:"category"`
	Priority        Priority        `json:"priority" db:"priority"`
	AutoApprove     bool            `json:"auto_approve" db:"auto_approve"`
	ProofRequired   bool            `json:"proof_required" db:"proof_required"`
	LatePenaltyPct  decimal.Decimal `json:"late_penalty_pct" db:"late_penalty_pct"`
	ExpireDays      *int            `json:"expire_days,omitempty" db:"expire_days"`
	CreatedBy       int             `json:"created_by" db:"created_by"`
	CreatedAt       time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at" db:"updated_at"`
}

type Assignment struct {
	ID              int               `json:"id" db:"id"`
	ChoreID         int               `json:"chore_id" db:"chore_id"`
	AssignedTo      int               `json:"assigned_to" db:"assigned_to"`
	DueDate         time.Time         `json:"due_date" db:"due_date"`
	PercentComplete decimal.Decimal   `json:"percent_complete" db:"percent_complete"`
	Status          AssignmentStatus  `json:"status" db:"status"`
	ProofImage      []byte            `json:"-" db:"proof_image"`
	ApprovalNotes   *string           `json:"approval_notes,omitempty" db:"approval_notes"`
	CompletedAt     *time.Time        `json:"completed_at,omitempty" db:"completed_at"`
	ApprovedAt      *time.Time        `json:"approved_at,omitempty" db:"approved_at"`
	CreatedAt       time.Time         `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time         `json:"updated_at" db:"updated_at"`

	// Joined fields
	Chore *Chore `json:"chore,omitempty"`
	User  *User  `json:"user,omitempty"`
}

type Reward struct {
	ID          int             `json:"id" db:"id"`
	HouseholdID int             `json:"household_id" db:"household_id"`
	Title       string          `json:"title" db:"title"`
	Description *string         `json:"description,omitempty" db:"description"`
	Cost        decimal.Decimal `json:"cost" db:"cost"`
	IsActive    bool            `json:"is_active" db:"is_active"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
}

type Redemption struct {
	ID         int              `json:"id" db:"id"`
	RewardID   int              `json:"reward_id" db:"reward_id"`
	UserID     int              `json:"user_id" db:"user_id"`
	Status     RedemptionStatus `json:"status" db:"status"`
	RedeemedAt time.Time        `json:"redeemed_at" db:"redeemed_at"`
	ApprovedAt *time.Time       `json:"approved_at,omitempty" db:"approved_at"`

	// Joined fields
	Reward *Reward `json:"reward,omitempty"`
	User   *User   `json:"user,omitempty"`
}

type LedgerEntry struct {
	ID                 int             `json:"id" db:"id"`
	UserID             int             `json:"user_id" db:"user_id"`
	Type               LedgerType      `json:"type" db:"type"`
	Amount             decimal.Decimal `json:"amount" db:"amount"`
	Description        *string         `json:"description,omitempty" db:"description"`
	ChoreAssignmentID  *int            `json:"chore_assignment_id,omitempty" db:"chore_assignment_id"`
	RedemptionID       *int            `json:"redemption_id,omitempty" db:"redemption_id"`
	CreatedAt          time.Time       `json:"created_at" db:"created_at"`
	RunningBalance     decimal.Decimal `json:"running_balance" db:"running_balance"`
	TransferRequestID  *int            `json:"transfer_request_id,omitempty" db:"transfer_request_id"`

	// Joined fields
	User            *User            `json:"user,omitempty"`
	Assignment      *Assignment      `json:"assignment,omitempty"`
	Redemption      *Redemption      `json:"redemption,omitempty"`
	TransferRequest *TransferRequest `json:"transfer_request,omitempty"`
}

type AuditLog struct {
	ID          int                    `json:"id" db:"id"`
	HouseholdID int                    `json:"household_id" db:"household_id"`
	UserID      int                    `json:"user_id" db:"user_id"`
	Action      string                 `json:"action" db:"action"`
	Details     map[string]interface{} `json:"details,omitempty" db:"details"`
	CreatedAt   time.Time              `json:"created_at" db:"created_at"`

	// Joined fields
	User *User `json:"user,omitempty"`
}

type Account struct {
	ID          int         `json:"id" db:"id"`
	UserID      int         `json:"user_id" db:"user_id"`
	AccountType AccountType `json:"account_type" db:"account_type"`
	Name        string      `json:"name" db:"name"`
	IsActive    bool        `json:"is_active" db:"is_active"`
	CreatedAt   time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at" db:"updated_at"`

	// Joined fields
	User *User `json:"user,omitempty"`
}

type SpendingLimit struct {
	ID             int             `json:"id" db:"id"`
	UserID         int             `json:"user_id" db:"user_id"`
	DailyLimit     *decimal.Decimal `json:"daily_limit,omitempty" db:"daily_limit"`
	WeeklyLimit    *decimal.Decimal `json:"weekly_limit,omitempty" db:"weekly_limit"`
	MonthlyLimit   *decimal.Decimal `json:"monthly_limit,omitempty" db:"monthly_limit"`
	DailySpent     decimal.Decimal `json:"daily_spent" db:"daily_spent"`
	WeeklySpent    decimal.Decimal `json:"weekly_spent" db:"weekly_spent"`
	MonthlySpent   decimal.Decimal `json:"monthly_spent" db:"monthly_spent"`
	DailyResetAt   time.Time       `json:"daily_reset_at" db:"daily_reset_at"`
	WeeklyResetAt  time.Time       `json:"weekly_reset_at" db:"weekly_reset_at"`
	MonthlyResetAt time.Time       `json:"monthly_reset_at" db:"monthly_reset_at"`
	IsDailyBlocked   bool          `json:"is_daily_blocked" db:"is_daily_blocked"`
	IsWeeklyBlocked  bool          `json:"is_weekly_blocked" db:"is_weekly_blocked"`
	IsMonthlyBlocked bool          `json:"is_monthly_blocked" db:"is_monthly_blocked"`
	CreatedAt      time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at" db:"updated_at"`

	// Joined fields
	User *User `json:"user,omitempty"`
}

type TransferRequest struct {
	ID              int             `json:"id" db:"id"`
	FromUserID      int             `json:"from_user_id" db:"from_user_id"`
	ToUserID        int             `json:"to_user_id" db:"to_user_id"`
	Amount          decimal.Decimal `json:"amount" db:"amount"`
	Description     string          `json:"description" db:"description"`
	Status          TransferStatus  `json:"status" db:"status"`
	RequestedAt     time.Time       `json:"requested_at" db:"requested_at"`
	ApprovedAt      *time.Time      `json:"approved_at,omitempty" db:"approved_at"`
	ApprovedBy      *int            `json:"approved_by,omitempty" db:"approved_by"`
	RejectionReason *string         `json:"rejection_reason,omitempty" db:"rejection_reason"`
	CreatedAt       time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at" db:"updated_at"`

	// Joined fields
	FromUser     *User `json:"from_user,omitempty"`
	ToUser       *User `json:"to_user,omitempty"`
	ApprovedByUser *User `json:"approved_by_user,omitempty"`
}

// DTOs for API requests/responses

type CreateHouseholdRequest struct {
	Name string `json:"name" binding:"required"`
}

type RegisterRequest struct {
	HouseholdName string `json:"household_name" binding:"required"`
	Name          string `json:"name" binding:"required"`
	Email         string `json:"email" binding:"required,email"`
	Password      string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type JoinHouseholdRequest struct {
	InviteCode string `json:"invite_code" binding:"required"`
	Name       string `json:"name" binding:"required"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=6"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CreateChoreRequest struct {
	Title           string   `json:"title" binding:"required"`
	Description     *string  `json:"description"`
	Value           string   `json:"value" binding:"required"`
	Frequency       *string  `json:"frequency"`
	Category        *string  `json:"category"`
	Priority        Priority `json:"priority"`
	AutoApprove     bool     `json:"auto_approve"`
	ProofRequired   bool     `json:"proof_required"`
	LatePenaltyPct  string   `json:"late_penalty_pct"`
	ExpireDays      *int     `json:"expire_days"`
	AssignedTo      []int    `json:"assigned_to" binding:"required"`
	DueDate         string   `json:"due_date" binding:"required"`
}

type UpdateProgressRequest struct {
	PercentComplete string `json:"percent_complete" binding:"required"`
}

type CompleteChoreRequest struct {
	PercentComplete string  `json:"percent_complete" binding:"required"`
	ProofImage      *string `json:"proof_image,omitempty"`
}

type ApprovalRequest struct {
	ApprovalNotes *string `json:"approval_notes"`
}

type CreateRewardRequest struct {
	Title       string  `json:"title" binding:"required"`
	Description *string `json:"description"`
	Cost        string  `json:"cost" binding:"required"`
}

type LedgerAdjustmentRequest struct {
	UserID      int     `json:"user_id" binding:"required"`
	Amount      string  `json:"amount" binding:"required"`
	Description *string `json:"description" binding:"required"`
}

type DepositRequest struct {
	UserID      int     `json:"user_id" binding:"required"`
	Amount      string  `json:"amount" binding:"required"`
	Description string  `json:"description" binding:"required"`
}

type WithdrawalRequest struct {
	Amount      string  `json:"amount" binding:"required"`
	Description string  `json:"description" binding:"required"`
}

type CreateTransferRequest struct {
	ToUserID    int     `json:"to_user_id" binding:"required"`
	Amount      string  `json:"amount" binding:"required"`
	Description string  `json:"description" binding:"required"`
}

type ApproveTransferRequest struct {
	Approved bool    `json:"approved" binding:"required"`
	RejectionReason *string `json:"rejection_reason,omitempty"`
}

type SetInterestRateRequest struct {
	UserID             int    `json:"user_id" binding:"required"`
	InterestRateAnnual string `json:"interest_rate_annual" binding:"required"`
}

type SetSpendingLimitsRequest struct {
	UserID       int     `json:"user_id" binding:"required"`
	DailyLimit   *string `json:"daily_limit,omitempty"`
	WeeklyLimit  *string `json:"weekly_limit,omitempty"`
	MonthlyLimit *string `json:"monthly_limit,omitempty"`
}

type GenerateStatementRequest struct {
	DateFrom string `json:"date_from" binding:"required"`
	DateTo   string `json:"date_to" binding:"required"`
	Format   string `json:"format" binding:"required,oneof=html pdf"`
}

type UserBalance struct {
	UserID  int             `json:"user_id"`
	Balance decimal.Decimal `json:"balance"`
}

type SpendingCheckResult struct {
	Allowed            bool            `json:"allowed"`
	Amount             decimal.Decimal `json:"amount"`
	DailyRemaining     *decimal.Decimal `json:"daily_remaining,omitempty"`
	WeeklyRemaining    *decimal.Decimal `json:"weekly_remaining,omitempty"`
	MonthlyRemaining   *decimal.Decimal `json:"monthly_remaining,omitempty"`
	LimitType          *string         `json:"limit_type,omitempty"` // "daily", "weekly", "monthly"
	SuggestedAmount    *decimal.Decimal `json:"suggested_amount,omitempty"`
	Message            string          `json:"message,omitempty"`
}

// Response helpers
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PerPage    int         `json:"per_page"`
	Total      int         `json:"total"`
	TotalPages int         `json:"total_pages"`
}

// Filter types for queries
type ChoreFilters struct {
	Status     *AssignmentStatus
	Category   *string
	Priority   *Priority
	CreatedBy  *int
	DateFrom   *time.Time
	DateTo     *time.Time
	Limit      int
	Offset     int
}

type AssignmentFilters struct {
	Status     *AssignmentStatus
	ChoreID    *int
	DueBefore  *time.Time
	DueAfter   *time.Time
	Completed  *bool
	Approved   *bool
	Limit      int
	Offset     int
}

type LedgerFilters struct {
	Type       *LedgerType
	DateFrom   *time.Time
	DateTo     *time.Time
	Limit      int
	Offset     int
}

type AuditFilters struct {
	Action     *string
	UserID     *int
	DateFrom   *time.Time
	DateTo     *time.Time
	Limit      int
	Offset     int
}