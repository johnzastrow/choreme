package main

import (
	"log"

	"github.com/choreme/choreme/internal/api"
	"github.com/choreme/choreme/internal/config"
	"github.com/choreme/choreme/internal/store"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Set Gin mode
	gin.SetMode(cfg.Server.GinMode)

	// Initialize database store
	store, err := store.NewStore(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer store.Close()

	// Initialize API server
	server := api.NewServer(cfg, store)

	// Start server
	addr := cfg.Server.Host + ":" + cfg.Server.Port
	log.Printf("Starting ChoreMe server on %s", addr)
	if err := server.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}