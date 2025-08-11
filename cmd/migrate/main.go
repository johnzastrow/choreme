package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/choreme/choreme/internal/config"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database"
	"github.com/golang-migrate/migrate/v4/database/mysql"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	"github.com/golang-migrate/migrate/v4/source/file"

	// Import database drivers
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Usage: migrate <up|down> [steps]")
	}

	command := os.Args[1]
	var steps int
	if len(os.Args) > 2 {
		var err error
		steps, err = strconv.Atoi(os.Args[2])
		if err != nil {
			log.Fatal("Invalid steps argument")
		}
	}

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Open database connection
	db, err := sql.Open(cfg.Database.DriverName(), cfg.Database.ConnectionString())
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Get database driver instance
	driver, err := getDatabaseDriver(cfg.Database.Type, db)
	if err != nil {
		log.Fatalf("Failed to get database driver: %v", err)
	}

	// Create source instance
	sourceURL := fmt.Sprintf("file://migrations/%s", cfg.Database.Type)
	sourceInstance, err := (&file.File{}).Open(sourceURL)
	if err != nil {
		log.Fatalf("Failed to open migration source: %v", err)
	}

	// Create migrate instance
	m, err := migrate.NewWithInstance("file", sourceInstance, cfg.Database.Type, driver)
	if err != nil {
		log.Fatalf("Failed to create migrate instance: %v", err)
	}
	defer m.Close()

	// Run migration command
	switch command {
	case "up":
		if steps > 0 {
			err = m.Steps(steps)
		} else {
			err = m.Up()
		}
	case "down":
		if steps > 0 {
			err = m.Steps(-steps)
		} else {
			err = m.Down()
		}
	default:
		log.Fatal("Unknown command. Use 'up' or 'down'")
	}

	if err != nil && err != migrate.ErrNoChange {
		log.Fatalf("Migration failed: %v", err)
	}

	if err == migrate.ErrNoChange {
		log.Println("No migrations to apply")
	} else {
		log.Printf("Migration %s completed successfully", command)
	}
}

func getDatabaseDriver(dbType string, db *sql.DB) (database.Driver, error) {
	switch dbType {
	case "postgres":
		return postgres.WithInstance(db, &postgres.Config{})
	case "mysql":
		return mysql.WithInstance(db, &mysql.Config{})
	case "sqlite":
		return sqlite3.WithInstance(db, &sqlite3.Config{})
	default:
		return nil, fmt.Errorf("unsupported database type: %s", dbType)
	}
}