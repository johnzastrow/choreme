package store

import (
	"database/sql"
	"fmt"

	"github.com/choreme/choreme/internal/config"
	"github.com/choreme/choreme/internal/store/mysql"
	"github.com/choreme/choreme/internal/store/postgres"
	"github.com/choreme/choreme/internal/store/sqlite"

	// Import database drivers
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
)

func NewStore(cfg *config.DatabaseConfig) (Store, error) {
	db, err := sql.Open(cfg.DriverName(), cfg.ConnectionString())
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	switch cfg.Type {
	case "postgres":
		return postgres.New(db), nil
	case "mysql":
		return mysql.New(db), nil
	case "sqlite":
		return sqlite.New(db), nil
	default:
		return nil, fmt.Errorf("unsupported database type: %s", cfg.Type)
	}
}