package mysql

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"github.com/choreme/choreme/internal/model"
	"github.com/shopspring/decimal"
)

type Store struct {
	db *sql.DB
}

func New(db *sql.DB) *Store {
	return &Store{db: db}
}

func (s *Store) Close() error {
	return s.db.Close()
}

func (s *Store) Ping() error {
	return s.db.Ping()
}

func (s *Store) BeginTx(ctx context.Context) (interface{}, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	return &Tx{tx: tx, store: s}, nil
}

// Household operations
func (s *Store) CreateHousehold(ctx context.Context, household *model.Household) error {
	query := `INSERT INTO households (name, invite_code, created_at) VALUES (?, ?, ?)`
	result, err := s.db.ExecContext(ctx, query, household.Name, household.InviteCode, household.CreatedAt)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	household.ID = int(id)
	return nil
}

func (s *Store) GetHouseholdByID(ctx context.Context, id int) (*model.Household, error) {
	household := &model.Household{}
	query := `SELECT id, name, invite_code, created_at FROM households WHERE id = ?`
	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&household.ID, &household.Name, &household.InviteCode, &household.CreatedAt)
	if err != nil {
		return nil, err
	}
	return household, nil
}

func (s *Store) GetHouseholdByInviteCode(ctx context.Context, inviteCode string) (*model.Household, error) {
	household := &model.Household{}
	query := `SELECT id, name, invite_code, created_at FROM households WHERE invite_code = ?`
	err := s.db.QueryRowContext(ctx, query, inviteCode).Scan(
		&household.ID, &household.Name, &household.InviteCode, &household.CreatedAt)
	if err != nil {
		return nil, err
	}
	return household, nil
}

func (s *Store) UpdateHouseholdInviteCode(ctx context.Context, id int, inviteCode string) error {
	query := `UPDATE households SET invite_code = ? WHERE id = ?`
	_, err := s.db.ExecContext(ctx, query, inviteCode, id)
	return err
}

