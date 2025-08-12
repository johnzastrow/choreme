# ChoreMe - Family Chore Management System

A complete family chore management system with a **mobile-first Progressive Web App** and backend API supporting multiple database backends (SQLite, MySQL/MariaDB, PostgreSQL).

## 📱 Mobile App Experience

**✨ Install like a native app** - Add to your phone's home screen for a complete app experience  
**📷 Built-in camera** - Take photos directly in the app as proof of chore completion  
**🔄 Works offline** - Complete chores without internet, syncs automatically when reconnected  
**🔔 Smart notifications** - Get reminders for due chores and updates on earnings  
**💰 Real-time earnings** - See your balance update instantly when chores are approved  
**👨‍👩‍👧‍👦 Family-focused** - Each family member has their own secure view and data

## Features

### 📱 Mobile Progressive Web App
- **Mobile-First Design**: Touch-optimized interface with native app experience
- **PWA Ready**: Installable on home screen with offline support
- **Responsive UI**: Works perfectly on phones, tablets, and desktops
- **Camera Integration**: Built-in photo capture for chore proof
- **Push Notifications**: Real-time reminders and status updates
- **Offline-First**: Works without internet, syncs when reconnected
- **Background Sync**: Automatic data synchronization when online
- **App-like Experience**: Standalone display mode, bottom navigation

### 🔧 Backend API System
- **Multi-Database Support**: Choose between SQLite, MySQL/MariaDB, or PostgreSQL
- **RESTful API**: 29+ endpoints with comprehensive functionality
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: System admin, admin, manager, worker, and observer roles
- **Auto-scaling Architecture**: Database abstraction supports growth

### 🏠 Family Management
- **Household Organization**: Multi-family support with invite codes
- **User Roles**: Granular permissions for different family members
- **Privacy Controls**: Workers only see their own chores and earnings
- **Invite System**: Secure family member onboarding

### ✅ Chore Management
- **Smart Assignment**: Assign chores to multiple family members
- **Progress Tracking**: Percentage-based completion monitoring
- **Due Date Management**: Automatic late penalty calculations
- **Photo Proof**: Camera integration with automatic image compression
- **Recurring Patterns**: Daily, weekly, monthly, or custom schedules
- **Auto-approval**: Configurable trust system for experienced workers

### 💰 Earnings & Rewards
- **Decimal Precision**: Accurate monetary tracking with shopspring/decimal
- **Complete Ledger**: Full transaction history and audit trail
- **Reward Store**: Family-customizable reward redemption system
- **Balance Tracking**: Real-time earnings and spending visibility
- **Manual Adjustments**: Admin controls for special circumstances

### 🔒 Security & Compliance
- **Audit Trail**: Complete logging of all user actions
- **Data Encryption**: JWT tokens and password hashing
- **CORS Protection**: Configurable cross-origin security
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Graceful failure management

## Dependencies & Prerequisites

ChoreMe supports three deployment modes with different dependency requirements:

### Option 1: Go Backend Only (Simple HTML UI)
**Minimum Requirements:**
- Go 1.22 or later
- Database (SQLite embedded, or MySQL/PostgreSQL)

**Quick Start:**
```bash
git clone https://github.com/your-org/choreme.git
cd choreme
go mod tidy
go build -o choreme cmd/choreme/main.go
./choreme
```

### Option 2: Full PWA Experience (React Frontend + Go Backend) 
**Requirements:**
- Go 1.22 or later
- Node.js 18+ and npm
- Database (SQLite embedded, or MySQL/PostgreSQL)

**Quick Start:**
```bash
# Terminal 1: Backend
git clone https://github.com/your-org/choreme.git
cd choreme
go mod tidy
go run cmd/choreme/main.go

# Terminal 2: Frontend
cd web
npm install
npm start
```

### Option 3: Docker Deployment
**Requirements:**
- Docker and Docker Compose

