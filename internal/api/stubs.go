package api

import (
	"github.com/choreme/choreme/internal/model"
	"github.com/gin-gonic/gin"
)

// Chore handlers (stubs)
func (s *Server) getChores(c *gin.Context) {
	s.success(c, []model.Chore{})
}

func (s *Server) createChore(c *gin.Context) {
	s.success(c, gin.H{"message": "Chore creation not yet implemented"})
}

func (s *Server) getChore(c *gin.Context) {
	s.success(c, gin.H{"message": "Get chore not yet implemented"})
}

func (s *Server) updateChore(c *gin.Context) {
	s.success(c, gin.H{"message": "Update chore not yet implemented"})
}

func (s *Server) deleteChore(c *gin.Context) {
	s.success(c, gin.H{"message": "Delete chore not yet implemented"})
}

// Assignment handlers (stubs)
func (s *Server) getAssignments(c *gin.Context) {
	s.success(c, []model.Assignment{})
}

func (s *Server) getAssignment(c *gin.Context) {
	s.success(c, gin.H{"message": "Get assignment not yet implemented"})
}

func (s *Server) updateProgress(c *gin.Context) {
	s.success(c, gin.H{"message": "Update progress not yet implemented"})
}

func (s *Server) completeChore(c *gin.Context) {
	s.success(c, gin.H{"message": "Complete chore not yet implemented"})
}

func (s *Server) approveChore(c *gin.Context) {
	s.success(c, gin.H{"message": "Approve chore not yet implemented"})
}

func (s *Server) rejectChore(c *gin.Context) {
	s.success(c, gin.H{"message": "Reject chore not yet implemented"})
}

// Reward handlers (stubs)
func (s *Server) getRewards(c *gin.Context) {
	s.success(c, []model.Reward{})
}

func (s *Server) createReward(c *gin.Context) {
	s.success(c, gin.H{"message": "Create reward not yet implemented"})
}

func (s *Server) getReward(c *gin.Context) {
	s.success(c, gin.H{"message": "Get reward not yet implemented"})
}

func (s *Server) updateReward(c *gin.Context) {
	s.success(c, gin.H{"message": "Update reward not yet implemented"})
}

func (s *Server) deleteReward(c *gin.Context) {
	s.success(c, gin.H{"message": "Delete reward not yet implemented"})
}

func (s *Server) redeemReward(c *gin.Context) {
	s.success(c, gin.H{"message": "Redeem reward not yet implemented"})
}

// Redemption handlers (stubs)
func (s *Server) getRedemptions(c *gin.Context) {
	s.success(c, []model.Redemption{})
}

func (s *Server) approveRedemption(c *gin.Context) {
	s.success(c, gin.H{"message": "Approve redemption not yet implemented"})
}

func (s *Server) rejectRedemption(c *gin.Context) {
	s.success(c, gin.H{"message": "Reject redemption not yet implemented"})
}

// Ledger handlers (stubs)
func (s *Server) getLedger(c *gin.Context) {
	s.success(c, []model.LedgerEntry{})
}

func (s *Server) adjustLedger(c *gin.Context) {
	s.success(c, gin.H{"message": "Adjust ledger not yet implemented"})
}

func (s *Server) getBalance(c *gin.Context) {
	s.success(c, gin.H{"balance": "0.00"})
}

// Audit handlers (stubs)
func (s *Server) getAuditLogs(c *gin.Context) {
	s.success(c, []model.AuditLog{})
}

// Report handlers (stubs)
func (s *Server) getChoreReport(c *gin.Context) {
	s.success(c, gin.H{"message": "Chore report not yet implemented"})
}

func (s *Server) getEarningsReport(c *gin.Context) {
	s.success(c, gin.H{"message": "Earnings report not yet implemented"})
}