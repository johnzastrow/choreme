package service

import (
	"context"

	"github.com/choreme/choreme/internal/model"
	"github.com/choreme/choreme/internal/store"
)

type UserService struct {
	store store.Store
	audit *AuditService
}

func NewUserService(store store.Store, audit *AuditService) *UserService {
	return &UserService{
		store: store,
		audit: audit,
	}
}

func (s *UserService) GetUserByID(ctx context.Context, id int) (*model.User, error) {
	return s.store.GetUserByID(ctx, id)
}

func (s *UserService) GetUsersByHousehold(ctx context.Context, householdID int) ([]*model.User, error) {
	return s.store.GetUsersByHousehold(ctx, householdID)
}

func (s *UserService) UpdateUser(ctx context.Context, user *model.User) error {
	err := s.store.UpdateUser(ctx, user)
	if err != nil {
		return err
	}

	// Audit log
	s.audit.LogAction(ctx, user.HouseholdID, user.ID, "user_updated", map[string]interface{}{
		"user_id": user.ID,
		"name":    user.Name,
		"email":   user.Email,
	})

	return nil
}