**Quick Start:**
```bash
git clone https://github.com/your-org/choreme.git
cd choreme
docker-compose up choreme
```

## Quick Start (All Platforms)

### Prerequisites Overview

| Component | Minimum | Recommended | Purpose |
|-----------|---------|-------------|---------|
| **Go** | 1.22+ | 1.22+ | Backend API server |
| **Node.js** | 18+ | 22+ LTS | PWA frontend (optional) |
| **Database** | SQLite (embedded) | PostgreSQL 17+ | Data storage |
| **Docker** | 20.10+ | Latest | Containerized deployment |
| **Memory** | 512MB | 2GB | Application runtime |
| **Storage** | 100MB | 1GB | Database and logs |

## Build Instructions

ChoreMe provides multiple build options depending on your needs:

### Option 1: Go Backend with Embedded UI
This builds the backend with an embedded simple HTML UI (no Node.js required):

**Linux/macOS:**
```bash
# Clone and setup
git clone https://github.com/your-org/choreme.git
cd choreme

# Configure environment
cp .env.example .env
# Edit .env as needed

# Build and run
go mod tidy
go build -o choreme cmd/choreme/main.go
./choreme
```

**Windows:**
```cmd
REM Clone and setup
git clone https://github.com/your-org/choreme.git
cd choreme

REM Configure environment  
copy .env.example .env
REM Edit .env with notepad .env

REM Build and run
go mod tidy
go build -o choreme.exe cmd/choreme/main.go
choreme.exe
```

### Option 2: Backend + Full React PWA
This builds both the Go backend and React PWA frontend:

**Linux/macOS:**
```bash
# Clone repository
git clone https://github.com/your-org/choreme.git
cd choreme

# Build backend
go mod tidy
go build -o choreme cmd/choreme/main.go

# Build PWA (in another terminal)
cd web
npm install
npm run build

# The React build will be embedded in the Go binary when you restart
./choreme
```

**Windows:**
```cmd
REM Clone repository
git clone https://github.com/your-org/choreme.git
cd choreme

REM Build backend
go mod tidy
go build -o choreme.exe cmd/choreme/main.go

REM Build PWA (in another Command Prompt)
cd web
npm install
npm run build

REM The React build will be embedded in the Go binary when you restart
choreme.exe
```

### Option 3: Automated Build Scripts
ChoreMe includes build scripts that automatically handle the React build and embedding:

**Linux:**
```bash
# Make script executable
chmod +x scripts/build-with-ui.sh

# Run automated build
./scripts/build-with-ui.sh

# Run the application
./choreme
```

**Windows:**
```cmd
REM Run automated build
scripts\build-with-ui.bat

REM Run the application
choreme.exe
```

### Build Verification
After building, verify your installation:

```bash
# Check which UI is active (should show one of these messages):
# "Embedded React PWA enabled - serving full mobile UI"
# "Simple HTML UI enabled" 
# "API documentation mode"

# Test the API
curl http://localhost:8080/health
```

### Development Build
For development with hot reloading:

**Backend (Go):**
```bash
# Terminal 1: Run backend with live reload
go run cmd/choreme/main.go
```

**Frontend (React):**
```bash
# Terminal 2: Run PWA dev server
cd web
npm start
# PWA available at http://localhost:3000
# API available at http://localhost:8080
```

## Deployment Instructions

### Linux Deployment

#### Method 1: Systemd Service (Recommended)

**1. Build and Install:**
```bash
# Build application
git clone https://github.com/your-org/choreme.git
cd choreme
go mod tidy
go build -o choreme cmd/choreme/main.go

# Create application directory
sudo mkdir -p /opt/choreme
sudo cp choreme /opt/choreme/
sudo cp -r migrations /opt/choreme/

# Create data directory
sudo mkdir -p /var/lib/choreme
sudo chown choreme:choreme /var/lib/choreme
```

**2. Create System User:**
```bash
sudo useradd --system --home /var/lib/choreme --shell /bin/false choreme
```

