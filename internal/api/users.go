package api

import (
	"github.com/gin-gonic/gin"
)

func (s *Server) getCurrentUser(c *gin.Context) {
	userID, ok := s.getUserID(c)
	if !ok {
		return
	}

	user, err := s.services.User.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		s.notFound(c, "User not found")
		return
	}

	// Don't return password hash
	user.PasswordHash = ""
	s.success(c, user)
}

func (s *Server) updateCurrentUser(c *gin.Context) {
	userID, ok := s.getUserID(c)
	if !ok {
		return
	}

	var req struct {
		Name                  string `json:"name" binding:"required"`
		Email                 string `json:"email" binding:"required,email"`
		NotificationPrefEmail bool   `json:"notification_pref_email"`
		NotificationPrefPush  bool   `json:"notification_pref_push"`
	}

	if !s.bindJSON(c, &req) {
		return
	}

	// Get current user
	user, err := s.services.User.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		s.notFound(c, "User not found")
		return
	}

	// Update fields
	user.Name = req.Name
	user.Email = req.Email
	user.NotificationPrefEmail = req.NotificationPrefEmail
	user.NotificationPrefPush = req.NotificationPrefPush

	if err := s.services.User.UpdateUser(c.Request.Context(), user); err != nil {
		s.internalError(c, "Failed to update user")
		return
	}

	// Don't return password hash
	user.PasswordHash = ""
	s.success(c, user)
}

func (s *Server) getUsers(c *gin.Context) {
	householdID, ok := s.getHouseholdID(c)
	if !ok {
		return
	}

	users, err := s.services.User.GetUsersByHousehold(c.Request.Context(), householdID)
	if err != nil {
		s.internalError(c, "Failed to get users")
		return
	}

	// Remove password hashes
	for _, user := range users {
		user.PasswordHash = ""
	}

	s.success(c, users)
}