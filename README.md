# ChoreMe - Family Chore Management System

A comprehensive family chore management application with support for multiple database backends (SQLite, MySQL/MariaDB, PostgreSQL).

## Features

- **Multi-Database Support**: Choose between SQLite, MySQL/MariaDB, or PostgreSQL
- **Family Management**: Household-based organization with invite codes
- **Role-Based Access**: System admin, admin, manager, worker, and observer roles
- **Chore Management**: Create, assign, and track chores with due dates and values
- **Partial Completion**: Support for percentage-based chore completion
- **Photo Proof**: Upload and compress images as proof of completion
- **Earnings System**: Track points/money with decimal precision
- **Reward Store**: Create and redeem rewards
- **Audit Trail**: Complete logging of all actions
- **Late Penalties**: Configurable percentage reductions for overdue chores
- **Recurring Chores**: Daily, weekly, monthly, or custom patterns
- **Offline Support**: PWA capabilities with sync conflict resolution

## Quick Start

### Prerequisites

- Go 1.21 or later
- Docker and Docker Compose (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/choreme.git
   cd choreme
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install dependencies**
   ```bash
   go mod tidy
   ```

4. **Run database migrations**
   ```bash
   make migrate-up
   ```

5. **Start the application**
   ```bash
   make run
   ```

The API will be available at `http://localhost:8080`

### Docker Deployment

#### SQLite (Simplest)
```bash
docker-compose up choreme
```

#### PostgreSQL
```bash
docker-compose --profile postgres up choreme-postgres postgres
```

#### MySQL/MariaDB
```bash
docker-compose --profile mysql up choreme-mysql mysql
```

#### With Reverse Proxy
```bash
docker-compose --profile proxy up choreme caddy
```

## Database Configuration

### SQLite (Default)
```env
DB_TYPE=sqlite
DB_NAME=choreme.db
```

### PostgreSQL
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=choreme
DB_USER=choreme
DB_PASS=password
DB_SSL_MODE=disable
```

### MySQL/MariaDB
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=choreme
DB_USER=choreme
DB_PASS=password
```

## API Documentation

### Authentication Endpoints

#### Register First User (System Admin)
```http
POST /api/v1/auth/register
Content-Type: application/json

{
    "household_name": "The Johnsons",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "securepassword"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
    "email": "alice@example.com",
    "password": "securepassword"
}
```

#### Join Household
```http
POST /api/v1/households/join
Content-Type: application/json

{
    "invite_code": "abc12345",
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "password": "securepassword"
}
```

### Protected Endpoints

All protected endpoints require the `Authorization: Bearer <token>` header.

#### Generate Invite Code
```http
POST /api/v1/households/invite
Authorization: Bearer <admin_token>
```

#### Create Chore
```http
POST /api/v1/chores
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "title": "Do the dishes",
    "description": "Wash and dry all dishes",
    "value": "2.50",
    "due_date": "2024-12-31T18:00:00Z",
    "frequency": "daily",
    "category": "Kitchen",
    "priority": "medium",
    "auto_approve": false,
    "proof_required": true,
    "late_penalty_pct": "10.00",
    "expire_days": 3,
    "assigned_to": [2, 3]
}
```

#### Complete Chore
```http
PATCH /api/v1/assignments/{id}/complete
Authorization: Bearer <worker_token>
Content-Type: application/json

{
    "percent_complete": "100.00",
    "proof_image": "base64_encoded_image_data"
}
```

#### Approve Chore
```http
PATCH /api/v1/assignments/{id}/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "approval_notes": "Great job!"
}
```

## Architecture

### Project Structure
```
cmd/
├── choreme/           # Main application
└── migrate/           # Migration tool
internal/
├── api/              # HTTP handlers
├── auth/             # JWT and password handling
├── config/           # Configuration management
├── middleware/       # HTTP middleware
├── model/            # Domain models
├── service/          # Business logic
└── store/            # Database abstraction
    ├── interface.go  # Store interface
    ├── factory.go    # Database factory
    ├── postgres/     # PostgreSQL implementation
    ├── mysql/        # MySQL implementation
    └── sqlite/       # SQLite implementation
migrations/
├── postgres/         # PostgreSQL migrations
├── mysql/           # MySQL migrations
└── sqlite/          # SQLite migrations
```

### Key Design Decisions

- **Database Abstraction**: Single interface supporting multiple backends
- **Decimal Precision**: Use `shopspring/decimal` for monetary values
- **JWT Authentication**: Stateless authentication with role-based access
- **Audit Logging**: Complete trail of all user actions
- **Graceful Degradation**: Features work across all database types

## Development

### Available Commands

```bash
make build          # Build the application
make run            # Run the application
make test           # Run tests
make migrate-up     # Run database migrations
make migrate-down   # Rollback migrations
make docker-build   # Build Docker image
make docker-run     # Run with Docker Compose
make dev-setup      # Setup development environment
```

### Adding New Endpoints

1. Define the model in `internal/model/models.go`
2. Add store interface method in `internal/store/interface.go`
3. Implement in all database stores (`postgres/`, `mysql/`, `sqlite/`)
4. Create service in `internal/service/`
5. Add API handler in `internal/api/`
6. Register route in `internal/api/server.go`

### Database Migrations

Create new migration files in the appropriate database directories:

```bash
# PostgreSQL
migrations/postgres/002_new_feature.up.sql
migrations/postgres/002_new_feature.down.sql

# MySQL
migrations/mysql/002_new_feature.up.sql
migrations/mysql/002_new_feature.down.sql

# SQLite
migrations/sqlite/002_new_feature.up.sql
migrations/sqlite/002_new_feature.down.sql
```

## Deployment

### Production Considerations

1. **Database Choice**:
   - SQLite: Single-family, simple deployment
   - MySQL: Traditional web hosting, moderate scale
   - PostgreSQL: High-concurrency, advanced features

2. **Security**:
   - Change default JWT secret
   - Use environment variables for secrets
   - Enable HTTPS in production
   - Configure proper CORS origins

3. **Performance**:
   - Set appropriate database connection limits
   - Configure image compression settings
   - Monitor storage usage for image uploads

### Environment Variables

See `.env.example` for all available configuration options.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the API specification

## Roadmap

- [ ] Web UI (React PWA)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Email notifications
- [ ] Recurring chore automation
- [ ] Advanced reporting
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Backup/restore functionality
