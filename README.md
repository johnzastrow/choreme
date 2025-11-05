# ChoreMe - Family Chore Management System

**Version 2.0.0** - Complete rewrite with Vue 3 + Vuetify and enhanced account management features

A comprehensive family chore management system with a **mobile-first Progressive Web App** and backend API supporting multiple database backends (SQLite, MySQL/MariaDB, PostgreSQL).

## 📱 Mobile App Experience

**✨ Install like a native app** - Add to your phone's home screen for a complete app experience
**💰 Savings account system** - Track earnings with running balances and transaction history
**💸 Spending limits** - Configurable daily/weekly/monthly spending controls
**🔄 Transfers** - Request and approve money transfers between family members
**📈 Interest accrual** - Automatic monthly compound interest (configurable per user)
**📊 Account statements** - Generate HTML/PDF statements with charts and statistics
**🔔 Smart notifications** - Get reminders for due chores and updates on earnings
**👨‍👩‍👧‍👦 Family-focused** - Each family member has their own secure view and data

## What's New in 2.0

### Enhanced Savings Account Features
- **Running Balance** - See cumulative balance after each transaction
- **Transaction Types** - Earn, spend, deposit, withdrawal, transfer, interest, adjust
- **Manual Deposits** - Admins can add money (e.g., "Birthday money from grandma")
- **Manual Withdrawals** - Workers request withdrawals with spending limit checks
- **Transfer System** - Request transfers between users with admin approval workflow
- **Interest Accrual** - Monthly compound interest (rate configurable per user, default 0%)
- **Spending Limits** - Daily/weekly/monthly limits with automatic reset and enforcement
- **Account Statements** - Generate statements with charts and transaction history (HTML/PDF)

### Modern Frontend
- **Vue 3 + Vuetify** - Modern Material Design component framework
- **TypeScript** - Complete type safety across frontend and backend
- **Vite** - Lightning-fast build tool and development server
- **Pinia** - Modern state management with composition API
- **Reactive UI** - Real-time updates with computed properties and watchers

### Backend Enhancements
- **Background Jobs** - Automatic interest accrual and spending limit resets
- **Database Conversion** - Migrate between SQLite and MariaDB
- **Enhanced Ledger** - Running balance auto-calculated on insert
- **Audit Trail** - Complete logging of all account operations
- **JSON Backup/Restore** - Data portability and backup utility

## Features

### 💰 Enhanced Account Management

#### Transaction Types
- **Earn** - Complete chores to earn money/points
- **Spend** - Redeem rewards and make purchases
- **Deposit** - Admin adds money (birthday gifts, allowance, etc.)
- **Withdrawal** - Worker-initiated, spending limit checked
- **Transfer** - Move money between users (requires admin approval)
- **Interest** - Automatic monthly compound interest
- **Adjust** - Admin manual balance adjustments with notes

#### Spending Limits
- Configurable per user: daily, weekly, monthly limits
- Automatic reset on schedule (daily at midnight, weekly on Sunday, monthly on 1st)
- Block transactions when limit reached
- Warn and suggest maximum amount when transaction would exceed limit
- Admin can manually reset limits anytime
- Visual indicators showing remaining balance before limit

#### Transfers Between Users
- Worker initiates transfer request with amount and description
- Request enters pending queue for admin review
- Admin can approve or reject with reason
- On approval: debit sender, credit receiver atomically
- Complete audit trail of all transfer activity
- Workers cannot see other workers' balances

#### Interest Accrual
- Configurable annual interest rate per user (default: 0%)
- Monthly compound calculation (annual rate / 12)
- Automatic accrual on 1st of each month at 1:00 AM
- Only positive balances earn interest
- System admins can trigger manual accrual
- Interest transactions visible in ledger with type "interest"

#### Account Statements
- Generate detailed statements with date range
- Transaction history with running balance
- Charts: spending by category, earnings over time
- Statistics: total earned, total spent, average daily balance
- Export formats: HTML (viewable) and PDF (printable)
- Filterable by transaction type and date range

### 🏠 Family Management
- **Household Organization** - Multi-family support with invite codes
- **User Roles** - System admin, admin, manager, worker, and observer roles
- **Privacy Controls** - Workers only see their own chores and earnings
- **Invite System** - Secure family member onboarding

