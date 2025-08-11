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
	LedgerTypeEarn   LedgerType = "earn"
	LedgerTypeSpend  LedgerType = "spend"
	LedgerTypeAdjust LedgerType = "adjust"
)

type RedemptionStatus string

const (
	RedemptionStatusPending  RedemptionStatus = "pending"
	RedemptionStatusApproved RedemptionStatus = "approved"
	RedemptionStatusRejected RedemptionStatus = "rejected"
)

type Household struct {
	ID         int       `json:"id" db:"id"`
	Name       string    `json:"name" db:"name"`
	InviteCode *string   `json:"invite_code,omitempty" db:"invite_code"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type User struct {
	ID                     int       `json:"id" db:"id"`
	HouseholdID           int       `json:"household_id" db:"household_id"`
	Name                  string    `json:"name" db:"name"`
	Email                 string    `json:"email" db:"email"`
	PasswordHash          string    `json:"-" db:"password_hash"`
	Role                  Role      `json:"role" db:"role"`
	NotificationPrefEmail bool      `json:"notification_pref_email" db:"notification_pref_email"`
	NotificationPrefPush  bool      `json:"notification_pref_push" db:"notification_pref_push"`
	CreatedAt             time.Time `json:"created_at" db:"created_at"`
	UpdatedAt             time.Time `json:"updated_at" db:"updated_at"`
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

	// Joined fields
	User       *User       `json:"user,omitempty"`
	Assignment *Assignment `json:"assignment,omitempty"`
	Redemption *Redemption `json:"redemption,omitempty"`
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

type UserBalance struct {
	UserID  int             `json:"user_id"`
	Balance decimal.Decimal `json:"balance"`
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