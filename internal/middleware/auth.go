package middleware

import (
	"net/http"
	"strings"

	"github.com/choreme/choreme/internal/auth"
	"github.com/choreme/choreme/internal/model"
	"github.com/gin-gonic/gin"
)

const (
	ContextUserKey      = "user"
	ContextClaimsKey    = "claims"
	AuthorizationHeader = "Authorization"
	BearerPrefix        = "Bearer "
)

func AuthMiddleware(jwtManager *auth.JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader(AuthorizationHeader)
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, model.APIResponse{
				Success: false,
				Error:   "Authorization header required",
			})
			c.Abort()
			return
		}

		if !strings.HasPrefix(authHeader, BearerPrefix) {
			c.JSON(http.StatusUnauthorized, model.APIResponse{
				Success: false,
				Error:   "Invalid authorization header format",
			})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, BearerPrefix)
		claims, err := jwtManager.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, model.APIResponse{
				Success: false,
				Error:   "Invalid token",
			})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set(ContextClaimsKey, claims)
		c.Next()
	}
}

func RequireRole(allowedRoles ...model.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, exists := c.Get(ContextClaimsKey)
		if !exists {
			c.JSON(http.StatusUnauthorized, model.APIResponse{
				Success: false,
				Error:   "Authentication required",
			})
			c.Abort()
			return
		}

		userClaims := claims.(*auth.Claims)
		
		// Check if user role is in allowed roles
		for _, role := range allowedRoles {
			if userClaims.Role == role {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, model.APIResponse{
			Success: false,
			Error:   "Insufficient permissions",
		})
		c.Abort()
	}
}

func RequireAdminOrManager() gin.HandlerFunc {
	return RequireRole(model.RoleSystemAdmin, model.RoleAdmin, model.RoleManager)
}

func RequireSystemAdmin() gin.HandlerFunc {
	return RequireRole(model.RoleSystemAdmin)
}

func GetClaims(c *gin.Context) (*auth.Claims, bool) {
	claims, exists := c.Get(ContextClaimsKey)
	if !exists {
		return nil, false
	}
	return claims.(*auth.Claims), true
}

func GetUserID(c *gin.Context) (int, bool) {
	claims, ok := GetClaims(c)
	if !ok {
		return 0, false
	}
	return claims.UserID, true
}

func GetHouseholdID(c *gin.Context) (int, bool) {
	claims, ok := GetClaims(c)
	if !ok {
		return 0, false
	}
	return claims.HouseholdID, true
}