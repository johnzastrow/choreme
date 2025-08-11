package service

import (
	"context"

	"github.com/choreme/choreme/internal/store"
)

type HouseholdService struct {
	store store.Store
	audit *AuditService
}

func NewHouseholdService(store store.Store, audit *AuditService) *HouseholdService {
	return &HouseholdService{
		store: store,
		audit: audit,
	}
}

func (s *HouseholdService) UpdateInviteCode(ctx context.Context, householdID int, inviteCode string) error {
	err := s.store.UpdateHouseholdInviteCode(ctx, householdID, inviteCode)
	if err != nil {
		return err
	}

	// This would need user context from the service call
	// For now, we'll skip audit logging here
	return nil
}