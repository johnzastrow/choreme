package service

import (
	"context"

	"github.com/choreme/choreme/internal/model"
	"github.com/choreme/choreme/internal/store"
	"github.com/shopspring/decimal"
)

type LedgerService struct {
	store store.Store
	audit *AuditService
}

func NewLedgerService(store store.Store, audit *AuditService) *LedgerService {
	return &LedgerService{
		store: store,
		audit: audit,
	}
}

// Placeholder implementations - to be completed
func (s *LedgerService) CreateLedgerEntry(ctx context.Context, entry *model.LedgerEntry) error {
	return nil // TODO: Implement
}

func (s *LedgerService) GetLedgerEntriesByUser(ctx context.Context, userID int, filters model.LedgerFilters) ([]*model.LedgerEntry, error) {
	return nil, nil // TODO: Implement
}

func (s *LedgerService) GetLedgerEntriesByHousehold(ctx context.Context, householdID int, filters model.LedgerFilters) ([]*model.LedgerEntry, error) {
	return nil, nil // TODO: Implement
}

func (s *LedgerService) GetUserBalance(ctx context.Context, userID int) (decimal.Decimal, error) {
	return decimal.Zero, nil // TODO: Implement
}

func (s *LedgerService) AdjustBalance(ctx context.Context, userID int, amount decimal.Decimal, description string) error {
	return nil // TODO: Implement
}