**3. Configure Environment:**
```bash
sudo tee /opt/choreme/.env > /dev/null <<EOF
DB_TYPE=sqlite
DB_NAME=/var/lib/choreme/choreme.db
JWT_SECRET=$(openssl rand -base64 32)
HOST=0.0.0.0
PORT=8080
GIN_MODE=release
EOF

sudo chown choreme:choreme /opt/choreme/.env
sudo chmod 600 /opt/choreme/.env
```

**4. Create Systemd Service:**
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
Environment=HOME=/var/lib/choreme

# Security settings
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/lib/choreme
PrivateTmp=yes
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectControlGroups=yes

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=choreme

[Install]
WantedBy=multi-user.target
EOF
```

**5. Enable and Start Service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable choreme
sudo systemctl start choreme

# Check status
sudo systemctl status choreme

# View logs
sudo journalctl -u choreme -f
```

#### Method 2: Docker on Linux

**1. Using Docker Compose:**
```bash
git clone https://github.com/your-org/choreme.git
cd choreme

# Create production docker-compose.override.yml
cat > docker-compose.override.yml <<EOF
services:
  choreme:
    environment:
      - DB_TYPE=sqlite
      - JWT_SECRET=$(openssl rand -base64 32)
      - GIN_MODE=release
    restart: unless-stopped
    ports:
      - "8080:8080"
EOF

docker-compose up -d choreme
```

**2. With PostgreSQL:**
```bash
docker-compose --profile postgres up -d
```

**3. With Reverse Proxy (SSL):**
```bash
# Edit Caddyfile with your domain
echo "your-domain.com {
    reverse_proxy choreme:8080
}" > Caddyfile

docker-compose --profile proxy up -d
```

#### Linux Logging Configuration

**Systemd Journal (Default):**
```bash
# View real-time logs
sudo journalctl -u choreme -f

# View logs with timestamps
sudo journalctl -u choreme --since "1 hour ago"

# Export logs to file
sudo journalctl -u choreme --since "today" > choreme-logs.txt
```

**File-based Logging:**
```bash
# Create log directory
sudo mkdir -p /var/log/choreme
sudo chown choreme:choreme /var/log/choreme

# Update .env
echo "LOG_FILE=/var/log/choreme/choreme.log" | sudo tee -a /opt/choreme/.env

# Set up log rotation
sudo tee /etc/logrotate.d/choreme > /dev/null <<EOF
/var/log/choreme/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 choreme choreme
    postrotate
        systemctl reload choreme
    endscript
}
EOF
```

### Windows Deployment

#### Method 1: Windows Service (Recommended)

**1. Build and Install:**
```cmd
REM Create application directory
mkdir C:\Program Files\ChoreMe
cd /d "C:\Program Files\ChoreMe"

REM Download and extract (or build locally)
git clone https://github.com/your-org/choreme.git temp
cd temp
go build -o choreme.exe cmd/choreme/main.go
copy choreme.exe "C:\Program Files\ChoreMe\"
xcopy migrations "C:\Program Files\ChoreMe\migrations\" /E /I
cd ..
rmdir temp /s /q
```

**2. Configure Environment:**
```cmd
REM Create data directory
mkdir C:\ProgramData\ChoreMe
mkdir C:\ProgramData\ChoreMe\logs

REM Create .env file
echo DB_TYPE=sqlite > "C:\Program Files\ChoreMe\.env"
echo DB_NAME=C:\ProgramData\ChoreMe\choreme.db >> "C:\Program Files\ChoreMe\.env"
echo JWT_SECRET=your-secure-random-key-change-this >> "C:\Program Files\ChoreMe\.env"
echo HOST=0.0.0.0 >> "C:\Program Files\ChoreMe\.env"
echo PORT=8080 >> "C:\Program Files\ChoreMe\.env"
echo GIN_MODE=release >> "C:\Program Files\ChoreMe\.env"
echo LOG_FILE=C:\ProgramData\ChoreMe\logs\choreme.log >> "C:\Program Files\ChoreMe\.env"
```

