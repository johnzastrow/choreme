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

## Windows Native Deployment (Without Docker)

### Prerequisites for Windows

1. **Install Go**
   - Download Go 1.21+ from [https://golang.org/dl/](https://golang.org/dl/)
   - Follow the Windows installation instructions
   - Verify installation: `go version`

2. **Install Git**
   - Download from [https://git-scm.com/download/win](https://git-scm.com/download/win)
   - Use Git Bash or PowerShell for commands

3. **Choose Your Database**

#### Option A: SQLite (Recommended for Single Family)
- **No additional setup required** - SQLite is embedded
- Best for: Single household, simple deployment

#### Option B: PostgreSQL
- Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
- Install with default settings
- Remember the password you set for the `postgres` user
- PostgreSQL will run as a Windows service

#### Option C: MySQL
- Download MySQL from [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
- Choose "MySQL Installer for Windows"
- Install MySQL Server with default settings
- Remember the root password

### Step-by-Step Windows Installation

#### 1. Clone and Setup Project

```cmd
# Open Command Prompt or PowerShell
git clone https://github.com/your-org/choreme.git
cd choreme
```

#### 2. Configure Environment

```cmd
# Copy the example environment file
copy .env.example .env

# Edit .env file with Notepad
notepad .env
```

**Configuration Examples:**

For **SQLite** (edit `.env`):
```env
DB_TYPE=sqlite
DB_NAME=C:\choreme\data\choreme.db
JWT_SECRET=your-secure-random-key-here-change-this
PORT=8080
HOST=localhost
GIN_MODE=release
```

For **PostgreSQL** (edit `.env`):
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=choreme
DB_USER=postgres
DB_PASS=your_postgres_password
DB_SSL_MODE=disable
JWT_SECRET=your-secure-random-key-here-change-this
PORT=8080
HOST=localhost
GIN_MODE=release
```

For **MySQL** (edit `.env`):
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=choreme
DB_USER=root
DB_PASS=your_mysql_password
JWT_SECRET=your-secure-random-key-here-change-this
PORT=8080
HOST=localhost
GIN_MODE=release
```

#### 3. Prepare Database

**For SQLite:**
```cmd
# Create data directory
mkdir C:\choreme\data
```

**For PostgreSQL:**
```cmd
# Connect to PostgreSQL (will prompt for password)
psql -U postgres -h localhost

# In PostgreSQL shell, create database:
CREATE DATABASE choreme;
CREATE USER choreme WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE choreme TO choreme;
\q
```

**For MySQL:**
```cmd
# Connect to MySQL (will prompt for password)
mysql -u root -p

# In MySQL shell, create database:
CREATE DATABASE choreme;
CREATE USER 'choreme'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON choreme.* TO 'choreme'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 4. Build and Run Application

```cmd
# Download Go dependencies
go mod tidy

# Build the application
go build -o choreme.exe cmd/choreme/main.go

# Build migration tool
go build -o migrate.exe cmd/migrate/main.go

# Run database migrations
migrate.exe up

# Start the application
choreme.exe
```

The application will be available at `http://localhost:8080`

### Windows Service Installation (Optional)

To run ChoreMe as a Windows service, you can use tools like NSSM:

#### 1. Download NSSM
- Download from [https://nssm.cc/download](https://nssm.cc/download)
- Extract to `C:\nssm`

#### 2. Install Service
```cmd
# Run as Administrator
C:\nssm\nssm.exe install ChoreMe

# In the NSSM GUI:
# - Path: C:\path\to\your\choreme.exe
# - Startup directory: C:\path\to\your\choreme
# - Arguments: (leave empty)

# Start the service
net start ChoreMe
```

### Windows Firewall Configuration

If accessing from other devices on your network:

```cmd
# Run as Administrator
netsh advfirewall firewall add rule name="ChoreMe" dir=in action=allow protocol=TCP localport=8080
```

### Troubleshooting Windows Deployment

#### Database Connection Issues

**SQLite:**
- Ensure the directory `C:\choreme\data` exists
- Check file permissions on the SQLite database file

**PostgreSQL:**
- Verify PostgreSQL service is running: `services.msc` → look for "postgresql"
- Test connection: `psql -U postgres -h localhost -c "SELECT version();"`
- Check if port 5432 is blocked by firewall

**MySQL:**
- Verify MySQL service is running: `services.msc` → look for "MySQL"
- Test connection: `mysql -u root -p -e "SELECT VERSION();"`
- Check if port 3306 is blocked by firewall

#### Common Issues

1. **"go: command not found"**
   - Restart Command Prompt after installing Go
   - Check Go is in your PATH: `echo %PATH%`

2. **Permission denied errors**
   - Run Command Prompt as Administrator
   - Check antivirus isn't blocking the executable

3. **Port 8080 already in use**
   - Change PORT in `.env` file to another port (e.g., 8081)
   - Or find what's using port 8080: `netstat -ano | findstr :8080`

4. **Migration fails**
   - Ensure database credentials are correct in `.env`
   - Check database service is running
   - Verify database exists and user has permissions

### Windows Performance Tips

1. **Use SSD storage** for SQLite database files
2. **Exclude database directory** from Windows Defender real-time scanning
3. **Set Windows power plan** to "High Performance" for server use
4. **Configure Windows Update** to avoid automatic restarts

### Updating ChoreMe on Windows

```cmd
# Stop the application (Ctrl+C if running in terminal, or stop service)
# Pull latest code
git pull origin main

# Rebuild
go build -o choreme.exe cmd/choreme/main.go
go build -o migrate.exe cmd/migrate/main.go

# Run any new migrations
migrate.exe up

# Restart the application
choreme.exe
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
