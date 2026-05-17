#!/bin/bash

# Library App - VPS Deployment Script
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e

echo "========================================="
echo "  Library App - VPS Deployment Script"
echo "========================================="
echo ""

# Configuration
APP_DIR="/var/www/library-app"
DOMAIN="perpus.irf4n.my.id"  # Ganti dengan domain Anda
DB_NAME="library_db"
DB_USER="library_user"
DB_PASSWORD=""  # Akan di-generate otomatis
JWT_SECRET=$(openssl rand -hex 32)
MYSQL_ROOT_PASSWORD=""  # Akan diminta saat setup

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root (sudo ./deploy.sh)"
    exit 1
fi

# Generate random password
generate_password() {
    openssl rand -hex 16
}

echo ""
log_info "Starting deployment..."
echo ""

# Step 1: System update
log_info "Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install dependencies
log_info "Installing dependencies..."
apt install -y curl git unzip nginx mysql-server

# Step 3: Install Bun
log_info "Installing Bun runtime..."
curl -fsSL https://bun.sh/install | bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Verify Bun installation
if ! command -v bun &> /dev/null; then
    log_error "Bun installation failed!"
    exit 1
fi
log_info "Bun installed successfully"

# Step 4: Setup MySQL
log_info "Setting up MySQL..."
DB_PASSWORD=$(generate_password)

mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME};
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

log_info "MySQL database created successfully"
log_warn "Save this database password: ${DB_PASSWORD}"

# Step 5: Create app directory and copy files
log_info "Setting up application..."
mkdir -p ${APP_DIR}

# Copy application files (run this from the app directory)
if [ -d "backend" ] && [ -d "frontend" ]; then
    cp -r backend ${APP_DIR}/
    cp -r frontend ${APP_DIR}/
    cp start.sh ${APP_DIR}/ 2>/dev/null || true
else
    log_error "Backend and frontend directories not found!"
    log_info "Run this script from the application root directory"
    exit 1
fi

# Step 6: Setup Backend
log_info "Configuring backend..."
cat > ${APP_DIR}/backend/.env <<EOF
DB_HOST=localhost
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
EOF

cd ${APP_DIR}/backend
bun install
bun run db:push
log_info "Backend configured successfully"

# Step 7: Setup Frontend
log_info "Configuring frontend..."
cd ${APP_DIR}/frontend

# Update .env if exists
if [ -f ".env" ]; then
    sed -i "s|PUBLIC_API_URL=.*|PUBLIC_API_URL=http://localhost:3000|g" .env
else
    echo "PUBLIC_API_URL=http://localhost:3000" > .env
fi

bun install
bun run build
log_info "Frontend built successfully"

# Step 8: Install and configure PM2
log_info "Installing PM2 process manager..."
npm install -g pm2

# Create PM2 ecosystem file
cat > ${APP_DIR}/ecosystem.config.js <<EOF
module.exports = {
  apps: [
    {
      name: 'library-backend',
      cwd: '${APP_DIR}/backend',
      script: 'bun',
      args: 'run dev',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      log_file: '/var/log/pm2/backend.log',
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log'
    },
    {
      name: 'library-frontend',
      cwd: '${APP_DIR}/frontend',
      script: 'bun',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      log_file: '/var/log/pm2/frontend.log',
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log'
    }
  ]
};
EOF

mkdir -p /var/log/pm2
pm2 start ${APP_DIR}/ecosystem.config.js
pm2 save
pm2 startup

log_info "PM2 configured and applications started"

# Step 9: Configure Nginx
log_info "Configuring Nginx..."
cat > /etc/nginx/sites-available/library-app <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/library-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

log_info "Nginx configured successfully"

# Step 10: Setup firewall
log_info "Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow 'MySQL'
ufw --force enable

# Summary
echo ""
echo "========================================="
log_info "Deployment completed successfully!"
echo "========================================="
echo ""
echo "Application URLs:"
echo "  Frontend: http://${DOMAIN}"
echo "  Backend API: http://${DOMAIN}/api"
echo ""
echo "Database Credentials:"
echo "  Database: ${DB_NAME}"
echo "  User: ${DB_USER}"
echo "  Password: ${DB_PASSWORD}"
echo ""
echo "PM2 Commands:"
echo "  pm2 status              - Check app status"
echo "  pm2 logs                - View logs"
echo "  pm2 restart all         - Restart apps"
echo ""
echo "Next Steps:"
echo "  1. Point your domain to VPS IP address"
echo "  2. Run: certbot --nginx -d ${DOMAIN}  (for SSL)"
echo "  3. Test your application"
echo ""