// User operations
func (s *Store) CreateUser(ctx context.Context, user *model.User) error {
	query := `INSERT INTO users (household_id, name, email, password_hash, role, notification_pref_email, notification_pref_push, created_at, updated_at) 
			  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := s.db.ExecContext(ctx, query,
		user.HouseholdID, user.Name, user.Email, user.PasswordHash, user.Role,
		user.NotificationPrefEmail, user.NotificationPrefPush, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	user.ID = int(id)
	return nil
}

func (s *Store) GetUserByID(ctx context.Context, id int) (*model.User, error) {
	user := &model.User{}
	query := `SELECT id, household_id, name, email, password_hash, role, notification_pref_email, notification_pref_push, created_at, updated_at 
			  FROM users WHERE id = ?`
	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.HouseholdID, &user.Name, &user.Email, &user.PasswordHash, &user.Role,
		&user.NotificationPrefEmail, &user.NotificationPrefPush, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *Store) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	user := &model.User{}
	query := `SELECT id, household_id, name, email, password_hash, role, notification_pref_email, notification_pref_push, created_at, updated_at 
			  FROM users WHERE email = ?`
	err := s.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID, &user.HouseholdID, &user.Name, &user.Email, &user.PasswordHash, &user.Role,
		&user.NotificationPrefEmail, &user.NotificationPrefPush, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *Store) GetUsersByHousehold(ctx context.Context, householdID int) ([]*model.User, error) {
	query := `SELECT id, household_id, name, email, password_hash, role, notification_pref_email, notification_pref_push, created_at, updated_at 
			  FROM users WHERE household_id = ?`
	rows, err := s.db.QueryContext(ctx, query, householdID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*model.User
	for rows.Next() {
		user := &model.User{}
		err := rows.Scan(
			&user.ID, &user.HouseholdID, &user.Name, &user.Email, &user.PasswordHash, &user.Role,
			&user.NotificationPrefEmail, &user.NotificationPrefPush, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func (s *Store) UpdateUser(ctx context.Context, user *model.User) error {
	query := `UPDATE users SET name = ?, email = ?, notification_pref_email = ?, notification_pref_push = ?, updated_at = ? WHERE id = ?`
	_, err := s.db.ExecContext(ctx, query, user.Name, user.Email, user.NotificationPrefEmail, user.NotificationPrefPush, time.Now(), user.ID)
	return err
}

func (s *Store) DeleteUser(ctx context.Context, id int) error {
	query := `DELETE FROM users WHERE id = ?`
	_, err := s.db.ExecContext(ctx, query, id)
	return err
}

// Stub implementations for other methods (to be implemented)
func (s *Store) CreateChore(ctx context.Context, chore *model.Chore) error {
	return nil // TODO: Implement
}

func (s *Store) GetChoreByID(ctx context.Context, id int) (*model.Chore, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) GetChoresByHousehold(ctx context.Context, householdID int, filters model.ChoreFilters) ([]*model.Chore, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) UpdateChore(ctx context.Context, chore *model.Chore) error {
	return nil // TODO: Implement
}

func (s *Store) DeleteChore(ctx context.Context, id int) error {
	return nil // TODO: Implement
}

func (s *Store) CreateAssignment(ctx context.Context, assignment *model.Assignment) error {
	return nil // TODO: Implement
}

func (s *Store) GetAssignmentByID(ctx context.Context, id int) (*model.Assignment, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) GetAssignmentsByUser(ctx context.Context, userID int, filters model.AssignmentFilters) ([]*model.Assignment, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) GetAssignmentsByHousehold(ctx context.Context, householdID int, filters model.AssignmentFilters) ([]*model.Assignment, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) UpdateAssignment(ctx context.Context, assignment *model.Assignment) error {
	return nil // TODO: Implement
}

func (s *Store) DeleteAssignment(ctx context.Context, id int) error {
	return nil // TODO: Implement
}

func (s *Store) GetOverdueAssignments(ctx context.Context) ([]*model.Assignment, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) CreateReward(ctx context.Context, reward *model.Reward) error {
	return nil // TODO: Implement
}

func (s *Store) GetRewardByID(ctx context.Context, id int) (*model.Reward, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) GetRewardsByHousehold(ctx context.Context, householdID int) ([]*model.Reward, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) UpdateReward(ctx context.Context, reward *model.Reward) error {
	return nil // TODO: Implement
}

func (s *Store) DeleteReward(ctx context.Context, id int) error {
	return nil // TODO: Implement
}

func (s *Store) CreateRedemption(ctx context.Context, redemption *model.Redemption) error {
	return nil // TODO: Implement
}

func (s *Store) GetRedemptionByID(ctx context.Context, id int) (*model.Redemption, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) GetRedemptionsByUser(ctx context.Context, userID int) ([]*model.Redemption, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) GetRedemptionsByHousehold(ctx context.Context, householdID int) ([]*model.Redemption, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) UpdateRedemption(ctx context.Context, redemption *model.Redemption) error {
	return nil // TODO: Implement
}

func (s *Store) CreateLedgerEntry(ctx context.Context, entry *model.LedgerEntry) error {
	return nil // TODO: Implement
}

func (s *Store) GetLedgerEntriesByUser(ctx context.Context, userID int, filters model.LedgerFilters) ([]*model.LedgerEntry, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) GetLedgerEntriesByHousehold(ctx context.Context, householdID int, filters model.LedgerFilters) ([]*model.LedgerEntry, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) GetUserBalance(ctx context.Context, userID int) (decimal.Decimal, error) {
	return decimal.Zero, nil // TODO: Implement
}

func (s *Store) GetAllUserBalances(ctx context.Context, householdID int) ([]*model.UserBalance, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) CreateAuditLog(ctx context.Context, log *model.AuditLog) error {
	detailsJSON, _ := json.Marshal(log.Details)
	query := `INSERT INTO audit_logs (household_id, user_id, action, details, created_at) VALUES (?, ?, ?, ?, ?)`
	_, err := s.db.ExecContext(ctx, query, log.HouseholdID, log.UserID, log.Action, string(detailsJSON), log.CreatedAt)
	return err
}

func (s *Store) GetAuditLogsByHousehold(ctx context.Context, householdID int, filters model.AuditFilters) ([]*model.AuditLog, error) {
	return nil, nil // TODO: Implement
}

func (s *Store) GetAuditLogsByUser(ctx context.Context, userID int, filters model.AuditFilters) ([]*model.AuditLog, error) {
	return nil, nil // TODO: Implement
}

// Transaction wrapper
type Tx struct {
	tx    *sql.Tx
	store *Store
}

func (t *Tx) Commit() error {
	return t.tx.Commit()
}

func (t *Tx) Rollback() error {
	return t.tx.Rollback()
}

// Implement all store methods for transaction - for now, delegate to main store
func (t *Tx) Close() error                                                                       { return nil }
func (t *Tx) Ping() error                                                                        { return nil }
func (t *Tx) BeginTx(ctx context.Context) (interface{}, error)                                     { return t, nil }
func (t *Tx) CreateHousehold(ctx context.Context, household *model.Household) error             { return t.store.CreateHousehold(ctx, household) }
func (t *Tx) GetHouseholdByID(ctx context.Context, id int) (*model.Household, error)            { return t.store.GetHouseholdByID(ctx, id) }
func (t *Tx) GetHouseholdByInviteCode(ctx context.Context, inviteCode string) (*model.Household, error) { return t.store.GetHouseholdByInviteCode(ctx, inviteCode) }
func (t *Tx) UpdateHouseholdInviteCode(ctx context.Context, id int, inviteCode string) error    { return t.store.UpdateHouseholdInviteCode(ctx, id, inviteCode) }
func (t *Tx) CreateUser(ctx context.Context, user *model.User) error                            { return t.store.CreateUser(ctx, user) }
func (t *Tx) GetUserByID(ctx context.Context, id int) (*model.User, error)                      { return t.store.GetUserByID(ctx, id) }
func (t *Tx) GetUserByEmail(ctx context.Context, email string) (*model.User, error)            { return t.store.GetUserByEmail(ctx, email) }
func (t *Tx) GetUsersByHousehold(ctx context.Context, householdID int) ([]*model.User, error)  { return t.store.GetUsersByHousehold(ctx, householdID) }
func (t *Tx) UpdateUser(ctx context.Context, user *model.User) error                           { return t.store.UpdateUser(ctx, user) }
func (t *Tx) DeleteUser(ctx context.Context, id int) error                                     { return t.store.DeleteUser(ctx, id) }

// Stub implementations for transaction methods
func (t *Tx) CreateChore(ctx context.Context, chore *model.Chore) error                                                                      { return t.store.CreateChore(ctx, chore) }
func (t *Tx) GetChoreByID(ctx context.Context, id int) (*model.Chore, error)                                                                 { return t.store.GetChoreByID(ctx, id) }
func (t *Tx) GetChoresByHousehold(ctx context.Context, householdID int, filters model.ChoreFilters) ([]*model.Chore, error)               { return t.store.GetChoresByHousehold(ctx, householdID, filters) }
func (t *Tx) UpdateChore(ctx context.Context, chore *model.Chore) error                                                                     { return t.store.UpdateChore(ctx, chore) }
func (t *Tx) DeleteChore(ctx context.Context, id int) error                                                                                 { return t.store.DeleteChore(ctx, id) }
func (t *Tx) CreateAssignment(ctx context.Context, assignment *model.Assignment) error                                                      { return t.store.CreateAssignment(ctx, assignment) }
func (t *Tx) GetAssignmentByID(ctx context.Context, id int) (*model.Assignment, error)                                                      { return t.store.GetAssignmentByID(ctx, id) }
func (t *Tx) GetAssignmentsByUser(ctx context.Context, userID int, filters model.AssignmentFilters) ([]*model.Assignment, error)         { return t.store.GetAssignmentsByUser(ctx, userID, filters) }
func (t *Tx) GetAssignmentsByHousehold(ctx context.Context, householdID int, filters model.AssignmentFilters) ([]*model.Assignment, error) { return t.store.GetAssignmentsByHousehold(ctx, householdID, filters) }
func (t *Tx) UpdateAssignment(ctx context.Context, assignment *model.Assignment) error                                                      { return t.store.UpdateAssignment(ctx, assignment) }
func (t *Tx) DeleteAssignment(ctx context.Context, id int) error                                                                            { return t.store.DeleteAssignment(ctx, id) }
func (t *Tx) GetOverdueAssignments(ctx context.Context) ([]*model.Assignment, error)                                                       { return t.store.GetOverdueAssignments(ctx) }
func (t *Tx) CreateReward(ctx context.Context, reward *model.Reward) error                                                                  { return t.store.CreateReward(ctx, reward) }
func (t *Tx) GetRewardByID(ctx context.Context, id int) (*model.Reward, error)                                                              { return t.store.GetRewardByID(ctx, id) }
func (t *Tx) GetRewardsByHousehold(ctx context.Context, householdID int) ([]*model.Reward, error)                                          { return t.store.GetRewardsByHousehold(ctx, householdID) }
func (t *Tx) UpdateReward(ctx context.Context, reward *model.Reward) error                                                                  { return t.store.UpdateReward(ctx, reward) }
func (t *Tx) DeleteReward(ctx context.Context, id int) error                                                                                { return t.store.DeleteReward(ctx, id) }
func (t *Tx) CreateRedemption(ctx context.Context, redemption *model.Redemption) error                                                     { return t.store.CreateRedemption(ctx, redemption) }
func (t *Tx) GetRedemptionByID(ctx context.Context, id int) (*model.Redemption, error)                                                     { return t.store.GetRedemptionByID(ctx, id) }
func (t *Tx) GetRedemptionsByUser(ctx context.Context, userID int) ([]*model.Redemption, error)                                           { return t.store.GetRedemptionsByUser(ctx, userID) }
func (t *Tx) GetRedemptionsByHousehold(ctx context.Context, householdID int) ([]*model.Redemption, error)                                 { return t.store.GetRedemptionsByHousehold(ctx, householdID) }
func (t *Tx) UpdateRedemption(ctx context.Context, redemption *model.Redemption) error                                                     { return t.store.UpdateRedemption(ctx, redemption) }
func (t *Tx) CreateLedgerEntry(ctx context.Context, entry *model.LedgerEntry) error                                                        { return t.store.CreateLedgerEntry(ctx, entry) }
func (t *Tx) GetLedgerEntriesByUser(ctx context.Context, userID int, filters model.LedgerFilters) ([]*model.LedgerEntry, error)          { return t.store.GetLedgerEntriesByUser(ctx, userID, filters) }
func (t *Tx) GetLedgerEntriesByHousehold(ctx context.Context, householdID int, filters model.LedgerFilters) ([]*model.LedgerEntry, error) { return t.store.GetLedgerEntriesByHousehold(ctx, householdID, filters) }
func (t *Tx) GetUserBalance(ctx context.Context, userID int) (decimal.Decimal, error)                                                      { return t.store.GetUserBalance(ctx, userID) }
func (t *Tx) GetAllUserBalances(ctx context.Context, householdID int) ([]*model.UserBalance, error)                                       { return t.store.GetAllUserBalances(ctx, householdID) }
func (t *Tx) CreateAuditLog(ctx context.Context, log *model.AuditLog) error                                                                 { return t.store.CreateAuditLog(ctx, log) }
func (t *Tx) GetAuditLogsByHousehold(ctx context.Context, householdID int, filters model.AuditFilters) ([]*model.AuditLog, error)         { return t.store.GetAuditLogsByHousehold(ctx, householdID, filters) }
func (t *Tx) GetAuditLogsByUser(ctx context.Context, userID int, filters model.AuditFilters) ([]*model.AuditLog, error)                   { return t.store.GetAuditLogsByUser(ctx, userID, filters) }