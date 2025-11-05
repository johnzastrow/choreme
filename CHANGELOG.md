# Changelog

All notable changes to ChoreMe will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-15

### Major Rewrite
Complete application rewrite with modern technologies and enhanced features.

### Added - Enhanced Account Management

#### Savings Account Features
- **Running Balance Display** - Cumulative balance shown after each transaction in ledger
- **Transaction Types** - Seven transaction types: earn, spend, deposit, withdrawal, transfer, interest, adjust
- **Manual Deposits** - Admins can add money with custom descriptions (e.g., "Birthday money from grandma")
- **Manual Withdrawals** - Workers can request withdrawals with automatic spending limit checks
- **Transfer System** - Complete workflow for transferring money between users
  - Worker initiates transfer request with amount and description
  - Admin reviews pending transfer queue
  - Admin approves or rejects with notes
  - Atomic transaction on approval (debit sender, credit receiver)
  - Complete audit trail of all transfers
- **Interest Accrual** - Monthly compound interest system
  - Configurable annual interest rate per user (default: 0%)
  - Automatic monthly calculation (annual rate / 12)
  - Scheduled accrual on 1st of each month at 1:00 AM
  - Manual trigger available for system admins
  - Interest posted as ledger transactions
- **Spending Limits** - Comprehensive spending control system
  - Daily, weekly, and monthly limit configuration per user
  - Automatic tracking of spent amounts across time periods
  - Blocking when limits reached
  - Warning with suggested amount when transaction would exceed limit
  - Automatic reset on schedule (daily midnight, weekly Sunday, monthly 1st)
  - Manual reset capability for admins
  - Visual indicators for remaining balance
- **Account Statements** - Generate detailed financial reports
  - Transaction history with running balances
  - Date range filtering
  - Charts: spending by category, earnings over time
  - Statistics: total earned, total spent, average daily balance
  - Export formats: HTML (viewable) and PDF (printable)
  - Transaction type filtering

#### Backend Enhancements
- **Background Job Scheduler** - Automatic recurring tasks
  - Interest accrual job (monthly on 1st at 1:00 AM)
  - Spending limit resets (daily, weekly, monthly)
  - Manual job triggers for system admins
  - Graceful shutdown handling
- **Database Schema Updates**
  - New `accounts` table for user savings accounts
  - New `spending_limits` table for limit tracking
  - New `transfer_requests` table for transfer workflow
  - Enhanced `ledger` table with running_balance column
  - Enhanced `users` table with interest rate fields
  - Complete migration files for SQLite, MySQL, and PostgreSQL
- **Service Layer** - New account management service
  - Deposit and withdrawal operations
  - Transfer creation and approval
  - Spending limit checks and enforcement
  - Interest rate configuration
  - Interest accrual calculations
  - Spending limit resets
- **API Endpoints** - 15 new account management endpoints
  - Deposit money (admin)
  - Withdraw money (worker, with limit check)
  - Create transfer request (worker)
  - List transfer requests (filtered by status)
  - Approve transfer (admin)
  - Reject transfer (admin)
  - Get/set spending limits (admin)
  - Check spending limit before transaction
  - Get user balance
  - Get ledger entries with running balance
  - Set interest rate (admin)
  - Trigger interest accrual (system admin)
  - Trigger spending limit reset (system admin)
  - Get account statement data
  - Export statement (HTML/PDF)

### Added - Frontend Rewrite

#### Vue 3 + Vuetify Implementation
- **Modern Frontend Stack**
  - Vue 3.4.15 with Composition API
  - Vuetify 3.5.1 for Material Design components
  - Vite 5.0.11 for lightning-fast builds
  - TypeScript 5.3.3 for complete type safety
  - Pinia 2.1.7 for state management
  - Vue Router 4.2.5 for routing
- **Responsive UI**
  - Mobile-first design philosophy
  - Material Design 3 components
  - Custom ChoreMe theme with blue/green/orange color scheme
  - Dark mode support (configurable)
- **Complete Type Safety**
  - TypeScript types for all API models
  - Type-safe API client with Axios
  - Type-safe store actions and getters
  - Type-safe component props and emits
- **State Management**
  - Auth store with role-based computed properties
  - Account store for ledger, transfers, and spending limits
  - Reactive balance updates
  - Automatic token management