### ✅ Chore Management
- **Smart Assignment** - Assign chores to multiple family members
- **Progress Tracking** - Percentage-based completion monitoring
- **Due Date Management** - Automatic late penalty calculations
- **Photo Proof** - Camera integration with automatic image compression
- **Recurring Patterns** - Daily, weekly, monthly, or custom schedules
- **Auto-approval** - Configurable trust system for experienced workers

### 💰 Earnings & Rewards
- **Decimal Precision** - Accurate monetary tracking with shopspring/decimal
- **Complete Ledger** - Full transaction history with running balance
- **Reward Store** - Family-customizable reward redemption system
- **Balance Tracking** - Real-time earnings and spending visibility
- **Manual Adjustments** - Admin controls for special circumstances

### 🔒 Security & Compliance
- **Audit Trail** - Complete logging of all user actions
- **Data Encryption** - JWT tokens and password hashing
- **CORS Protection** - Configurable cross-origin security
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Graceful failure management

## Technology Stack

### Backend (Go)
- **Framework**: Gin 1.10.0 - High-performance HTTP web framework
- **Authentication**: JWT (golang-jwt/jwt v5.2.1) - Token-based auth
- **Database**: SQLite 1.14.24 / MySQL 1.8.1 / PostgreSQL (lib/pq 1.10.9)
- **Decimals**: shopspring/decimal 1.4.0 - Precise monetary calculations
- **Migrations**: golang-migrate/migrate v4.17.1 - Database versioning
- **Configuration**: caarlos0/env v10.0.0 - Environment variables
- **Security**: golang.org/x/crypto - Password hashing

### Frontend (Vue 3)
- **Framework**: Vue 3.4.15 - Progressive JavaScript framework
- **UI Library**: Vuetify 3.5.1 - Material Design component library
- **Router**: Vue Router 4.2.5 - Official Vue routing
- **State**: Pinia 2.1.7 - Intuitive Vue state management
- **Build**: Vite 5.0.11 - Next generation frontend tooling
- **HTTP Client**: Axios 1.6.5 - Promise-based HTTP client
- **Charts**: Chart.js 4.4.1 + Vue-ChartJs 5.3.0 - Data visualization
- **Utilities**: @vueuse/core 10.7.2 - Composition API utilities
- **TypeScript**: Full type safety with TypeScript 5.3.3

### Database Support
- **SQLite** - Embedded, zero-configuration (perfect for single families)
- **MySQL/MariaDB** - Traditional web hosting, moderate scale
- **PostgreSQL** - Advanced features, high concurrency, large families

### Infrastructure
- **Deployment**: Docker with multi-stage builds
- **Proxy**: Caddy 2.8.4-alpine - Automatic HTTPS and reverse proxy
- **Logging**: Structured JSON logging with configurable levels
- **Monitoring**: Built-in health checks and metrics

## Quick Start

### Prerequisites

| Component | Minimum | Recommended | Purpose |
|-----------|---------|-------------|---------|
| **Go** | 1.22+ | 1.22.8+ | Backend API server |
| **Node.js** | 18.0+ | 20+ LTS | Vue 3 frontend |
| **Database** | SQLite (embedded) | PostgreSQL 17+ | Data storage |
| **Docker** | 20.10+ | Latest | Containerized deployment |

### Quick Verification
```bash
go version      # Should show: go1.22+
node --version  # Should show: v18.0+ or v20+
npm --version   # Should show: 9.0+ or 10+
```

### Development Setup

#### Option 1: Full Development (Backend + Frontend)

**Terminal 1 - Backend:**
```bash
# Clone repository
git clone https://github.com/your-org/choreme.git
cd choreme

# Configure environment
cp .env.example .env
# Edit .env: Set DB_TYPE, JWT_SECRET, etc.

# Install Go dependencies and run
go mod tidy
go run cmd/choreme/main.go

# Backend running at http://localhost:8080
```

**Terminal 2 - Frontend:**
```bash
# Install and run Vue 3 frontend
cd web
npm install
npm run dev

# Frontend running at http://localhost:3000
# API proxied to http://localhost:8080
```

#### Option 2: Docker Deployment

```bash
# Clone repository
git clone https://github.com/your-org/choreme.git
cd choreme

# SQLite (simplest)
docker-compose up choreme

# PostgreSQL (recommended for production)
docker-compose --profile postgres up

# MySQL/MariaDB
docker-compose --profile mysql up

# With reverse proxy (automatic HTTPS)
docker-compose --profile proxy up
```

