package service

import (
	"context"

	"github.com/choreme/choreme/internal/model"
	"github.com/choreme/choreme/internal/store"
)

type RewardService struct {
	store store.Store
	audit *AuditService
}

func NewRewardService(store store.Store, audit *AuditService) *RewardService {
	return &RewardService{
		store: store,
		audit: audit,
	}
}

// Placeholder implementations - to be completed
func (s *RewardService) CreateReward(ctx context.Context, reward *model.Reward) error {
	return nil // TODO: Implement
}

func (s *RewardService) GetRewardByID(ctx context.Context, id int) (*model.Reward, error) {
	return nil, nil // TODO: Implement
}

func (s *RewardService) GetRewardsByHousehold(ctx context.Context, householdID int) ([]*model.Reward, error) {
	return nil, nil // TODO: Implement
}

func (s *RewardService) UpdateReward(ctx context.Context, reward *model.Reward) error {
	return nil // TODO: Implement
}

func (s *RewardService) DeleteReward(ctx context.Context, id int) error {
	return nil // TODO: Implement
}

func (s *RewardService) RedeemReward(ctx context.Context, rewardID, userID int) error {
	return nil // TODO: Implement
}