**3. Install as Windows Service using NSSM:**
```cmd
REM Download NSSM from https://nssm.cc/download
REM Extract to C:\nssm

REM Install service (run as Administrator)
C:\nssm\nssm.exe install ChoreMe "C:\Program Files\ChoreMe\choreme.exe"
C:\nssm\nssm.exe set ChoreMe AppDirectory "C:\Program Files\ChoreMe"
C:\nssm\nssm.exe set ChoreMe DisplayName "ChoreMe Family Chore Management"
C:\nssm\nssm.exe set ChoreMe Description "Family chore management system with mobile PWA"
C:\nssm\nssm.exe set ChoreMe Start SERVICE_AUTO_START

REM Configure logging
C:\nssm\nssm.exe set ChoreMe AppStdout C:\ProgramData\ChoreMe\logs\choreme-out.log
C:\nssm\nssm.exe set ChoreMe AppStderr C:\ProgramData\ChoreMe\logs\choreme-err.log

REM Start service
C:\nssm\nssm.exe start ChoreMe

REM Check status
sc query ChoreMe
```

**4. Firewall Configuration:**
```cmd
REM Allow through Windows Firewall (run as Administrator)
netsh advfirewall firewall add rule name="ChoreMe" dir=in action=allow protocol=TCP localport=8080 profile=any
```

#### Method 2: PowerShell Deployment Script

Create a deployment script `deploy-windows.ps1`:

```powershell
# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Write-Error "This script requires Administrator privileges"
    exit 1
}

# Configuration
$AppDir = "C:\Program Files\ChoreMe"
$DataDir = "C:\ProgramData\ChoreMe"
$ServiceName = "ChoreMe"

# Create directories
New-Item -ItemType Directory -Path $AppDir -Force
New-Item -ItemType Directory -Path "$DataDir\logs" -Force

# Build application
go build -o "$AppDir\choreme.exe" cmd/choreme/main.go

# Copy migrations
Copy-Item -Path "migrations" -Destination $AppDir -Recurse -Force

# Generate secure JWT secret
$JWTSecret = [System.Web.Security.Membership]::GeneratePassword(32, 0)

# Create .env file
@"
DB_TYPE=sqlite
DB_NAME=$DataDir\choreme.db
JWT_SECRET=$JWTSecret
HOST=0.0.0.0
PORT=8080
GIN_MODE=release
LOG_FILE=$DataDir\logs\choreme.log
"@ | Out-File -FilePath "$AppDir\.env" -Encoding UTF8

Write-Output "ChoreMe deployed to $AppDir"
Write-Output "Data directory: $DataDir"
Write-Output "Configure as Windows Service using NSSM or sc.exe"
```

Run the deployment:
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\deploy-windows.ps1
```

#### Windows Logging Configuration

**Method 1: File-based Logging (Configured Above)**
```cmd
REM View logs
type "C:\ProgramData\ChoreMe\logs\choreme.log"

REM Monitor logs in real-time (PowerShell)
Get-Content "C:\ProgramData\ChoreMe\logs\choreme.log" -Wait -Tail 20

REM Search for errors
findstr "ERROR" "C:\ProgramData\ChoreMe\logs\choreme.log"
```

**Method 2: Windows Event Log Integration**
```cmd
REM Create event log source (run as Administrator once)
eventcreate /ID 1000 /L APPLICATION /T INFORMATION /SO "ChoreMe" /D "ChoreMe service initialized"

REM Configure ChoreMe to use Event Log (add to .env)
echo LOG_OUTPUT=eventlog >> "C:\Program Files\ChoreMe\.env"

REM View events in Event Viewer
eventvwr.msc
REM Navigate to Windows Logs > Application > Filter by Source: ChoreMe
```

**Method 3: PowerShell Monitoring Script**
```powershell
# Create monitoring script: monitor-choreme.ps1
param(
    [string]$LogFile = "C:\ProgramData\ChoreMe\logs\choreme.log",
    [int]$TailLines = 50
)