#### Option 3: Production Build

```bash
# Build backend
go build -o choreme cmd/choreme/main.go

# Build Vue frontend
cd web
npm install
npm run build

# Built files in web/dist/ can be served by backend
# Or deploy separately to Netlify/Vercel/CDN

# Run backend (serves built frontend from web/dist)
./choreme
```

## Configuration

### Backend Configuration (.env)

```env
# Database Configuration
DB_TYPE=sqlite              # sqlite, mysql, or postgres
DB_NAME=choreme.db          # Database name or file path

# For PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=choreme
DB_PASS=your_password
DB_SSL_MODE=disable

# For MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=choreme
DB_PASS=your_password

# Server Configuration
HOST=0.0.0.0
PORT=8080
GIN_MODE=release            # debug or release

# Security
JWT_SECRET=your-secure-random-key-change-this-in-production
CORS_ORIGINS=http://localhost:3000,https://your-domain.com

# Logging
LOG_LEVEL=info              # debug, info, warn, error
LOG_FORMAT=json             # json or text

# Background Jobs
ENABLE_SCHEDULER=true       # Enable interest accrual and limit resets
```

### Frontend Configuration (web/.env)

```env
# API Endpoint (for production build)
VITE_API_URL=https://your-api-domain.com/api/v1

# For development, Vite proxy is configured in vite.config.ts
```

## API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Health Check
```http
GET /health

Response:
{
  "status": "ok",
  "version": "2.0.0"
}
```

### Authentication Endpoints

#### Register First User (Creates Household)
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

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

### Account Management Endpoints

#### Deposit Money
```http
POST /api/v1/accounts/deposit
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "user_id": 2,
  "amount": "25.00",
  "description": "Birthday money from grandma"
}
```

#### Withdraw Money
```http
POST /api/v1/accounts/withdraw
Authorization: Bearer <worker_token>
Content-Type: application/json

{
  "amount": "10.00",
  "description": "Spending money for movies"
}

Response (on limit exceeded):
{
  "success": false,
  "error": "Transaction would exceed daily limit. Maximum allowed: 5.00",
  "limit_type": "daily",
  "suggested_amount": "5.00",
  "daily_remaining": "5.00"
}
```

#### Create Transfer Request
```http
POST /api/v1/accounts/transfer
Authorization: Bearer <worker_token>
Content-Type: application/json

{
  "to_user_id": 3,
  "amount": "15.00",
  "description": "Borrowing for game purchase"
}
```

#### Approve Transfer (Admin)
```http
PATCH /api/v1/accounts/transfer/{id}/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "notes": "Transfer approved"
}
```

#### Set Spending Limits (Admin)
```http
PUT /api/v1/accounts/spending-limits/{user_id}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "daily_limit": "20.00",
  "weekly_limit": "50.00",
  "monthly_limit": "150.00"
}
```

#### Set Interest Rate (Admin)
```http
PUT /api/v1/users/{id}/interest
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "interest_rate_annual": "5.00"
}
```

#### Get Ledger Entries
```http
GET /api/v1/accounts/ledger?limit=50&offset=0
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": 1,
        "user_id": 2,
        "type": "earn",
        "amount": "5.00",
        "description": "Completed: Wash dishes",
        "running_balance": "25.50",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 100
  }
}
```

For complete API documentation, see [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md).

## Project Structure

