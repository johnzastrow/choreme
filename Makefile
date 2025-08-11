.PHONY: help build build-ui run test clean migrate-up migrate-down docker-build docker-run

# Default target
help:
	@echo "Available commands:"
	@echo "  build        - Build the API backend only"
	@echo "  build-ui     - Build with embedded React UI (requires Node.js)"
	@echo "  run          - Run the application"
	@echo "  test         - Run tests"
	@echo "  clean        - Clean build artifacts"
	@echo "  migrate-up   - Run database migrations"
	@echo "  migrate-down - Rollback database migrations"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run with Docker Compose"

# Build the application (API only)
build:
	@echo "Building ChoreMe API backend..."
	@go build -o bin/choreme cmd/choreme/main.go

# Build with embedded UI
build-ui:
	@echo "Building ChoreMe with embedded UI..."
	@./scripts/build-with-ui.sh

# Run the application
run:
	@echo "Starting ChoreMe..."
	@go run cmd/choreme/main.go

# Run tests
test:
	@echo "Running tests..."
	@go test -v ./...

# Clean build artifacts
clean:
	@echo "Cleaning..."
	@rm -rf bin/
	@rm -f *.db *.sqlite *.sqlite3

# Run database migrations up
migrate-up:
	@echo "Running migrations..."
	@go run cmd/migrate/main.go up

# Rollback database migrations
migrate-down:
	@echo "Rolling back migrations..."
	@go run cmd/migrate/main.go down

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	@docker build -t choreme:latest .

# Run with Docker Compose
docker-run:
	@echo "Starting with Docker Compose..."
	@docker-compose up --build

# Development setup
dev-setup:
	@echo "Setting up development environment..."
	@cp .env.example .env
	@go mod tidy
	@make migrate-up

# Format code
fmt:
	@echo "Formatting code..."
	@go fmt ./...

# Lint code
lint:
	@echo "Linting code..."
	@golangci-lint run