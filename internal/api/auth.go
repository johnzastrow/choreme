package api

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"github.com/choreme/choreme/internal/model"
	"github.com/gin-gonic/gin"
)

func (s *Server) register(c *gin.Context) {
	var req model.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// Check if this is the first user (system admin)
	isFirstUser, err := s.services.Auth.IsFirstUser(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Error:   "Failed to check user count",
		})
		return
	}

	user, err := s.services.Auth.Register(c.Request.Context(), &req, isFirstUser)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	token, err := s.jwtManager.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Error:   "Failed to generate token",
		})
		return
	}

	c.JSON(http.StatusCreated, model.APIResponse{
		Success: true,
		Data: model.AuthResponse{
			Token: token,
			User:  *user,
		},
	})
}

func (s *Server) login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	user, err := s.services.Auth.Login(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, model.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	token, err := s.jwtManager.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Error:   "Failed to generate token",
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Data: model.AuthResponse{
			Token: token,
			User:  *user,
		},
	})
}

func (s *Server) joinHousehold(c *gin.Context) {
	var req model.JoinHouseholdRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	user, err := s.services.Auth.JoinHousehold(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	token, err := s.jwtManager.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Error:   "Failed to generate token",
		})
		return
	}

	c.JSON(http.StatusCreated, model.APIResponse{
		Success: true,
		Data: model.AuthResponse{
			Token: token,
			User:  *user,
		},
	})
}

func (s *Server) generateInvite(c *gin.Context) {
	householdID, ok := s.getHouseholdID(c)
	if !ok {
		return
	}

	// Generate random invite code
	bytes := make([]byte, 4)
	if _, err := rand.Read(bytes); err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Error:   "Failed to generate invite code",
		})
		return
	}
	inviteCode := hex.EncodeToString(bytes)

	err := s.services.Household.UpdateInviteCode(c.Request.Context(), householdID, inviteCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Error:   "Failed to update invite code",
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Data: gin.H{
			"invite_code": inviteCode,
		},
	})
}

func (s *Server) rootHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"service": "ChoreMe API",
		"version": "v1.0.0",
		"status": "running",
		"endpoints": gin.H{
			"health": "/health",
			"api": "/api/v1",
			"docs": gin.H{
				"register": "POST /api/v1/auth/register",
				"login": "POST /api/v1/auth/login", 
				"health": "GET /health",
			},
		},
	})
}

func (s *Server) healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
		"service": "choreme",
	})
}