Write-Host "Monitoring ChoreMe logs at: $LogFile" -ForegroundColor Green
Write-Host "Press Ctrl+C to exit" -ForegroundColor Yellow
Write-Host ""

if (Test-Path $LogFile) {
    Get-Content $LogFile -Wait -Tail $TailLines | ForEach-Object {
        $timestamp = Get-Date -Format "HH:mm:ss"
        
        if ($_ -match "ERROR|FATAL") {
            Write-Host "[$timestamp] $_" -ForegroundColor Red
        } elseif ($_ -match "WARN") {
            Write-Host "[$timestamp] $_" -ForegroundColor Yellow
        } elseif ($_ -match "INFO") {
            Write-Host "[$timestamp] $_" -ForegroundColor Green
        } else {
            Write-Host "[$timestamp] $_"
        }
    }
} else {
    Write-Error "Log file not found: $LogFile"
}
```

Run monitoring:
```powershell
.\monitor-choreme.ps1
```

### Cross-Platform Logging Best Practices

#### Log Levels and Format
Configure in `.env`:
```env
# Logging configuration
LOG_LEVEL=info              # debug, info, warn, error
LOG_FORMAT=json             # json, text
LOG_FILE=/path/to/choreme.log   # File path or empty for stdout
MAX_LOG_SIZE=100MB          # Rotate when file exceeds size
LOG_RETENTION_DAYS=30       # Keep logs for 30 days
```

#### Monitoring Scripts

**Linux Log Analysis:**
```bash
#!/bin/bash
# analyze-logs.sh
LOG_FILE="/var/log/choreme/choreme.log"

echo "=== ChoreMe Log Analysis ==="
echo "Total lines: $(wc -l < $LOG_FILE)"
echo "Error count: $(grep -c "ERROR" $LOG_FILE)"
echo "Warning count: $(grep -c "WARN" $LOG_FILE)"
echo ""
echo "Latest errors:"
grep "ERROR" $LOG_FILE | tail -5
```

**Windows Log Analysis (PowerShell):**
```powershell
# analyze-logs.ps1
$LogFile = "C:\ProgramData\ChoreMe\logs\choreme.log"
$Content = Get-Content $LogFile

Write-Host "=== ChoreMe Log Analysis ===" -ForegroundColor Cyan
Write-Host "Total lines: $($Content.Length)"
Write-Host "Error count: $(($Content | Select-String "ERROR").Count)"
Write-Host "Warning count: $(($Content | Select-String "WARN").Count)"
Write-Host ""
Write-Host "Latest errors:" -ForegroundColor Red
$Content | Select-String "ERROR" | Select-Object -Last 5
```

This comprehensive deployment guide covers both Linux and Windows deployment with proper logging configuration for production use.

### Additional Docker Options

#### Quick Docker Deployment (Alternative)
```bash
# SQLite (simplest)
docker-compose up choreme

# PostgreSQL 
docker-compose --profile postgres up choreme-postgres postgres

# MySQL/MariaDB
docker-compose --profile mysql up choreme-mysql mysql

