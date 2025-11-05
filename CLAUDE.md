# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChoreMe is a **production-ready** family chore management system with a modern Vue 3 + Vuetify frontend and a Go backend supporting multiple databases (SQLite, MySQL, PostgreSQL).

**Current Version:** 2.0.0

## Current State

### ✅ Fully Implemented Backend (Go)
- Complete Go backend with Gin framework
- Multi-database support (SQLite, MySQL, PostgreSQL)
- JWT authentication with role-based access control
- 29+ REST API endpoints
- Enhanced account management with:
  - Running balance tracking
  - Spending limits (daily/weekly/monthly)
  - Transfer system with admin approval
  - Interest accrual (monthly compound)
  - Transaction history with 7 types
- Background job scheduler for automated tasks
- Database migrations for all supported databases
- Comprehensive service layer with business logic
- Complete audit logging system

### ✅ Partially Implemented Frontend (Vue 3)
- Vue 3.4.15 with Composition API
- Vuetify 3.5.1 Material Design components
- Vite 5.0.11 build system
- TypeScript type safety throughout
- Pinia state management (auth, account stores)
- Vue Router with auth guards
- Axios API client with interceptors
- Login view component

### 🚧 Pending Frontend Work
- Register view
- Layout view (app shell with navigation)
- Dashboard view
- Account view (ledger with running balances)
- Transfers view (request and approve transfers)
- Users management view (admin)
- Spending limits management view
- Profile view (with interest rate config)
- Chores, rewards, and other existing features

### ✅ Complete Documentation
- [README.md](./README.md) - Comprehensive project overview
- [CHANGELOG.md](./CHANGELOG.md) - Version history and upgrade guides
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development setup and patterns
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API endpoint reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md) - Detailed backend docs

## Architecture

### Three-Layer Architecture (Implemented)

