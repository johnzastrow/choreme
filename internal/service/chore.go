package service

import (
	"context"

	"github.com/choreme/choreme/internal/model"
	"github.com/choreme/choreme/internal/store"
)

type ChoreService struct {
	store store.Store
	audit *AuditService
}

func NewChoreService(store store.Store, audit *AuditService) *ChoreService {
	return &ChoreService{
		store: store,
		audit: audit,
	}
}

// Placeholder implementations - to be completed
func (s *ChoreService) CreateChore(ctx context.Context, chore *model.Chore) error {
	return nil // TODO: Implement
}

func (s *ChoreService) GetChoreByID(ctx context.Context, id int) (*model.Chore, error) {
	return nil, nil // TODO: Implement
}

func (s *ChoreService) GetChoresByHousehold(ctx context.Context, householdID int, filters model.ChoreFilters) ([]*model.Chore, error) {
	return nil, nil // TODO: Implement
}

func (s *ChoreService) UpdateChore(ctx context.Context, chore *model.Chore) error {
	return nil // TODO: Implement
}

func (s *ChoreService) DeleteChore(ctx context.Context, id int) error {
	return nil // TODO: Implement
}