```
choreme/
├── cmd/
│   └── choreme/           # Main application entry point
├── internal/              # Backend Go code
│   ├── api/              # HTTP handlers and routing
│   │   ├── server.go     # Server setup and routes
│   │   ├── helpers.go    # Common response helpers
│   │   ├── auth.go       # Authentication endpoints
│   │   ├── accounts.go   # Account management endpoints
│   │   ├── chores.go     # Chore management endpoints
│   │   └── ...
│   ├── auth/             # JWT and password handling
│   ├── config/           # Configuration management
│   ├── middleware/       # HTTP middleware
│   ├── model/            # Domain models
│   ├── scheduler/        # Background jobs
│   ├── service/          # Business logic layer
│   │   ├── account.go    # Account management service
│   │   ├── chore.go      # Chore management service
│   │   └── ...
│   ├── store/            # Database abstraction layer
│   │   ├── interface.go  # Store interface
│   │   ├── factory.go    # Database factory
│   │   ├── sqlite/       # SQLite implementation
│   │   │   ├── sqlite.go
│   │   │   └── sqlite_accounts.go
│   │   ├── mysql/        # MySQL implementation
│   │   └── postgres/     # PostgreSQL implementation
│   └── version/          # Version management
├── migrations/           # Database migrations
│   ├── sqlite/          # SQLite-specific migrations
│   ├── mysql/           # MySQL-specific migrations
│   └── postgres/        # PostgreSQL-specific migrations
├── web/                  # Vue 3 Frontend
│   ├── public/          # Static assets
│   │   └── index.html
│   ├── src/
│   │   ├── api/         # API client
│   │   │   └── client.ts
│   │   ├── components/  # Reusable components
│   │   ├── plugins/     # Vuetify configuration
│   │   │   └── vuetify.ts
│   │   ├── router/      # Vue Router configuration
│   │   │   └── index.ts
│   │   ├── stores/      # Pinia stores
│   │   │   ├── auth.ts  # Authentication state
│   │   │   └── account.ts # Account state
│   │   ├── types/       # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── views/       # Page components
│   │   │   ├── LoginView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── AccountView.vue
│   │   │   └── ...
│   │   ├── App.vue      # Root component
│   │   └── main.ts      # Application entry
│   ├── package.json
│   ├── vite.config.ts   # Vite configuration
│   └── tsconfig.json    # TypeScript configuration
├── VERSION               # Centralized version number
├── .env.example         # Environment template
├── docker-compose.yml   # Docker orchestration
├── Dockerfile           # Container definition
├── go.mod              # Go dependencies
└── README.md           # This file
```

## Database Schema

### Core Tables
- **households** - Family/household groups
- **users** - Family members with roles and interest rates
- **chores** - Chore definitions
- **assignments** - Chore assignments to users
- **ledger** - Transaction history with running balance
- **rewards** - Reward store items
- **redemptions** - Reward redemption requests
- **audit_logs** - Complete audit trail

### Account Management Tables (New in 2.0)
- **accounts** - User savings accounts
- **spending_limits** - Daily/weekly/monthly spending controls
- **transfer_requests** - Transfer requests and approval workflow

### Key Schema Features
- **Running Balance** - Auto-calculated on each ledger insert
- **Decimal Precision** - DECIMAL(10,2) for all monetary values
- **Audit Trail** - Complete logging with user attribution
- **Referential Integrity** - Foreign keys with cascade deletes

For complete schema details, see migration files in `migrations/`.

## Background Jobs

The backend includes a built-in scheduler for automated tasks:

### Interest Accrual
- **Schedule**: Monthly on 1st at 1:00 AM
- **Process**: Calculates monthly compound interest for all users with positive balances
- **Formula**: `monthly_interest = balance * (annual_rate / 12 / 100)`
- **Logging**: Creates ledger entry with type "interest"

### Spending Limit Resets
- **Daily Reset**: Every day at midnight (00:00)
- **Weekly Reset**: Every Sunday at midnight
- **Monthly Reset**: 1st of each month at midnight
- **Process**: Resets spent amounts and unblocks users who hit limits

### Manual Triggers (System Admins)
```http
POST /api/v1/admin/jobs/interest
POST /api/v1/admin/jobs/reset-limits
Authorization: Bearer <system_admin_token>
```

## Deployment

### Linux Production Deployment

#### Systemd Service (Recommended)

**1. Build and Install:**
```bash
# Build application
git clone https://github.com/your-org/choreme.git
cd choreme
go build -o choreme cmd/choreme/main.go

# Build Vue frontend
cd web
npm install
npm run build
cd ..

# Install to system
sudo mkdir -p /opt/choreme
sudo cp choreme /opt/choreme/
sudo cp -r migrations /opt/choreme/
sudo cp -r web/dist /opt/choreme/web/

# Create data directory
sudo mkdir -p /var/lib/choreme
sudo useradd --system --home /var/lib/choreme --shell /bin/false choreme
sudo chown -R choreme:choreme /var/lib/choreme
```

**2. Configure:**
```bash
# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Create environment file
sudo tee /opt/choreme/.env > /dev/null <<EOF
DB_TYPE=sqlite
DB_NAME=/var/lib/choreme/choreme.db
JWT_SECRET=${JWT_SECRET}
HOST=0.0.0.0
PORT=8080
GIN_MODE=release
ENABLE_SCHEDULER=true
EOF

sudo chown choreme:choreme /opt/choreme/.env
sudo chmod 600 /opt/choreme/.env
```

