# Build stage
FROM golang:1.22-alpine AS builder

# Install git and ca-certificates (needed for go mod download)
RUN apk update && apk add --no-cache git ca-certificates

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main cmd/choreme/main.go

# Build migration tool
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o migrate cmd/migrate/main.go

# Production stage
FROM alpine:latest

# Install ca-certificates and sqlite (for sqlite database support)
RUN apk --no-cache add ca-certificates sqlite

WORKDIR /root/

# Copy binary from builder stage
COPY --from=builder /app/main .
COPY --from=builder /app/migrate .

# Copy migration files
COPY --from=builder /app/migrations ./migrations

# Create data directory for SQLite
RUN mkdir -p /data

# Expose port
EXPOSE 8080

# Set environment variables
ENV DB_TYPE=sqlite
ENV DB_NAME=/data/choreme.db
ENV PORT=8080
ENV HOST=0.0.0.0
ENV GIN_MODE=release

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run migrations and start server
CMD ["sh", "-c", "./migrate up && ./main"]