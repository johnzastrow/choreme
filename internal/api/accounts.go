package api

import (
	"net/http"
	"strconv"

	"github.com/choreme/choreme/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

// POST /api/v1/accounts/deposit
func (s *Server) deposit(c *gin.Context) {
	userID := c.GetInt("user_id")
	user, err := s.store.GetUserByID(c.Request.Context(), userID)
	if err != nil || (user.Role != model.RoleSystemAdmin && user.Role != model.RoleAdmin && user.Role != model.RoleManager) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	var req model.DepositRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	amount, err := decimal.NewFromString(req.Amount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid amount"})
		return
	}

	err = s.services.Account.Deposit(c.Request.Context(), req.UserID, amount, req.Description, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Deposit successful"})
}

// POST /api/v1/accounts/withdraw
func (s *Server) withdraw(c *gin.Context) {
	userID := c.GetInt("user_id")

	var req model.WithdrawalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	amount, err := decimal.NewFromString(req.Amount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid amount"})
		return
	}

	// Check spending limit first
	check, err := s.services.Account.CheckSpendingLimit(c.Request.Context(), userID, amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !check.Allowed {
		c.JSON(http.StatusForbidden, gin.H{
			"error":            check.Message,
			"limit_type":       check.LimitType,
			"suggested_amount": check.SuggestedAmount,
			"daily_remaining":  check.DailyRemaining,
			"weekly_remaining": check.WeeklyRemaining,
			"monthly_remaining": check.MonthlyRemaining,
		})
		return
	}

	err = s.services.Account.Withdraw(c.Request.Context(), userID, amount, req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Withdrawal successful"})
}

// GET /api/v1/accounts/spending-limit/check
func (s *Server) checkSpendingLimit(c *gin.Context) {
	userID := c.GetInt("user_id")
	amountStr := c.Query("amount")

	if amountStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "amount is required"})
		return
	}

	amount, err := decimal.NewFromString(amountStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid amount"})
		return
	}

	check, err := s.services.Account.CheckSpendingLimit(c.Request.Context(), userID, amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, check)
}

// POST /api/v1/accounts/transfer
func (s *Server) createTransfer(c *gin.Context) {
	fromUserID := c.GetInt("user_id")

	var req model.CreateTransferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	amount, err := decimal.NewFromString(req.Amount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid amount"})
		return
	}

	transfer, err := s.services.Account.CreateTransfer(c.Request.Context(), fromUserID, req.ToUserID, amount, req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "transfer": transfer})
}

// GET /api/v1/accounts/transfers
func (s *Server) getTransfers(c *gin.Context) {
	userID := c.GetInt("user_id")

	transfers, err := s.store.GetTransferRequestsByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"transfers": transfers})
}

// GET /api/v1/accounts/transfers/pending
func (s *Server) getPendingTransfers(c *gin.Context) {
	userID := c.GetInt("user_id")
	user, err := s.store.GetUserByID(c.Request.Context(), userID)
	if err != nil || (user.Role != model.RoleSystemAdmin && user.Role != model.RoleAdmin && user.Role != model.RoleManager) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	transfers, err := s.store.GetPendingTransferRequests(c.Request.Context(), user.HouseholdID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"transfers": transfers})
}

// POST /api/v1/accounts/transfers/:id/approve
func (s *Server) approveTransfer(c *gin.Context) {
	userID := c.GetInt("user_id")
	transferID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid transfer ID"})
		return
	}

	var req model.ApproveTransferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Approved {
		err = s.services.Account.ApproveTransfer(c.Request.Context(), transferID, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Transfer approved"})
	} else {
		reason := ""
		if req.RejectionReason != nil {
			reason = *req.RejectionReason
		}
		err = s.services.Account.RejectTransfer(c.Request.Context(), transferID, userID, reason)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Transfer rejected"})
	}
}

// POST /api/v1/accounts/spending-limits
func (s *Server) setSpendingLimits(c *gin.Context) {
	userID := c.GetInt("user_id")
	user, err := s.store.GetUserByID(c.Request.Context(), userID)
	if err != nil || (user.Role != model.RoleSystemAdmin && user.Role != model.RoleAdmin && user.Role != model.RoleManager) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	var req model.SetSpendingLimitsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var daily, weekly, monthly *decimal.Decimal
	if req.DailyLimit != nil {
		d, err := decimal.NewFromString(*req.DailyLimit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid daily limit"})
			return
		}
		daily = &d
	}
	if req.WeeklyLimit != nil {
		w, err := decimal.NewFromString(*req.WeeklyLimit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid weekly limit"})
			return
		}
		weekly = &w
	}
	if req.MonthlyLimit != nil {
		m, err := decimal.NewFromString(*req.MonthlyLimit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid monthly limit"})
			return
		}
		monthly = &m
	}

	err = s.services.Account.SetSpendingLimits(c.Request.Context(), req.UserID, daily, weekly, monthly, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Spending limits set"})
}

// GET /api/v1/accounts/spending-limits/:userID
func (s *Server) getSpendingLimits(c *gin.Context) {
	requestingUserID := c.GetInt("user_id")
	targetUserID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	// Users can only view their own limits unless they're admin
	if requestingUserID != targetUserID {
		user, err := s.store.GetUserByID(c.Request.Context(), requestingUserID)
		if err != nil || (user.Role != model.RoleSystemAdmin && user.Role != model.RoleAdmin && user.Role != model.RoleManager) {
			c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
			return
		}
	}

	limit, err := s.store.GetSpendingLimitByUserID(c.Request.Context(), targetUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"limit": limit})
}

// POST /api/v1/accounts/spending-limits/:userID/reset
func (s *Server) resetSpendingLimits(c *gin.Context) {
	requestingUserID := c.GetInt("user_id")
	targetUserID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	user, err := s.store.GetUserByID(c.Request.Context(), requestingUserID)
	if err != nil || (user.Role != model.RoleSystemAdmin && user.Role != model.RoleAdmin && user.Role != model.RoleManager) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	err = s.services.Account.ResetUserSpendingLimits(c.Request.Context(), targetUserID, requestingUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Spending limits reset"})
}

// POST /api/v1/accounts/interest-rate
func (s *Server) setInterestRate(c *gin.Context) {
	userID := c.GetInt("user_id")
	user, err := s.store.GetUserByID(c.Request.Context(), userID)
	if err != nil || (user.Role != model.RoleSystemAdmin && user.Role != model.RoleAdmin && user.Role != model.RoleManager) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	var req model.SetInterestRateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rate, err := decimal.NewFromString(req.InterestRateAnnual)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid interest rate"})
		return
	}

	err = s.services.Account.SetInterestRate(c.Request.Context(), req.UserID, rate, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Interest rate set"})
}

// POST /api/v1/accounts/jobs/accrue-interest
func (s *Server) manualAccrueInterest(c *gin.Context) {
	userID := c.GetInt("user_id")
	user, err := s.store.GetUserByID(c.Request.Context(), userID)
	if err != nil || user.Role != model.RoleSystemAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions - system admin only"})
		return
	}

	err = s.scheduler.RunOnce("accrue_interest")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Interest accrual job completed"})
}

// POST /api/v1/accounts/jobs/reset-spending-limits
func (s *Server) manualResetSpendingLimits(c *gin.Context) {
	userID := c.GetInt("user_id")
	user, err := s.store.GetUserByID(c.Request.Context(), userID)
	if err != nil || user.Role != model.RoleSystemAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions - system admin only"})
		return
	}

	err = s.scheduler.RunOnce("reset_spending_limits")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Spending limits reset job completed"})
}
