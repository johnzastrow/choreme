package api

import (
	"net/http"
	"strconv"

	"github.com/choreme/choreme/internal/middleware"
	"github.com/choreme/choreme/internal/model"
	"github.com/gin-gonic/gin"
)

func (s *Server) getUserID(c *gin.Context) (int, bool) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, model.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return 0, false
	}
	return userID, true
}

func (s *Server) getHouseholdID(c *gin.Context) (int, bool) {
	householdID, ok := middleware.GetHouseholdID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, model.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return 0, false
	}
	return householdID, true
}

func (s *Server) getClaims(c *gin.Context) (*middleware.Claims, bool) {
	claims, ok := middleware.GetClaims(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, model.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return nil, false
	}
	return claims, true
}

func (s *Server) getIDParam(c *gin.Context) (int, bool) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Error:   "Invalid ID parameter",
		})
		return 0, false
	}
	return id, true
}

func (s *Server) bindJSON(c *gin.Context, obj interface{}) bool {
	if err := c.ShouldBindJSON(obj); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return false
	}
	return true
}

func (s *Server) success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Data:    data,
	})
}

func (s *Server) created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, model.APIResponse{
		Success: true,
		Data:    data,
	})
}

func (s *Server) error(c *gin.Context, status int, message string) {
	c.JSON(status, model.APIResponse{
		Success: false,
		Error:   message,
	})
}

func (s *Server) internalError(c *gin.Context, message string) {
	s.error(c, http.StatusInternalServerError, message)
}

func (s *Server) badRequest(c *gin.Context, message string) {
	s.error(c, http.StatusBadRequest, message)
}

func (s *Server) notFound(c *gin.Context, message string) {
	s.error(c, http.StatusNotFound, message)
}

func (s *Server) forbidden(c *gin.Context, message string) {
	s.error(c, http.StatusForbidden, message)
}