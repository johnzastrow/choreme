package api

import (
	"log"

	"github.com/choreme/choreme/internal/auth"
	"github.com/choreme/choreme/internal/config"
	"github.com/choreme/choreme/internal/middleware"
	"github.com/choreme/choreme/internal/scheduler"
	"github.com/choreme/choreme/internal/service"
	"github.com/choreme/choreme/internal/store"
	"github.com/choreme/choreme/internal/web"
	"github.com/gin-gonic/gin"
)

type Server struct {
	config     *config.Config
	store      store.Store
	jwtManager *auth.JWTManager
	services   *service.Services
	scheduler  *scheduler.Scheduler
	router     *gin.Engine
}

func NewServer(cfg *config.Config, store store.Store) *Server {
	jwtManager := auth.NewJWTManager(cfg.JWT.Secret)
	services := service.New(store)
	sched := scheduler.NewScheduler(services)

	server := &Server{
		config:     cfg,
		store:      store,
		jwtManager: jwtManager,
		services:   services,
		scheduler:  sched,
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

	// Setup web UI serving (embedded React PWA)
	s.setupWebUI()
	
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

			// Account management
			accountRoutes := protected.Group("/accounts")
			{
				// Deposits and withdrawals
				accountRoutes.POST("/deposit", s.deposit)
				accountRoutes.POST("/withdraw", s.withdraw)

				// Transfers
				accountRoutes.POST("/transfer", s.createTransfer)
				accountRoutes.GET("/transfers", s.getTransfers)
				accountRoutes.GET("/transfers/pending", s.getPendingTransfers)
				accountRoutes.POST("/transfers/:id/approve", s.approveTransfer)

				// Spending limits
				accountRoutes.GET("/spending-limit/check", s.checkSpendingLimit)
				accountRoutes.POST("/spending-limits", s.setSpendingLimits)
				accountRoutes.GET("/spending-limits/:userID", s.getSpendingLimits)
				accountRoutes.POST("/spending-limits/:userID/reset", s.resetSpendingLimits)

				// Interest rates
				accountRoutes.POST("/interest-rate", s.setInterestRate)

				// Manual job triggers (system admin only)
				accountRoutes.POST("/jobs/accrue-interest", s.manualAccrueInterest)
				accountRoutes.POST("/jobs/reset-spending-limits", s.manualResetSpendingLimits)
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

func (s *Server) setupWebUI() {
	// Try to setup embedded React PWA first
	spaHandler, err := web.NewSPAHandler()
	if err == nil {
		log.Println("Embedded React PWA enabled - serving full mobile UI")
		s.router.NoRoute(gin.WrapH(spaHandler))
		s.router.GET("/api", s.rootHandler)
		return
	}

	log.Printf("React PWA not available (build not found): %v", err)
	log.Println("Falling back to simple HTML UI")
	
	// Fallback to simple HTML UI
	simpleUI, err := web.NewSimpleUI()
	if err != nil {
		log.Printf("Simple UI also not available: %v", err)
		// Final fallback to API documentation
		s.router.GET("/", s.rootHandler)
		return
	}
	
	log.Println("Simple HTML UI enabled")
	
	// Setup simple UI routes
	s.router.GET("/", gin.WrapF(simpleUI.ServeHomePage))
	s.router.GET("/login", gin.WrapF(simpleUI.ServeLoginPage))
	
	// Keep API documentation available at /api
	s.router.GET("/api", s.rootHandler)
}

func (s *Server) Run(addr string) error {
	// Start background job scheduler
	s.scheduler.Start()

	log.Printf("Starting server on %s", addr)
	return s.router.Run(addr)
}

// Shutdown gracefully shuts down the server and stops background jobs
func (s *Server) Shutdown() {
	log.Println("Shutting down server...")
	s.scheduler.Stop()
	log.Println("Server shutdown complete")
}