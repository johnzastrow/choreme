package service

import (
	"context"
	"time"

	"github.com/choreme/choreme/internal/model"
	"github.com/choreme/choreme/internal/store"
)

type AuditService struct {
	store store.Store
}

func NewAuditService(store store.Store) *AuditService {
	return &AuditService{
		store: store,
	}
}

func (s *AuditService) LogAction(ctx context.Context, householdID, userID int, action string, details map[string]interface{}) {
	auditLog := &model.AuditLog{
		HouseholdID: householdID,
		UserID:      userID,
		Action:      action,
		Details:     details,
		CreatedAt:   time.Now(),
	}

	// Log errors but don't fail the main operation if audit logging fails
	if err := s.store.CreateAuditLog(ctx, auditLog); err != nil {
		// In production, you might want to use a proper logger here
		// log.Printf("Failed to create audit log: %v", err)
	}
}

func (s *AuditService) GetAuditLogs(ctx context.Context, householdID int, filters model.AuditFilters) ([]*model.AuditLog, error) {
	return s.store.GetAuditLogsByHousehold(ctx, householdID, filters)
}

func (s *AuditService) GetUserAuditLogs(ctx context.Context, userID int, filters model.AuditFilters) ([]*model.AuditLog, error) {
	return s.store.GetAuditLogsByUser(ctx, userID, filters)
}