# With reverse proxy (SSL)
docker-compose --profile proxy up choreme caddy
```

## UI Options

ChoreMe provides three UI options depending on your setup:

### Option 1: Full React PWA (Recommended)
- **Complete mobile app experience** with offline support
- **Camera integration** for chore proof photos  
- **Push notifications** and installable on mobile devices
- **Requires**: Node.js 18+ to build the React frontend

### Option 2: Simple HTML UI (Go-only)  
- **Basic web interface** with essential functionality
- **No Node.js required** - uses embedded HTML templates
- **Good for**: Testing, simple deployments, server environments

### Option 3: API-only Mode
- **Backend API only** with JSON responses
- **Perfect for**: Custom frontends, mobile apps, integrations
- **Access**: API documentation at `/api` endpoint

The system automatically detects which UI to serve based on what's available.

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

ChoreMe follows a **modern three-layer architecture** with a mobile-first PWA frontend and a multi-database backend API.

### System Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    ChoreMe System                           │
├─────────────────────────────────────────────────────────────┤
│  📱 PWA Frontend (React + TypeScript)                      │
│  • Mobile-first responsive UI                              │
│  • Offline-capable with service workers                    │
│  • IndexedDB for local storage                             │
│  • Camera integration & push notifications                 │
├─────────────────────────────────────────────────────────────┤
│  🔗 REST API Layer (Go + Gin)                             │
│  • JWT authentication & role-based access                  │
│  • 29+ endpoints with comprehensive functionality          │
│  • CORS middleware & request validation                    │
│  • Audit logging & error handling                          │
├─────────────────────────────────────────────────────────────┤
│  💾 Database Layer (Multi-backend)                        │
│  • SQLite (embedded) / MySQL / PostgreSQL                  │
│  • Database abstraction with factory pattern               │
│  • Automatic migrations & connection pooling               │
│  • Decimal precision for monetary values                   │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure
```
choreme/
├── cmd/                    # Application entry points
│   ├── choreme/           # Main API server
│   └── migrate/           # Database migration tool
├── internal/              # Backend Go code
│   ├── api/              # HTTP handlers & routing
│   ├── auth/             # JWT & password management
│   ├── config/           # Configuration management
│   ├── middleware/       # HTTP middleware (CORS, auth, logging)
│   ├── model/            # Domain models & types
│   ├── service/          # Business logic layer
│   └── store/            # Database abstraction layer
│       ├── interface.go  # Store interface definition
│       ├── factory.go    # Database factory pattern
│       ├── postgres/     # PostgreSQL implementation
│       ├── mysql/        # MySQL/MariaDB implementation
│       └── sqlite/       # SQLite implementation
├── migrations/            # Database migration files
│   ├── postgres/         # PostgreSQL-specific migrations
│   ├── mysql/           # MySQL-specific migrations
│   └── sqlite/          # SQLite-specific migrations
├── web/                   # PWA Frontend (React)
│   ├── public/           # Static assets & PWA manifest
│   │   ├── manifest.json # PWA configuration
│   │   ├── sw.js        # Service worker for offline support
│   │   └── index.html   # App shell
│   └── src/              # React TypeScript source
│       ├── components/   # Reusable UI components
│       ├── pages/       # Main application screens
│       ├── hooks/       # Custom React hooks (useAuth, etc.)
│       ├── services/    # API client & offline sync
│       ├── types/       # TypeScript type definitions
│       └── utils/       # Helper functions
├── docker-compose.yml     # Multi-database deployment
├── Dockerfile            # Container definition
├── Makefile             # Development commands
└── README.md            # This file
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

### Complete System Deployment

ChoreMe consists of two main components that work together:

#### 1. Backend API Deployment

**Database Choice**:
- **SQLite**: Perfect for single families, embedded database, minimal setup
- **MySQL/MariaDB**: Great for traditional web hosting, moderate scale
- **PostgreSQL**: Best for high-concurrency, advanced features, large families

**Security Configuration**:
```env
# Production .env example
DB_TYPE=postgres
JWT_SECRET=your-very-secure-random-key-change-this
HOST=0.0.0.0
PORT=8080
GIN_MODE=release
CORS_ORIGINS=https://your-pwa-domain.com
```

#### 2. PWA Frontend Deployment

**Static Hosting Options**:
- **Netlify** (Recommended) - Automatic HTTPS, easy deployment
- **Vercel** - Excellent performance and CDN
- **GitHub Pages** - Free for public repos
- **AWS S3 + CloudFront** - Enterprise-scale hosting

