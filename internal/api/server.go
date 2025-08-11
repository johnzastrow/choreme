package api

import (
	"github.com/choreme/choreme/internal/auth"
	"github.com/choreme/choreme/internal/config"
	"github.com/choreme/choreme/internal/middleware"
	"github.com/choreme/choreme/internal/service"
	"github.com/choreme/choreme/internal/store"
	"github.com/gin-gonic/gin"
)

type Server struct {
	config     *config.Config
	store      store.Store
	jwtManager *auth.JWTManager
	services   *service.Services
	router     *gin.Engine
}

func NewServer(cfg *config.Config, store store.Store) *Server {
	jwtManager := auth.NewJWTManager(cfg.JWT.Secret)
	services := service.New(store)

	server := &Server{
		config:     cfg,
		store:      store,
		jwtManager: jwtManager,
		services:   services,
	}

	server.setupRoutes()
	return server
}

func (s *Server) setupRoutes() {
	s.router = gin.Default()

	// Global middleware
	s.router.Use(middleware.CORSMiddleware())
	s.router.Use(middleware.LoggingMiddleware())
	s.router.Use(middleware.RecoveryMiddleware())

	// Root route
	s.router.GET("/", s.rootHandler)
	
	// Health check
	s.router.GET("/health", s.healthCheck)

	// API v1 routes
	v1 := s.router.Group("/api/v1")
	{
		// Public routes (no authentication required)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", s.register)
			auth.POST("/login", s.login)
		}

		households := v1.Group("/households")
		{
			households.POST("/join", s.joinHousehold)
		}

		// Protected routes (authentication required)
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware(s.jwtManager))
		{
			// Household management
			householdRoutes := protected.Group("/households")
			{
				householdRoutes.POST("/invite", middleware.RequireAdminOrManager(), s.generateInvite)
			}

			// User management
			userRoutes := protected.Group("/users")
			{
				userRoutes.GET("/me", s.getCurrentUser)
				userRoutes.PUT("/me", s.updateCurrentUser)
				userRoutes.GET("", middleware.RequireAdminOrManager(), s.getUsers)
			}

			// Chore management
			choreRoutes := protected.Group("/chores")
			{
				choreRoutes.GET("", s.getChores)
				choreRoutes.POST("", middleware.RequireAdminOrManager(), s.createChore)
				choreRoutes.GET("/:id", s.getChore)
				choreRoutes.PUT("/:id", middleware.RequireAdminOrManager(), s.updateChore)
				choreRoutes.DELETE("/:id", middleware.RequireAdminOrManager(), s.deleteChore)
			}

			// Assignment management
			assignmentRoutes := protected.Group("/assignments")
			{
				assignmentRoutes.GET("", s.getAssignments)
				assignmentRoutes.GET("/:id", s.getAssignment)
				assignmentRoutes.PATCH("/:id/progress", s.updateProgress)
				assignmentRoutes.PATCH("/:id/complete", s.completeChore)
				assignmentRoutes.PATCH("/:id/approve", middleware.RequireAdminOrManager(), s.approveChore)
				assignmentRoutes.PATCH("/:id/reject", middleware.RequireAdminOrManager(), s.rejectChore)
			}

			// Reward management
			rewardRoutes := protected.Group("/rewards")
			{
				rewardRoutes.GET("", s.getRewards)
				rewardRoutes.POST("", middleware.RequireAdminOrManager(), s.createReward)
				rewardRoutes.GET("/:id", s.getReward)
				rewardRoutes.PUT("/:id", middleware.RequireAdminOrManager(), s.updateReward)
				rewardRoutes.DELETE("/:id", middleware.RequireAdminOrManager(), s.deleteReward)
				rewardRoutes.POST("/:id/redeem", s.redeemReward)
			}

			// Redemption management
			redemptionRoutes := protected.Group("/redemptions")
			{
				redemptionRoutes.GET("", s.getRedemptions)
				redemptionRoutes.PATCH("/:id/approve", middleware.RequireAdminOrManager(), s.approveRedemption)
				redemptionRoutes.PATCH("/:id/reject", middleware.RequireAdminOrManager(), s.rejectRedemption)
			}

			// Ledger management
			ledgerRoutes := protected.Group("/ledger")
			{
				ledgerRoutes.GET("", s.getLedger)
				ledgerRoutes.POST("/adjust", middleware.RequireAdminOrManager(), s.adjustLedger)
				ledgerRoutes.GET("/balance", s.getBalance)
			}

			// Audit logs
			auditRoutes := protected.Group("/audit")
			{
				auditRoutes.GET("", middleware.RequireAdminOrManager(), s.getAuditLogs)
			}

			// Reports
			reportRoutes := protected.Group("/reports")
			{
				reportRoutes.GET("/chores", middleware.RequireAdminOrManager(), s.getChoreReport)
				reportRoutes.GET("/earnings", middleware.RequireAdminOrManager(), s.getEarningsReport)
			}
		}
	}
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}