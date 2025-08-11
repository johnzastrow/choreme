# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChoreMe is a family-friendly progressive web application for managing household chores, tracking completion, and awarding points/money as decimal values. This is currently a planning repository containing comprehensive requirements and system design documentation.

## Current State

This repository is in the **planning/design phase** and contains:

- Detailed requirements specification (`requirements.md`)
- Complete system blueprint with database schema, API specification, and workflow diagrams
- Wireframe overview image (`docs/images/ChoreMe App Wireframe Overview.png`)

**No implementation code exists yet** - this is purely a specification and design repository.

## Architecture Overview

The planned system follows a **three-layer architecture**:

### Database Layer (PostgreSQL)
- **Core Tables**: households, users, chores, assignments, ledger, rewards, redemptions, audit_logs
- **User Roles**: system_admin, admin, manager, worker, observer
- **Decimal Precision**: All monetary/point values use DECIMAL(8,2) for precision
- **Audit Trail**: Complete event logging for all user actions

### Backend API (Planned: Go with Gin)
- **REST+JSON API** with JWT authentication
- **Key Features**: 
  - Chore assignment and completion tracking
  - Partial completion support (percentage-based)
  - Automatic late penalties
  - Photo proof storage (compressed to 500px max)
  - Offline sync conflict resolution
  - Recurring chore generation
- **Background Workers**: Notification queue, recurring chore scheduler

### Frontend (Planned: React PWA)
- **Mobile-first** responsive design with Tailwind CSS
- **PWA capabilities** for app-like installation
- **Offline support** with local storage sync
- **Key Views**: Today's chores, progress tracking, earnings ledger, reward store

## Key Business Rules

### Chore Management
- **Multi-assignment**: Single chores can be assigned to multiple users
- **Partial completion**: Workers can complete chores in increments (percentage-based)
- **Recurring patterns**: Daily, weekly, monthly, or custom intervals
- **Auto-approval**: Configurable trust system bypassing manual approval
- **Late penalties**: Configurable percentage reduction for overdue completions
- **Expiration**: Chores can be configured to disappear after X days past due date

### Earnings & Rewards
- **Unified currency**: Single points/money system (not dual currency)
- **Negative balances**: Allowed for spending beyond current earnings
- **Manager adjustments**: Admins can arbitrarily add/remove earnings with audit trail
- **Reward redemption**: Worker-initiated, admin-approved system

### Security & Privacy
- **Role-based access**: Workers see only their own chores and transactions
- **Complete isolation**: No cross-worker visibility of assignments or earnings
- **Audit logging**: All actions logged with user attribution and timestamps

## Development Approach (When Implementation Begins)

### Recommended Tech Stack
- **Backend**: Go with Gin framework, PostgreSQL, sqlx or sqlc
- **Frontend**: React with Tailwind CSS, PWA manifest
- **Database**: PostgreSQL for JSONB support and strong transactions
- **Deployment**: Docker containers with Caddy proxy for SSL

### Key Implementation Considerations
- Use `shopspring/decimal` package for precise monetary calculations
- Implement proper JWT middleware for role-based authorization
- Create background workers for recurring chore generation
- Implement image compression pipeline for proof photos
- Design conflict resolution for offline sync scenarios

### Testing Strategy
- Unit tests for business logic with testify
- Integration tests with test database
- API endpoint testing with proper role-based access validation

## File Structure (Planned)

When implementation begins, follow this Go project structure:
```
cmd/choreme/main.go          # Application bootstrap
internal/api/                # HTTP handlers and middleware  
internal/auth/               # JWT and password handling
internal/model/              # Domain models with decimal types
internal/store/              # Database layer (sqlx implementation)
internal/service/            # Business logic layer
internal/notify/             # Notification queue system
migrations/                  # SQL migration files
```

## Next Steps for Implementation

1. Set up Go module with required dependencies (Gin, sqlx, shopspring/decimal, etc.)
2. Create PostgreSQL schema from provided DDL
3. Implement core models with proper decimal handling
4. Build authentication system with JWT
5. Create API endpoints following the REST specification
6. Implement background workers for recurring tasks
7. Build React PWA frontend consuming the API

Refer to the complete system specification in `requirements.md` for detailed API endpoints, database schema, state diagrams, and workflow examples.