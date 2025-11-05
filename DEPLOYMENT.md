# Deployment Guide

This guide covers production deployment of ChoreMe on various platforms and configurations.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Linux Deployment](#linux-deployment)
- [Windows Deployment](#windows-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Database Setup](#database-setup)
- [SSL/HTTPS Configuration](#ssl-https-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

### Security
- [ ] Generated a secure JWT secret (minimum 32 characters)
- [ ] Changed all default passwords
- [ ] Configured HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Reviewed CORS configuration
- [ ] Disabled debug mode (`GIN_MODE=release`)

### Configuration
- [ ] Selected and configured database (SQLite, MySQL, or PostgreSQL)
- [ ] Configured environment variables
- [ ] Set up database backups
- [ ] Configured logging
- [ ] Tested database migrations

### Frontend
- [ ] Built Vue 3 frontend for production (`npm run build`)
- [ ] Configured API URL for production
- [ ] Tested PWA functionality
- [ ] Verified mobile responsiveness

### Infrastructure
- [ ] Chosen hosting platform
- [ ] Configured domain name (if applicable)
- [ ] Set up reverse proxy (Nginx/Caddy)
- [ ] Planned for monitoring and alerts

### Testing
- [ ] Tested all critical workflows
- [ ] Verified role-based access control
- [ ] Load tested with expected user count
- [ ] Tested backup and restore procedures

---

## Linux Deployment

### Option 1: Systemd Service (Recommended)

This method uses systemd to manage ChoreMe as a system service.

#### Step 1: Build Application

```bash
# On your build machine or server
git clone https://github.com/your-org/choreme.git
cd choreme

# Build backend
go build -ldflags="-s -w" -o choreme cmd/choreme/main.go

# Build frontend
cd web
npm install
npm run build
cd ..
```

#### Step 2: Create System User

```bash
# Create dedicated user for ChoreMe
sudo useradd --system --home /var/lib/choreme --shell /bin/false choreme
```

#### Step 3: Install Application

```bash
# Create application directory
sudo mkdir -p /opt/choreme
sudo mkdir -p /var/lib/choreme
sudo mkdir -p /var/log/choreme

# Copy binary and files
sudo cp choreme /opt/choreme/
sudo cp -r migrations /opt/choreme/
sudo cp -r web/dist /opt/choreme/web/

# Set permissions
sudo chown -R choreme:choreme /opt/choreme
sudo chown -R choreme:choreme /var/lib/choreme
sudo chown -R choreme:choreme /var/log/choreme
sudo chmod 755 /opt/choreme/choreme
```

#### Step 4: Configure Environment

```bash
# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 48)

# Create environment file
sudo tee /opt/choreme/.env > /dev/null <<EOF
# Database Configuration
DB_TYPE=sqlite
DB_NAME=/var/lib/choreme/choreme.db

# Server Configuration
HOST=0.0.0.0
PORT=8080
GIN_MODE=release

# Security
JWT_SECRET=${JWT_SECRET}
CORS_ORIGINS=https://your-domain.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=/var/log/choreme/choreme.log

# Background Jobs
ENABLE_SCHEDULER=true
EOF

# Secure environment file
sudo chown choreme:choreme /opt/choreme/.env
sudo chmod 600 /opt/choreme/.env
```

#### Step 5: Create Systemd Service

```bash
sudo tee /etc/systemd/system/choreme.service > /dev/null <<'EOF'
[Unit]
Description=ChoreMe Family Chore Management
Documentation=https://github.com/your-org/choreme
After=network.target

[Service]
Type=simple
User=choreme
Group=choreme
WorkingDirectory=/opt/choreme
ExecStart=/opt/choreme/choreme
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=choreme

# Security settings
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/lib/choreme /var/log/choreme
PrivateTmp=yes
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectControlGroups=yes

# Resource limits
LimitNOFILE=4096
MemoryLimit=512M

[Install]
WantedBy=multi-user.target
EOF
```

#### Step 6: Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable choreme

# Start service
sudo systemctl start choreme

# Check status
sudo systemctl status choreme

# View logs
sudo journalctl -u choreme -f
```

#### Step 7: Configure Firewall

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Option 2: Docker Compose on Linux

```bash
# Clone repository
git clone https://github.com/your-org/choreme.git
cd choreme

# Create production override
cat > docker-compose.prod.yml <<EOF
services:
  choreme:
    environment:
      - GIN_MODE=release
      - JWT_SECRET=your-secure-secret-here
      - ENABLE_SCHEDULER=true
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
EOF

# Start with PostgreSQL
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile postgres up -d

# View logs
docker-compose logs -f choreme
```

---

## Windows Deployment

### Option 1: Windows Service with NSSM

#### Step 1: Build Application

```powershell
# Clone repository
git clone https://github.com/your-org/choreme.git
cd choreme

# Build backend
go build -o choreme.exe cmd/choreme/main.go

# Build frontend
cd web
npm install
npm run build
cd ..
```

#### Step 2: Install Application

```powershell
# Run as Administrator

# Create directories
New-Item -ItemType Directory -Force -Path "C:\Program Files\ChoreMe"
New-Item -ItemType Directory -Force -Path "C:\ProgramData\ChoreMe"
New-Item -ItemType Directory -Force -Path "C:\ProgramData\ChoreMe\logs"

# Copy files
Copy-Item choreme.exe "C:\Program Files\ChoreMe\"
Copy-Item -Recurse migrations "C:\Program Files\ChoreMe\"
Copy-Item -Recurse web\dist "C:\Program Files\ChoreMe\web\"
```

#### Step 3: Configure Environment

```powershell
# Generate JWT secret
$JWTSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})

# Create .env file
@"
DB_TYPE=sqlite
DB_NAME=C:\ProgramData\ChoreMe\choreme.db
JWT_SECRET=$JWTSecret
HOST=0.0.0.0
PORT=8080
GIN_MODE=release
LOG_FILE=C:\ProgramData\ChoreMe\logs\choreme.log
ENABLE_SCHEDULER=true
"@ | Out-File -FilePath "C:\Program Files\ChoreMe\.env" -Encoding UTF8
```

#### Step 4: Install as Windows Service using NSSM

```powershell
# Download NSSM from https://nssm.cc/download
# Extract to C:\nssm

# Install service (run as Administrator)
C:\nssm\nssm.exe install ChoreMe "C:\Program Files\ChoreMe\choreme.exe"
C:\nssm\nssm.exe set ChoreMe AppDirectory "C:\Program Files\ChoreMe"
C:\nssm\nssm.exe set ChoreMe DisplayName "ChoreMe Family Chore Management"
C:\nssm\nssm.exe set ChoreMe Description "Family chore management system with account features"
C:\nssm\nssm.exe set ChoreMe Start SERVICE_AUTO_START

# Configure logging
C:\nssm\nssm.exe set ChoreMe AppStdout "C:\ProgramData\ChoreMe\logs\choreme-out.log"
C:\nssm\nssm.exe set ChoreMe AppStderr "C:\ProgramData\ChoreMe\logs\choreme-err.log"

# Start service
C:\nssm\nssm.exe start ChoreMe

# Check status
Get-Service ChoreMe
```

#### Step 5: Configure Windows Firewall

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "ChoreMe HTTP" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

### Option 2: Docker Desktop on Windows

```powershell
# Install Docker Desktop for Windows
# https://www.docker.com/products/docker-desktop

# Clone repository
git clone https://github.com/your-org/choreme.git
cd choreme

# Start services
docker-compose --profile postgres up -d

# View logs
docker-compose logs -f choreme
```

---

## Docker Deployment

### Basic Docker Deployment

#### Using Docker Compose

**Option 1: SQLite (Simplest)**

```bash
# Create docker-compose.override.yml
cat > docker-compose.override.yml <<EOF
services:
  choreme:
    environment:
      - DB_TYPE=sqlite
      - JWT_SECRET=$(openssl rand -base64 48)
      - GIN_MODE=release
    restart: unless-stopped
    volumes:
      - choreme-data:/data
    ports:
      - "8080:8080"

volumes:
  choreme-data:
EOF

# Start service
docker-compose up -d choreme

# View logs
docker-compose logs -f choreme
```

**Option 2: PostgreSQL (Recommended for Production)**

```bash
# Start PostgreSQL and ChoreMe
docker-compose --profile postgres up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f choreme postgres
```

**Option 3: MySQL/MariaDB**

```bash
# Start MySQL and ChoreMe
docker-compose --profile mysql up -d

# Check status
docker-compose ps
```

### Docker with Reverse Proxy (SSL)

#### Using Caddy for Automatic HTTPS

**Step 1: Configure Caddyfile**

```bash
cat > Caddyfile <<EOF
your-domain.com {
    reverse_proxy choreme:8080

    # Enable compression
    encode gzip

    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    # Logging
    log {
        output file /var/log/caddy/access.log
    }
}
EOF
```

**Step 2: Start with Caddy**

```bash
# Update docker-compose to use proxy profile
docker-compose --profile postgres --profile proxy up -d

# Caddy will automatically obtain SSL certificate from Let's Encrypt
```

#### Using Nginx for SSL

```bash
cat > nginx.conf <<EOF
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Copy to Nginx sites
sudo cp nginx.conf /etc/nginx/sites-available/choreme
sudo ln -s /etc/nginx/sites-available/choreme /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Cloud Deployment

### AWS EC2

#### Step 1: Launch EC2 Instance

```bash
# Launch Ubuntu 22.04 LTS instance
# - Instance type: t3.small or larger
# - Storage: 20GB+ EBS volume
# - Security Group: Allow HTTP (80), HTTPS (443), SSH (22)
```

#### Step 2: Connect and Install Dependencies

```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Go
wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker (optional)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
```

#### Step 3: Deploy ChoreMe

Follow [Linux Deployment](#linux-deployment) instructions above.

#### Step 4: Configure RDS Database (Optional)

```bash
# Create PostgreSQL RDS instance
# - Engine: PostgreSQL 15+
# - Instance class: db.t3.micro or larger
# - Enable automatic backups

# Update ChoreMe configuration
DB_TYPE=postgres
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_NAME=choreme
DB_USER=choreme
DB_PASS=your-secure-password
DB_SSL_MODE=require
```

### Digital Ocean

#### Using App Platform

```yaml
# app.yaml
name: choreme
services:
  - name: choreme
    github:
      repo: your-org/choreme
      branch: main
    build_command: |
      go build -o choreme cmd/choreme/main.go
      cd web && npm install && npm run build
    run_command: ./choreme
    envs:
      - key: DB_TYPE
        value: postgres
      - key: DB_HOST
        value: ${db.HOSTNAME}
      - key: DB_PORT
        value: ${db.PORT}
      - key: DB_NAME
        value: ${db.DATABASE}
      - key: DB_USER
        value: ${db.USERNAME}
      - key: DB_PASS
        value: ${db.PASSWORD}
      - key: JWT_SECRET
        value: your-secure-secret
        type: SECRET
      - key: GIN_MODE
        value: release
    http_port: 8080

databases:
  - name: db
    engine: PG
    version: "15"
```

### Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set config vars
heroku config:set JWT_SECRET=$(openssl rand -base64 48)
heroku config:set GIN_MODE=release
heroku config:set ENABLE_SCHEDULER=true

# Create Procfile
echo "web: ./choreme" > Procfile

# Deploy
git push heroku main
```

---

## Database Setup

### SQLite (Development/Small Deployments)

```bash
# Configuration
DB_TYPE=sqlite
DB_NAME=/path/to/choreme.db

# Migrations run automatically on startup
# Database file is created automatically
```

**Pros:**
- Zero configuration
- Perfect for single families
- Easy backups (just copy the file)

**Cons:**
- Limited concurrency
- No remote access
- Not suitable for high traffic

### PostgreSQL (Recommended for Production)

#### Installation

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**CentOS/RHEL:**
```bash
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Configuration

```bash
# Create database and user
sudo -u postgres psql <<EOF
CREATE USER choreme WITH PASSWORD 'secure_password';
CREATE DATABASE choreme OWNER choreme;
GRANT ALL PRIVILEGES ON DATABASE choreme TO choreme;
EOF

# Configure ChoreMe
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=choreme
DB_USER=choreme
DB_PASS=secure_password
DB_SSL_MODE=disable
```

#### Performance Tuning

Edit `/etc/postgresql/15/main/postgresql.conf`:

```conf
# For 4GB RAM server
shared_buffers = 1GB
effective_cache_size = 3GB
work_mem = 16MB
maintenance_work_mem = 256MB
max_connections = 100
```

### MySQL/MariaDB

#### Installation

**Ubuntu/Debian:**
```bash
sudo apt install mariadb-server
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mysql_secure_installation
```

#### Configuration

```bash
# Create database and user
sudo mysql <<EOF
CREATE DATABASE choreme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'choreme'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON choreme.* TO 'choreme'@'localhost';
FLUSH PRIVILEGES;
EOF

# Configure ChoreMe
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=choreme
DB_USER=choreme
DB_PASS=secure_password
```

---

## SSL/HTTPS Configuration

HTTPS is **required** for PWA features (camera, notifications, installation).

### Option 1: Let's Encrypt with Caddy (Automatic)

Caddy automatically obtains and renews SSL certificates:

```bash
# Caddyfile
your-domain.com {
    reverse_proxy choreme:8080
}
```

That's it! Caddy handles everything automatically.

### Option 2: Let's Encrypt with Certbot (Manual)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

### Option 3: Custom SSL Certificate

```bash
# If you have your own certificate
sudo cp your-cert.pem /etc/ssl/certs/choreme.crt
sudo cp your-key.pem /etc/ssl/private/choreme.key
sudo chmod 644 /etc/ssl/certs/choreme.crt
sudo chmod 600 /etc/ssl/private/choreme.key

# Configure Nginx
ssl_certificate /etc/ssl/certs/choreme.crt;
ssl_certificate_key /etc/ssl/private/choreme.key;
```

---

## Monitoring and Logging

### Systemd Journald Logs

```bash
# View real-time logs
sudo journalctl -u choreme -f

# View logs from last hour
sudo journalctl -u choreme --since "1 hour ago"

# View errors only
sudo journalctl -u choreme -p err

# Export logs
sudo journalctl -u choreme --since today > choreme.log
```

### File-Based Logging

Configure in `.env`:

```env
LOG_FILE=/var/log/choreme/choreme.log
LOG_LEVEL=info
LOG_FORMAT=json
```

### Log Rotation

```bash
# Create logrotate config
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
        systemctl reload choreme > /dev/null 2>&1 || true
    endscript
}
EOF
```

### Health Monitoring

Create a monitoring script:

```bash
#!/bin/bash
# /usr/local/bin/choreme-health-check.sh

HEALTH_URL="http://localhost:8080/health"
ALERT_EMAIL="admin@your-domain.com"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ "$response" != "200" ]; then
    echo "ChoreMe health check failed! HTTP $response" | mail -s "ChoreMe Alert" $ALERT_EMAIL
    systemctl restart choreme
fi
```

Add to crontab:

```bash
# Run every 5 minutes
*/5 * * * * /usr/local/bin/choreme-health-check.sh
```

---

## Backup and Recovery

### SQLite Backup

```bash
#!/bin/bash
# /usr/local/bin/backup-choreme.sh

BACKUP_DIR="/backup/choreme"
DB_FILE="/var/lib/choreme/choreme.db"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Stop service (optional, for consistency)
systemctl stop choreme

# Backup database
cp $DB_FILE "$BACKUP_DIR/choreme_$DATE.db"

# Compress
gzip "$BACKUP_DIR/choreme_$DATE.db"

# Start service
systemctl start choreme

# Keep only last 30 days
find $BACKUP_DIR -name "*.db.gz" -mtime +30 -delete

echo "Backup completed: choreme_$DATE.db.gz"
```

### PostgreSQL Backup

```bash
#!/bin/bash
# /usr/local/bin/backup-choreme-pg.sh

BACKUP_DIR="/backup/choreme"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup with pg_dump
pg_dump -U choreme choreme | gzip > "$BACKUP_DIR/choreme_$DATE.sql.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: choreme_$DATE.sql.gz"
```

### Automated Backups

```bash
# Add to crontab (daily at 2 AM)
0 2 * * * /usr/local/bin/backup-choreme.sh

# Or for PostgreSQL
0 2 * * * /usr/local/bin/backup-choreme-pg.sh
```

### Restore from Backup

**SQLite:**
```bash
systemctl stop choreme
cp /backup/choreme/choreme_20240115.db /var/lib/choreme/choreme.db
chown choreme:choreme /var/lib/choreme/choreme.db
systemctl start choreme
```

**PostgreSQL:**
```bash
# Drop and recreate database
sudo -u postgres psql <<EOF
DROP DATABASE choreme;
CREATE DATABASE choreme OWNER choreme;
EOF

# Restore
gunzip < /backup/choreme/choreme_20240115.sql.gz | psql -U choreme choreme

# Restart service
systemctl restart choreme
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check service status
sudo systemctl status choreme

# View recent logs
sudo journalctl -u choreme -n 50 --no-pager

# Common issues:
# 1. Port already in use
sudo lsof -i :8080

# 2. Permission issues
sudo chown -R choreme:choreme /var/lib/choreme
sudo chmod 755 /opt/choreme/choreme

# 3. Database connection issues
# Check environment variables
sudo cat /opt/choreme/.env

# Test database manually
sqlite3 /var/lib/choreme/choreme.db ".tables"
```

### High Memory Usage

```bash
# Check memory usage
systemctl status choreme
ps aux | grep choreme

# Limit memory in systemd service
# Edit /etc/systemd/system/choreme.service
MemoryLimit=512M

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart choreme
```

### Database Performance Issues

```bash
# Check database size
du -h /var/lib/choreme/choreme.db

# Vacuum SQLite database
sqlite3 /var/lib/choreme/choreme.db "VACUUM;"

# Analyze PostgreSQL
psql -U choreme -d choreme -c "VACUUM ANALYZE;"

# Check slow queries (PostgreSQL)
# Enable slow query logging in postgresql.conf
log_min_duration_statement = 1000  # Log queries slower than 1s
```

### SSL Certificate Issues

```bash
# Check certificate expiration
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

---

## Security Checklist

- [ ] Strong JWT secret (48+ characters)
- [ ] HTTPS enabled with valid certificate
- [ ] Firewall configured (only necessary ports open)
- [ ] Database user has limited permissions
- [ ] Environment variables secured (600 permissions)
- [ ] Regular security updates applied
- [ ] Backups configured and tested
- [ ] Logs monitored for suspicious activity
- [ ] Rate limiting enabled (future feature)
- [ ] CORS properly configured
- [ ] Debug mode disabled in production

---

For more information, see:
- [README.md](./README.md) - Project overview
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md) - Backend details