```
┌─────────────────────────────────────────────────────────┐
│                  ChoreMe 2.0 Architecture               │
├─────────────────────────────────────────────────────────┤
│  📱 Frontend - Vue 3 + Vuetify + TypeScript            │
│     • Vite build system                                 │
│     • Pinia state management                            │
│     • Vue Router with guards                            │
│     • Axios API client                                  │
├─────────────────────────────────────────────────────────┤
│  🔗 Backend - Go + Gin Framework                       │
│     • JWT authentication                                │
│     • Role-based access control                         │
│     • Service layer (business logic)                    │
│     • Store layer (database abstraction)                │
│     • Background job scheduler                          │
├─────────────────────────────────────────────────────────┤
│  💾 Database - Multi-backend Support                   │
│     • SQLite (embedded)                                 │
│     • MySQL/MariaDB                                     │
│     • PostgreSQL                                        │
│     • Unified interface across all databases            │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Go 1.22+ with Gin 1.10.0
- JWT authentication (golang-jwt/jwt v5.2.1)
- shopspring/decimal 1.4.0 for precise monetary calculations
- Database drivers: SQLite 1.14.24, MySQL 1.8.1, PostgreSQL (lib/pq 1.10.9)
- golang-migrate/migrate v4.17.1 for migrations

**Frontend:**
- Vue 3.4.15 with Composition API
- Vuetify 3.5.1 (Material Design 3)
- Vite 5.0.11 (build tool)
- TypeScript 5.3.3
- Pinia 2.1.7 (state management)
- Vue Router 4.2.5
- Axios 1.6.5
- Chart.js 4.4.1 + vue-chartjs 5.3.0

**Infrastructure:**
- Docker with multi-stage builds
- Caddy 2.8.4 for automatic HTTPS
- Systemd service support (Linux)
- NSSM service support (Windows)

## Project Structure

### Backend (Go)

```
choreme/
├── cmd/choreme/main.go          # Application entry point
├── internal/
│   ├── api/                     # HTTP handlers
│   │   ├── server.go           # Router setup
│   │   ├── helpers.go          # Response helpers (includes version)
│   │   ├── auth.go             # Auth endpoints
│   │   ├── accounts.go         # Account management (15 endpoints)
│   │   ├── chores.go           # Chore management
│   │   ├── rewards.go          # Reward management
│   │   └── users.go            # User management
│   ├── auth/                    # JWT and password handling
│   ├── config/                  # Configuration management
│   ├── middleware/              # HTTP middleware
│   ├── model/                   # Domain models
│   │   └── models.go           # All data types including new account types
│   ├── scheduler/               # Background jobs
│   │   └── scheduler.go        # Interest accrual, limit resets
│   ├── service/                 # Business logic layer
│   │   ├── account.go          # Account operations (NEW in 2.0)
│   │   ├── chore.go            # Chore operations
│   │   └── reward.go           # Reward operations
│   ├── store/                   # Database abstraction
│   │   ├── interface.go        # Store interface (extended for accounts)
│   │   ├── factory.go          # Database factory
│   │   ├── sqlite/             # SQLite implementation
│   │   │   ├── sqlite.go
│   │   │   └── sqlite_accounts.go  # NEW: Account operations
│   │   ├── mysql/              # MySQL implementation
│   │   │   ├── mysql.go
│   │   │   └── mysql_accounts.go   # NEW: Account operations
│   │   └── postgres/           # PostgreSQL implementation
│   │       ├── postgres.go
│   │       └── postgres_accounts.go # NEW: Account operations
│   └── version/                # Version management
│       └── version.go          # Centralized version (2.0.0)
├── migrations/                  # Database migrations
│   ├── sqlite/
│   │   ├── 001_initial.up.sql
│   │   └── 002_enhanced_accounts.up.sql  # NEW in 2.0
│   ├── mysql/
│   │   ├── 001_initial.up.sql
│   │   └── 002_enhanced_accounts.up.sql  # NEW in 2.0
│   └── postgres/
│       ├── 001_initial.up.sql
│       └── 002_enhanced_accounts.up.sql  # NEW in 2.0
├── VERSION                      # Centralized version file
└── go.mod                       # Go dependencies
```

### Frontend (Vue 3)

```
web/
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── api/
│   │   └── client.ts           # API client (Axios) - implemented
│   ├── components/              # Reusable components (pending)
│   ├── plugins/
│   │   └── vuetify.ts          # Vuetify config - implemented
│   ├── router/
│   │   └── index.ts            # Vue Router - implemented
│   ├── stores/                  # Pinia stores
│   │   ├── auth.ts             # Auth state - implemented
│   │   └── account.ts          # Account state - implemented
│   ├── types/
│   │   └── index.ts            # TypeScript types - implemented
│   ├── views/                   # Page components
│   │   ├── LoginView.vue       # ✅ Implemented
│   │   ├── RegisterView.vue    # 🚧 Pending
│   │   ├── LayoutView.vue      # 🚧 Pending
│   │   ├── DashboardView.vue   # 🚧 Pending
│   │   ├── AccountView.vue     # 🚧 Pending (KEY FEATURE)
│   │   ├── TransfersView.vue   # 🚧 Pending (KEY FEATURE)
│   │   ├── UsersView.vue       # 🚧 Pending
│   │   └── ...                 # 🚧 Other views pending
│   ├── App.vue                  # Root component - implemented
│   └── main.ts                  # Application entry - implemented
├── package.json                 # npm dependencies (version: 2.0.0)
├── vite.config.ts              # Vite config - implemented
└── tsconfig.json               # TypeScript config - implemented
```

## Key Features (Version 2.0)

### Enhanced Account Management (NEW)

#### Transaction Types
- **earn** - Complete chores to earn money
- **spend** - Redeem rewards
- **deposit** - Admin adds money (e.g., birthday gifts)
- **withdrawal** - Worker withdraws money (spending limit checked)
- **transfer** - Transfer between users (admin approval required)
- **interest** - Monthly compound interest accrual
- **adjust** - Admin manual balance adjustments

#### Running Balance
- Auto-calculated on each ledger insert
- Displayed in ledger entries
- No window functions needed (pre-calculated)

#### Spending Limits
- Daily, weekly, monthly limits per user
- Automatic tracking and enforcement
- Block when limit reached
- Warn with suggested amount when would exceed
- Automatic reset on schedule:
  - Daily: midnight
  - Weekly: Sunday midnight
  - Monthly: 1st midnight
- Admin can manually reset

#### Transfer System
- Worker creates transfer request
- Admin reviews pending queue
- Admin approves or rejects
- Atomic transaction (debit sender, credit receiver)
- Complete audit trail
- Workers cannot see other workers' balances

#### Interest Accrual
- Configurable annual rate per user (default: 0%)
- Monthly compound calculation
- Automatic accrual on 1st at 1:00 AM
- Only positive balances earn interest
- System admin can trigger manual accrual

### Background Jobs (Implemented)

The scheduler runs two recurring jobs:

1. **Interest Accrual** - Monthly on 1st at 1:00 AM
   - Calculates monthly interest for all users
   - Posts ledger entries with type "interest"

2. **Spending Limit Resets**
   - Daily reset at midnight
   - Weekly reset on Sunday midnight
   - Monthly reset on 1st midnight
   - Unblocks users who hit limits

## Development Workflow

### Adding a New Feature

1. **Backend:**
   - Update `internal/model/models.go` with new types
   - Add methods to `internal/store/interface.go`
   - Implement for SQLite, MySQL, PostgreSQL in respective store files
   - Create service in `internal/service/` if complex business logic
   - Add API handlers in `internal/api/`
   - Register routes in `internal/api/server.go`
   - Create database migrations for all databases

2. **Frontend:**
   - Add TypeScript types in `web/src/types/index.ts`
   - Add API methods in `web/src/api/client.ts`
   - Create or update Pinia store in `web/src/stores/`
   - Create Vue components/views
   - Add routes in `web/src/router/index.ts`

3. **Documentation:**
   - Update API_REFERENCE.md with new endpoints
   - Update CHANGELOG.md with changes
   - Increment version in VERSION file if releasing

### Database Patterns

**Always implement for all three databases:**

```go
// SQLite uses:
// - ? placeholders
// - INTEGER for booleans (0/1)
// - julianday() for date math
// - CURRENT_TIMESTAMP for timestamps