- **API Integration**
  - Axios client with request/response interceptors
  - Automatic JWT token injection
  - 401 auto-redirect to login
  - Error handling with user-friendly messages
- **Router Configuration**
  - Protected routes with auth guards
  - Role-based route access (manager, admin)
  - Nested routes for app layout
  - Redirect logic for unauthenticated users

### Changed - Technology Stack Updates

#### Backend Updates
- Go 1.22+ - Latest stable Go version
- Gin 1.10.0 - Updated HTTP framework
- JWT v5.2.1 - Latest JWT library with security improvements
- shopspring/decimal 1.4.0 - Precise decimal calculations
- golang-migrate/migrate v4.17.1 - Database migration tool
- Latest database drivers (SQLite 1.14.24, MySQL 1.8.1, PostgreSQL via lib/pq 1.10.9)

#### Frontend Updates
- **Replaced React 18 with Vue 3.4**
  - Migration from Create React App to Vite
  - Composition API instead of React Hooks
  - Pinia instead of Redux/Context
- **Replaced Tailwind CSS with Vuetify 3**
  - Material Design 3 components
  - Built-in responsive utilities
  - Comprehensive component library
- **Build Tool Migration**
  - Vite replaces Webpack (Create React App)
  - Significantly faster dev server startup
  - Instant HMR (Hot Module Replacement)
  - Optimized production builds

### Added - Infrastructure & DevOps

#### Version Management
- Centralized VERSION file (2.0.0)
- Version package in Go (internal/version)
- Version exposed in API health check endpoint
- Version in package.json for frontend
- Version increment policy documented

#### Documentation
- Comprehensive README.md with Vue 3 focus
- BACKEND_IMPLEMENTATION.md with complete API docs
- CHANGELOG.md (this file) for version tracking
- DEVELOPMENT.md for development workflows
- DEPLOYMENT.md for production deployment
- API_REFERENCE.md for API endpoint reference
- Updated CLAUDE.md with current implementation status

#### Database Tools (Planned)
- SQLite ↔ MariaDB conversion utility
- JSON backup/restore tool for data portability

### Fixed
- Decimal precision handling across all monetary transactions
- Running balance calculation consistency
- Spending limit enforcement edge cases
- Transfer approval atomicity
- Interest accrual edge cases for month boundaries

### Security
- Enhanced JWT token validation
- Role-based access control for all new endpoints
- Spending limit bypass prevention
- Transfer approval workflow prevents unauthorized transfers
- Audit logging for all account operations
- Input validation for all monetary amounts

### Performance
- Running balance pre-calculated on insert (no window functions needed)
- Indexed database queries for ledger and transfers
- Vite build optimization for frontend
- Lazy loading of Vue components
- Efficient Vuetify component tree-shaking

### Database Migrations
- **002_enhanced_accounts.up.sql** - Adds account management tables
  - Creates accounts, spending_limits, transfer_requests tables
  - Adds running_balance to ledger
  - Adds interest fields to users
  - Implemented for SQLite, MySQL, and PostgreSQL

## [1.0.0] - 2023-12-01

### Initial Release

#### Core Features
- **Multi-Database Backend** - SQLite, MySQL, PostgreSQL support
- **RESTful API** - 29+ endpoints with JWT authentication
- **React PWA Frontend** - Mobile-first progressive web app
- **Authentication System** - Login, registration, household management
- **Chore Management** - Create, assign, complete, approve chores
- **Earnings System** - Basic ledger with transaction history
- **Reward Store** - Create and redeem rewards
- **Role-Based Access** - System admin, admin, manager, worker, observer roles
- **Photo Proof** - Camera integration for chore completion
- **Offline Support** - Service workers and IndexedDB
- **Push Notifications** - Web push for chore reminders

#### Technology Stack
- **Backend**: Go 1.21, Gin framework, JWT authentication
- **Frontend**: React 18, Tailwind CSS, Create React App
- **Database**: SQLite, MySQL 8, PostgreSQL 15
- **Deployment**: Docker with Docker Compose

#### Database Schema
- households, users, chores, assignments, ledger, rewards, redemptions, audit_logs

---

## Version Numbering Policy