**3. Create Systemd Service:**
```bash
sudo tee /etc/systemd/system/choreme.service > /dev/null <<EOF
[Unit]
Description=ChoreMe Family Chore Management
After=network.target

[Service]
Type=simple
User=choreme
Group=choreme
WorkingDirectory=/opt/choreme
ExecStart=/opt/choreme/choreme
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

**4. Enable and Start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable choreme
sudo systemctl start choreme
sudo systemctl status choreme
```

### Docker Production Deployment

```bash
# Build and run with Docker Compose
docker-compose --profile postgres up -d

# View logs
docker-compose logs -f choreme

# Stop services
docker-compose down
```

### Frontend Hosting Options

The Vue 3 frontend can be deployed separately for better scalability:

**Option 1: Served by Go Backend**
- Frontend built to `web/dist/`
- Backend serves static files automatically
- Simple deployment, single domain

**Option 2: Separate Static Hosting**
- Deploy to Netlify, Vercel, AWS S3, or CDN
- Configure `VITE_API_URL` to point to backend API
- Better performance, CDN distribution

**Netlify Example:**
```bash
cd web
npm run build

# Deploy to Netlify (requires Netlify CLI)
netlify deploy --prod --dir=dist
```

## Development

### Running Tests
```bash
# Backend tests
go test ./...

# Frontend tests
cd web
npm run test
```

### Database Migrations

#### Create Migration
```bash
# Create new migration files for all databases
touch migrations/sqlite/003_feature_name.up.sql
touch migrations/sqlite/003_feature_name.down.sql
touch migrations/mysql/003_feature_name.up.sql
touch migrations/mysql/003_feature_name.down.sql
touch migrations/postgres/003_feature_name.up.sql
touch migrations/postgres/003_feature_name.down.sql
```

#### Run Migrations
```bash
# Migrations run automatically on startup
# Or manually:
go run cmd/choreme/main.go --migrate
```

### Adding New Features

1. **Backend**: Update models → store interface → implement for all DBs → service layer → API handlers
2. **Frontend**: Add types → API client methods → Pinia store actions → Vue components
3. **Migration**: Create migration files for all database types
4. **Documentation**: Update API docs and README
5. **Version**: Increment version in `VERSION` file

## Monitoring and Maintenance

### Health Checks
```bash
# API health
curl http://localhost:8080/health

# Database connection
curl http://localhost:8080/api/v1/ping
```

### Logs
```bash
# Systemd logs
sudo journalctl -u choreme -f

# Docker logs
docker-compose logs -f choreme
```

### Backup

#### SQLite
```bash
# Stop service
sudo systemctl stop choreme

# Copy database file
sudo cp /var/lib/choreme/choreme.db /backup/choreme-$(date +%Y%m%d).db

# Start service
sudo systemctl start choreme
```

#### PostgreSQL/MySQL
```bash
# PostgreSQL backup
pg_dump -U choreme choreme > backup-$(date +%Y%m%d).sql

# MySQL backup
mysqldump -u choreme -p choreme > backup-$(date +%Y%m%d).sql
```

## Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check logs
sudo journalctl -u choreme -n 50

# Verify database permissions
ls -la /var/lib/choreme/

# Test database connection
go run cmd/choreme/main.go --test-db
```

**Frontend build fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**API 401 Unauthorized:**
- Check JWT_SECRET is set in backend .env
- Verify token is being sent in Authorization header
- Check token hasn't expired (default: 24 hours)

**Database migration errors:**
- Check migrations ran: Look for success message in logs
- Manually check schema: Use sqlite3, psql, or mysql client
- Reset database: Delete DB file/schema and restart (development only!)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

- **2.0.0** (Current) - Complete rewrite with Vue 3 + Vuetify and enhanced account management
- **1.0.0** (Legacy) - Original React implementation

## Documentation

- **[BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md)** - Complete backend API documentation
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development setup and patterns guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment instructions
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete API endpoint reference
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant context and project conventions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check documentation files in the repository
- Review API documentation at `/api/v1/docs`

---

**Built with ❤️ for families who want to make chores fun and rewarding**