**PWA Deployment Steps**:
```bash
# Build production PWA
cd web
npm run build

# Deploy to Netlify (example)
# 1. Connect GitHub repo to Netlify
# 2. Set build command: npm run build
# 3. Set publish directory: web/build
# 4. Add environment variable: REACT_APP_API_URL=https://your-api-domain.com/api/v1
```

**PWA Configuration**:
```env
# web/.env production
REACT_APP_API_URL=https://your-api-domain.com/api/v1
REACT_APP_VAPID_PUBLIC_KEY=your-push-notification-key
```

### Production Considerations

#### Backend Security
- Change default JWT secret to a secure random key
- Use environment variables for all secrets
- Enable HTTPS with SSL certificates (required for PWA)
- Configure CORS with your PWA domain only
- Set up database connection pooling
- Enable audit logging and monitoring

#### PWA Requirements
- **HTTPS Required** - PWAs require secure origins for all features
- **Service Worker** - Automatically configured for offline support
- **Manifest** - App installation metadata included
- **Icons** - Generate app icons for different platforms

#### Performance Optimization
- Backend: Connection pooling, image compression limits, caching headers
- PWA: Code splitting, lazy loading, service worker caching
- Database: Proper indexing, query optimization
- CDN: Use CDN for PWA static assets

### Docker Production Deployment

For complete system deployment with Docker:

```bash
# Backend with PostgreSQL
docker-compose --profile postgres up -d

# Serve PWA (build first)
cd web && npm run build
docker run -p 3000:80 -v $(pwd)/build:/usr/share/nginx/html nginx
```

### Monitoring and Maintenance

**Health Checks**:
- Backend: `GET /health` endpoint
- PWA: Service worker status, offline capability
- Database: Connection monitoring, query performance

**Backup Strategy**:
- SQLite: File-based backup of .db file
- PostgreSQL/MySQL: Regular database dumps
- PWA: Static assets in version control

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

## Current Status & Roadmap

### ✅ Completed Features
- ✅ **Multi-Database Backend** - SQLite, MySQL, PostgreSQL support with abstraction layer
- ✅ **RESTful API** - 29+ endpoints with JWT authentication and role-based access
- ✅ **Mobile PWA Frontend** - React + TypeScript with offline-first architecture
- ✅ **Authentication System** - Login, registration, household management with invite codes
- ✅ **Chore Management** - Assignment, progress tracking, photo proof, completion workflows
- ✅ **Earnings System** - Decimal-precision ledger with transaction history
- ✅ **Reward Store** - Creation, redemption, and approval system
- ✅ **Offline Support** - Service workers, IndexedDB storage, background sync
- ✅ **Push Notifications** - Web push with service worker integration
- ✅ **Camera Integration** - Photo capture with automatic compression
- ✅ **PWA Features** - Installable app with app-like experience
- ✅ **Responsive Design** - Mobile-first UI that works on all screen sizes
- ✅ **Real-time Updates** - Live chore status and earnings synchronization

### 🚧 Future Enhancements
- [ ] **Advanced Reporting** - Analytics dashboard for parents
- [ ] **Email Notifications** - SMTP integration for external notifications  
- [ ] **Recurring Chore Automation** - Smart scheduling and auto-assignment
- [ ] **Multi-language Support** - Internationalization (i18n)
- [ ] **API Rate Limiting** - Protection against abuse
- [ ] **Backup/Restore** - Data export and import functionality
- [ ] **Native Mobile Apps** - React Native iOS/Android apps
- [ ] **Family Calendar Integration** - Sync with Google Calendar, iCal
- [ ] **Gamification Features** - Badges, streaks, leaderboards
- [ ] **Voice Commands** - Integration with smart home devices

### 🎯 Production Ready
ChoreMe is **production-ready** for families wanting a comprehensive chore management system with:
- Complete mobile app experience (PWA)
- Full backend API with multi-database support  
- Offline functionality and data synchronization
- Photo proof and earnings tracking
- Secure authentication and role management
