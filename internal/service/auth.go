package service

import (
	"context"
	"fmt"
	"time"

	"github.com/choreme/choreme/internal/auth"
	"github.com/choreme/choreme/internal/model"
	"github.com/choreme/choreme/internal/store"
)

type AuthService struct {
	store store.Store
	audit *AuditService
}

func NewAuthService(store store.Store, audit *AuditService) *AuthService {
	return &AuthService{
		store: store,
		audit: audit,
	}
}

func (s *AuthService) Register(ctx context.Context, req *model.RegisterRequest, isFirstUser bool) (*model.User, error) {
	// Check if email already exists
	existingUser, err := s.store.GetUserByEmail(ctx, req.Email)
	if err == nil && existingUser != nil {
		return nil, fmt.Errorf("email already registered")
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create household
	household := &model.Household{
		Name:      req.HouseholdName,
		CreatedAt: time.Now(),
	}

	if err := s.store.CreateHousehold(ctx, household); err != nil {
		return nil, fmt.Errorf("failed to create household: %w", err)
	}

	// Determine role
	role := model.RoleAdmin
	if isFirstUser {
		role = model.RoleSystemAdmin
	}

	// Create user
	user := &model.User{
		HouseholdID:           household.ID,
		Name:                  req.Name,
		Email:                 req.Email,
		PasswordHash:          hashedPassword,
		Role:                  role,
		NotificationPrefEmail: true,
		NotificationPrefPush:  true,
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
	}

	if err := s.store.CreateUser(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Audit log
	s.audit.LogAction(ctx, household.ID, user.ID, "user_registered", map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
	})

	return user, nil
}

func (s *AuthService) Login(ctx context.Context, req *model.LoginRequest) (*model.User, error) {
	user, err := s.store.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	if err := auth.VerifyPassword(user.PasswordHash, req.Password); err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	// Audit log
	s.audit.LogAction(ctx, user.HouseholdID, user.ID, "user_login", map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
	})

	return user, nil
}

func (s *AuthService) JoinHousehold(ctx context.Context, req *model.JoinHouseholdRequest) (*model.User, error) {
	// Find household by invite code
	household, err := s.store.GetHouseholdByInviteCode(ctx, req.InviteCode)
	if err != nil {
		return nil, fmt.Errorf("invalid invite code")
	}

	// Check if email already exists
	existingUser, err := s.store.GetUserByEmail(ctx, req.Email)
	if err == nil && existingUser != nil {
		return nil, fmt.Errorf("email already registered")
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := &model.User{
		HouseholdID:           household.ID,
		Name:                  req.Name,
		Email:                 req.Email,
		PasswordHash:          hashedPassword,
		Role:                  model.RoleWorker, // Default role for joined users
		NotificationPrefEmail: true,
		NotificationPrefPush:  true,
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
	}

	if err := s.store.CreateUser(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Audit log
	s.audit.LogAction(ctx, household.ID, user.ID, "user_joined_household", map[string]interface{}{
		"user_id":      user.ID,
		"email":        user.Email,
		"invite_code":  req.InviteCode,
	})

	return user, nil
}

func (s *AuthService) IsFirstUser(ctx context.Context) (bool, error) {
	// This is a simplified check - in a real implementation you might want to check
	// if any system admin exists
	users, err := s.store.GetUsersByHousehold(ctx, 1) // Check first household
	if err != nil {
		// If error getting users, assume this might be the first user
		return true, nil
	}
	return len(users) == 0, nil
}