ChoreMe follows [Semantic Versioning](https://semver.org/):

- **MAJOR version** (X.0.0) - Incompatible API changes, major rewrites
- **MINOR version** (0.X.0) - New features, backwards compatible
- **PATCH version** (0.0.X) - Bug fixes, backwards compatible

### When to Increment

**MAJOR (breaking changes)**:
- Database schema changes requiring manual migration
- API endpoint removals or incompatible changes
- Major technology stack changes (e.g., 1.0.0 React → 2.0.0 Vue)

**MINOR (new features)**:
- New API endpoints
- New frontend features
- New database tables (with automatic migrations)
- Enhanced existing features

**PATCH (bug fixes)**:
- Bug fixes with no API changes
- Security patches
- Performance improvements
- Documentation updates

### Version Update Checklist

When incrementing version:
1. Update `VERSION` file
2. Update `internal/version/version.go`
3. Update `web/package.json`
4. Add entry to `CHANGELOG.md` with date
5. Commit with message: `Bump version to X.Y.Z`
6. Create git tag: `git tag vX.Y.Z`
7. Push with tags: `git push origin main --tags`

---

## Upgrade Guides

### Upgrading from 1.x to 2.0

#### Breaking Changes
1. **Frontend Technology** - React replaced with Vue 3
   - Complete UI rewrite required if customized
   - No migration path for React customizations
   - API remains compatible

2. **Database Schema** - New tables and columns
   - Run migrations automatically on startup
   - Or manually: `go run cmd/choreme/main.go --migrate`
   - Backup database before upgrading!

3. **Configuration** - New environment variables
   - `ENABLE_SCHEDULER` - Enable background jobs (default: true)
   - `VITE_API_URL` - Frontend API configuration (replaces REACT_APP_API_URL)

#### Migration Steps

**Step 1: Backup Database**
```bash
# SQLite
cp /path/to/choreme.db /backup/choreme-pre-2.0.db

# PostgreSQL
pg_dump -U choreme choreme > backup-pre-2.0.sql

# MySQL
mysqldump -u choreme -p choreme > backup-pre-2.0.sql
```

**Step 2: Update Backend**
```bash
# Pull latest code
git pull origin main
git checkout v2.0.0

# Update dependencies
go mod tidy

# Build new binary
go build -o choreme cmd/choreme/main.go

# Migrations run automatically on startup
./choreme
```

**Step 3: Build New Frontend**
```bash
cd web
npm install
npm run build

# Frontend now in web/dist/
```

**Step 4: Verify Migration**
```bash
# Check health endpoint
curl http://localhost:8080/health
# Should return: {"status":"ok","version":"2.0.0"}

# Check new account endpoints
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/accounts/balance
```

**Step 5: Configure New Features**
```bash
# Enable background scheduler (in .env)
echo "ENABLE_SCHEDULER=true" >> .env

# Restart service
systemctl restart choreme  # or docker-compose restart
```

#### Data Compatibility
- All 1.x data remains accessible in 2.0
- Existing ledger entries retain their values
- Running balance calculated retroactively for existing entries
- No data loss during migration

#### API Compatibility
- All 1.x API endpoints remain functional
- New 2.0 endpoints are additive only
- Authentication tokens remain valid
- No breaking changes to existing endpoints

---

## Roadmap

### Version 2.1 (Planned)
- [ ] Account statement generation (HTML/PDF)
- [ ] Database conversion tool (SQLite ↔ MariaDB)
- [ ] JSON backup/restore utility
- [ ] Complete Vue 3 views (Dashboard, Account, Transfers)
- [ ] Enhanced charts with vue-chartjs
- [ ] Mobile responsive account management

### Version 2.2 (Planned)
- [ ] Email notifications via SMTP
- [ ] Advanced reporting and analytics
- [ ] Recurring chore automation improvements
- [ ] Family calendar integration
- [ ] Multi-language support (i18n)

### Version 3.0 (Future)
- [ ] Native mobile apps (iOS/Android)
- [ ] Real-time updates with WebSockets
- [ ] Voice assistant integration
- [ ] Gamification features (badges, streaks)
- [ ] Advanced parental controls

---

For more information, see:
- [README.md](./README.md) - Project overview and quick start
- [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md) - Backend API documentation
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
