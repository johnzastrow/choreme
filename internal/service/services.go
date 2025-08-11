package service

import (
	"github.com/choreme/choreme/internal/store"
)

type Services struct {
	Auth       *AuthService
	Household  *HouseholdService
	User       *UserService
	Chore      *ChoreService
	Assignment *AssignmentService
	Reward     *RewardService
	Ledger     *LedgerService
	Audit      *AuditService
	store      store.Store
}

func New(store store.Store) *Services {
	auditService := NewAuditService(store)
	
	return &Services{
		Auth:       NewAuthService(store, auditService),
		Household:  NewHouseholdService(store, auditService),
		User:       NewUserService(store, auditService),
		Chore:      NewChoreService(store, auditService),
		Assignment: NewAssignmentService(store, auditService),
		Reward:     NewRewardService(store, auditService),
		Ledger:     NewLedgerService(store, auditService),
		Audit:      auditService,
		store:      store,
	}
}