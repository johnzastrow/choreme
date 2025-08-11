package main

import (
	"log"

	"github.com/choreme/choreme/internal/api"
	"github.com/choreme/choreme/internal/config"
	"github.com/choreme/choreme/internal/store"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("=== ChoreMe API Server ===")
	
	// Load configuration
	log.Println("Loading configuration...")
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	log.Printf("Configuration loaded - Database: %s, Port: %s", cfg.Database.Type, cfg.Server.Port)

	// Set Gin mode
	gin.SetMode(cfg.Server.GinMode)

	// Initialize database store
	log.Printf("Initializing %s database...", cfg.Database.Type)
	store, err := store.NewStore(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer store.Close()

	// Test database connection
	if err := store.Ping(); err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	log.Println("Database connection successful")

	// Initialize API server
	log.Println("Initializing API server...")
	server := api.NewServer(cfg, store)

	// Start server
	addr := cfg.Server.Host + ":" + cfg.Server.Port
	log.Printf("🚀 ChoreMe API server starting on %s", addr)
	log.Printf("📱 Health check: http://%s/health", addr)
	log.Printf("🌐 API documentation: http://%s/", addr)
	log.Println("Ready to accept requests!")
	
	if err := server.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}