// MySQL uses:
// - ? placeholders
// - TINYINT(1) for booleans
// - NOW(), DATE_ADD() for date math
// - CURRENT_TIMESTAMP for timestamps

// PostgreSQL uses:
// - $1, $2, $3 placeholders
// - BOOLEAN for booleans
// - INTERVAL '30 days' for date math
// - CURRENT_TIMESTAMP for timestamps
```

### TypeScript Patterns

**Always define types matching Go models:**

```typescript
// Match Go model exactly
export interface LedgerEntry {
  id: number
  user_id: number
  type: LedgerType
  amount: string  // Decimal as string from backend
  description?: string
  running_balance: string  // NEW in 2.0
  created_at: string
}

// Use string literals for enums
export type LedgerType = 'earn' | 'spend' | 'deposit' | 'withdrawal' | 'transfer' | 'interest' | 'adjust'
```

### Vue Component Patterns

**Use Composition API with `<script setup>`:**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMyStore } from '@/stores/mystore'
import type { MyType } from '@/types'

const store = useMyStore()
const data = ref<MyType[]>([])

onMounted(async () => {
  await store.fetchData()
})

// Component logic here
</script>

<template>
  <!-- Vuetify components here -->
</template>
```

## Code Conventions

### Go Conventions
- Use `gofmt` for formatting
- Export functions/types start with capital letter
- Document all exported functions
- Handle all errors explicitly
- Use context for cancellation
- Use `decimal.Decimal` for money, never float64

### Vue/TypeScript Conventions
- Use `<script setup>` syntax
- Define props with TypeScript: `defineProps<{ ... }>()`
- Define emits with TypeScript: `defineEmits<{ ... }>()`
- Use `ref` for primitives, `reactive` for objects
- Use `computed` for derived state
- Prefix private variables with underscore in stores

### File Naming
- Go: lowercase with underscores (e.g., `sqlite_accounts.go`)
- Vue: PascalCase (e.g., `AccountView.vue`)
- TypeScript: camelCase (e.g., `client.ts`)

## Testing

### Backend Testing

```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package
go test ./internal/service/...
```

### Frontend Testing

```bash
cd web

# Run tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint
```

## Common Tasks

### Update Version

When releasing a new version:

```bash
# 1. Update VERSION file
echo "2.1.0" > VERSION

# 2. Update internal/version/version.go
sed -i 's/Version = ".*"/Version = "2.1.0"/' internal/version/version.go

# 3. Update web/package.json
cd web
npm version 2.1.0
cd ..

# 4. Update CHANGELOG.md
# Add new version entry with changes

# 5. Commit and tag
git add VERSION internal/version/version.go web/package.json CHANGELOG.md
git commit -m "Bump version to 2.1.0"
git tag v2.1.0
git push origin main --tags
```

### Create Database Migration

```bash
# Create files for all databases
touch migrations/sqlite/003_my_feature.up.sql
touch migrations/sqlite/003_my_feature.down.sql
touch migrations/mysql/003_my_feature.up.sql
touch migrations/mysql/003_my_feature.down.sql
touch migrations/postgres/003_my_feature.up.sql
touch migrations/postgres/003_my_feature.down.sql

# Remember: Different SQL syntax for each database!
```

### Run Backend in Development

```bash
# SQLite (default)
go run cmd/choreme/main.go

# PostgreSQL
DB_TYPE=postgres DB_HOST=localhost DB_PORT=5432 DB_NAME=choreme_dev DB_USER=choreme DB_PASS=dev go run cmd/choreme/main.go

# With live reload (using air)
air
```

### Run Frontend in Development

```bash
cd web
npm run dev

# Frontend: http://localhost:3000
# API proxied to: http://localhost:8080
```

## Pending Implementation Tasks

### High Priority (Core Functionality)

1. **AccountView.vue** - Ledger display with running balance
   - Show transaction history
   - Display running balance after each transaction
   - Filter by transaction type
   - Pagination

2. **TransfersView.vue** - Transfer management
   - Create transfer request (worker)
   - View pending transfers (admin)
   - Approve/reject transfers (admin)
   - View transfer history

3. **DashboardView.vue** - Overview page
   - Current balance
   - Recent transactions
   - Pending chores
   - Quick actions

4. **LayoutView.vue** - App shell
   - Navigation drawer
   - App bar with user menu
   - Responsive layout
   - Logout functionality

### Medium Priority (Enhanced Features)

5. **UsersView.vue** - User management (admin)
   - List users
   - Set spending limits
   - Configure interest rates
   - View user balances

6. **ProfileView.vue** - User profile
   - Edit profile information
   - View account statistics
   - Interest rate display (read-only for workers)

7. **RegisterView.vue** - Registration page
   - First user registration (creates household)
   - Join household with invite code

### Lower Priority (Future)

8. **Account Statements** - Generate statements
   - HTML view
   - PDF export
   - Charts and statistics

9. **Database Tools**
   - SQLite ↔ MariaDB conversion
   - JSON backup/restore utility

## Important Notes for AI Assistants

### When Working on This Codebase:

1. **Always check existing patterns** before implementing new features
2. **Implement for all three databases** (SQLite, MySQL, PostgreSQL) when touching store layer
3. **Update TypeScript types** to match Go models exactly
4. **Run migrations automatically** on backend startup (already configured)
5. **Use decimal.Decimal** for all monetary values in Go
6. **Return amounts as strings** from API (JSON marshaling of decimal)
7. **Parse amounts as strings** in frontend TypeScript
8. **Always use context** for database operations in Go
9. **Check role permissions** in API handlers
10. **Update VERSION file** when adding features or fixing bugs

### Version Increment Policy:

- **MAJOR** (X.0.0) - Breaking changes (e.g., API incompatibility)
- **MINOR** (0.X.0) - New features (e.g., new endpoints)
- **PATCH** (0.0.X) - Bug fixes (e.g., fix calculation error)

Current: **2.0.0** - Complete rewrite with Vue 3 and enhanced accounts

### Key Files to Reference:

- **API Documentation**: [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md)
- **API Quick Reference**: [API_REFERENCE.md](./API_REFERENCE.md)
- **Development Patterns**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Deployment Instructions**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Version History**: [CHANGELOG.md](./CHANGELOG.md)
- **Project Overview**: [README.md](./README.md)

---

**Last Updated:** 2024-01-15 (Version 2.0.0)

**Current Status:** Backend fully implemented, frontend partially implemented (core infrastructure ready, views pending)
