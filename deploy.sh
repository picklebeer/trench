#!/bin/bash

################################################################################
# TRENCH Website Deployment Script
#
# This script automates the deployment of the TRENCH cryptocurrency website
# on a Linux server using nginx.
#
# Prerequisites:
# - Ubuntu/Debian-based Linux server
# - Root or sudo access
# - Domain name pointed to server IP (optional but recommended)
#
# Usage:
#   sudo ./deploy.sh [domain_name]
#
# Example:
#   sudo ./deploy.sh trench.example.com
#   sudo ./deploy.sh localhost  (for local testing)
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-localhost}
PROJECT_NAME="trench"
WEB_ROOT="/var/www/${PROJECT_NAME}"
NGINX_CONF="/etc/nginx/sites-available/${PROJECT_NAME}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${PROJECT_NAME}"
CURRENT_DIR=$(pwd)

################################################################################
# Helper Functions
################################################################################

print_step() {
    echo -e "\n${GREEN}==>${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root or with sudo"
        exit 1
    fi
}

################################################################################
# Main Deployment Steps
################################################################################

print_step "Starting TRENCH website deployment..."
echo "Domain: ${DOMAIN}"
echo "Web Root: ${WEB_ROOT}"

check_root

################################################################################
# Step 1: Update system and install dependencies
################################################################################

print_step "Step 1: Updating system and installing dependencies..."

apt-get update
apt-get install -y nginx curl wget git

# Check if nginx is installed successfully
if ! command -v nginx &> /dev/null; then
    print_error "nginx installation failed"
    exit 1
fi

print_step "nginx version: $(nginx -v 2>&1)"

################################################################################
# Step 2: Create web directory and set permissions
################################################################################

print_step "Step 2: Setting up web directory..."

# Create web root directory
mkdir -p ${WEB_ROOT}

# Copy website files
print_step "Copying website files to ${WEB_ROOT}..."

# Check if essential files exist
if [[ ! -f "${CURRENT_DIR}/index.html" ]]; then
    print_error "index.html not found in current directory"
    exit 1
fi

# Copy all files
cp -rf ${CURRENT_DIR}/index.html ${WEB_ROOT}/
cp -rf ${CURRENT_DIR}/style.css ${WEB_ROOT}/
cp -rf ${CURRENT_DIR}/script.js ${WEB_ROOT}/

# Copy img directory if it exists
if [[ -d "${CURRENT_DIR}/img" ]]; then
    cp -rf ${CURRENT_DIR}/img ${WEB_ROOT}/
else
    print_warning "img directory not found. Make sure to upload images to ${WEB_ROOT}/img/"
    mkdir -p ${WEB_ROOT}/img
fi

# Set proper permissions
chown -R www-data:www-data ${WEB_ROOT}
chmod -R 755 ${WEB_ROOT}

print_step "Web files copied successfully"

################################################################################
# Step 3: Configure nginx
################################################################################

print_step "Step 3: Configuring nginx..."

# Create nginx configuration
cat > ${NGINX_CONF} << 'NGINX_CONFIG_EOF'
server {
    listen 80;
    listen [::]:80;

    server_name DOMAIN_PLACEHOLDER;

    root /var/www/PROJECT_NAME_PLACEHOLDER;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Main location
    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Custom error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;

    # Access and error logs
    access_log /var/log/nginx/PROJECT_NAME_PLACEHOLDER_access.log;
    error_log /var/log/nginx/PROJECT_NAME_PLACEHOLDER_error.log;
}
NGINX_CONFIG_EOF

# Replace placeholders
sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" ${NGINX_CONF}
sed -i "s/PROJECT_NAME_PLACEHOLDER/${PROJECT_NAME}/g" ${NGINX_CONF}

# Enable the site
ln -sf ${NGINX_CONF} ${NGINX_ENABLED}

# Remove default nginx site if it exists
if [[ -L "/etc/nginx/sites-enabled/default" ]]; then
    rm /etc/nginx/sites-enabled/default
    print_step "Removed default nginx site"
fi

# Test nginx configuration
print_step "Testing nginx configuration..."
if nginx -t; then
    print_step "nginx configuration is valid"
else
    print_error "nginx configuration test failed"
    exit 1
fi

# Reload nginx
systemctl reload nginx
print_step "nginx reloaded successfully"

################################################################################
# Step 4: Configure firewall (UFW)
################################################################################

print_step "Step 4: Configuring firewall..."

if command -v ufw &> /dev/null; then
    # Allow nginx through firewall
    ufw allow 'Nginx Full'

    # Allow SSH
    ufw allow 'OpenSSH'

    # Enable firewall if not already enabled
    if ! ufw status | grep -q "Status: active"; then
        print_warning "Enabling UFW firewall..."
        echo "y" | ufw enable
    fi

    print_step "Firewall configured"
else
    print_warning "UFW not installed. Skipping firewall configuration."
fi

################################################################################
# Step 5: Enable and start nginx
################################################################################

print_step "Step 5: Enabling and starting nginx..."

systemctl enable nginx
systemctl restart nginx

if systemctl is-active --quiet nginx; then
    print_step "nginx is running"
else
    print_error "nginx failed to start"
    systemctl status nginx
    exit 1
fi

################################################################################
# Step 6: SSL/TLS Setup (Optional - Let's Encrypt)
################################################################################

print_step "Step 6: SSL/TLS Setup..."

if [[ "${DOMAIN}" != "localhost" ]] && [[ "${DOMAIN}" != *".local"* ]]; then
    print_step "Installing Certbot for Let's Encrypt SSL..."

    # Install certbot and nginx plugin
    apt-get install -y certbot python3-certbot-nginx dig

    if ! command -v certbot &> /dev/null; then
        print_error "Certbot installation failed"
        print_warning "SSL setup skipped. You can install manually with: apt-get install certbot python3-certbot-nginx"
    else
        print_step "Certbot installed successfully"

        # Check if domain resolves to this server
        print_step "Checking DNS resolution for ${DOMAIN}..."

        SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "unknown")
        DOMAIN_IP=$(dig +short ${DOMAIN} 2>/dev/null | tail -n1)

        if [[ -z "${DOMAIN_IP}" ]]; then
            print_warning "Domain ${DOMAIN} does not resolve to any IP address"
            print_warning "Please configure your DNS A record to point to: ${SERVER_IP}"
            print_warning "SSL certificate cannot be issued until DNS is configured"
            print_warning "After DNS is configured, run: sudo certbot --nginx -d ${DOMAIN}"
        elif [[ "${DOMAIN_IP}" != "${SERVER_IP}" ]] && [[ "${SERVER_IP}" != "unknown" ]]; then
            print_warning "Domain ${DOMAIN} resolves to ${DOMAIN_IP} but server IP is ${SERVER_IP}"
            print_warning "DNS mismatch detected. SSL certificate issuance may fail."
            print_warning "Please update your DNS A record to point to: ${SERVER_IP}"
            print_warning "After DNS is fixed, run: sudo certbot --nginx -d ${DOMAIN}"
        else
            print_step "DNS configured correctly. ${DOMAIN} -> ${SERVER_IP}"
            print_step "Obtaining SSL certificate from Let's Encrypt..."

            # Prompt for email for important notices
            echo ""
            echo -e "${YELLOW}Enter email address for SSL certificate notifications (or press Enter to skip):${NC}"
            read -r -p "Email: " ssl_email

            # Build certbot command
            CERTBOT_CMD="certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos"

            if [[ -n "${ssl_email}" ]]; then
                CERTBOT_CMD="${CERTBOT_CMD} --email ${ssl_email}"
            else
                CERTBOT_CMD="${CERTBOT_CMD} --register-unsafely-without-email"
            fi

            # Add redirect option
            CERTBOT_CMD="${CERTBOT_CMD} --redirect"

            # Run certbot
            if ${CERTBOT_CMD}; then
                print_step "✓ SSL certificate obtained and installed successfully"
                print_step "✓ HTTPS is now enabled for ${DOMAIN}"
                print_step "✓ HTTP requests will automatically redirect to HTTPS"

                # Set up auto-renewal
                systemctl enable certbot.timer
                systemctl start certbot.timer

                print_step "✓ Automatic SSL certificate renewal configured"

                # Test renewal
                print_step "Testing automatic renewal..."
                if certbot renew --dry-run 2>/dev/null; then
                    print_step "✓ Automatic renewal test passed"
                else
                    print_warning "Automatic renewal test failed, but certificate is installed"
                fi

                # Add renewal cron job as backup
                CRON_JOB="0 0,12 * * * /usr/bin/certbot renew --quiet"
                (crontab -l 2>/dev/null | grep -v "certbot renew"; echo "${CRON_JOB}") | crontab -
                print_step "✓ Backup renewal cron job added (runs twice daily)"

            else
                print_error "SSL certificate issuance failed"
                print_warning "Common reasons for failure:"
                print_warning "  1. Domain not pointing to this server"
                print_warning "  2. Port 80 not accessible from internet"
                print_warning "  3. Firewall blocking Let's Encrypt validation"
                print_warning "  4. Rate limit reached (5 certificates per week per domain)"
                print_warning ""
                print_warning "You can try again manually with:"
                print_warning "  sudo certbot --nginx -d ${DOMAIN}"
                print_warning ""
                print_warning "Website is still accessible via HTTP at: http://${DOMAIN}"
            fi
        fi
    fi
else
    print_warning "SSL not available for localhost or local domains"
    print_warning "If you need SSL for local development, consider using mkcert"
fi

################################################################################
# Step 7: Create deployment info file
################################################################################

print_step "Step 7: Creating deployment info..."

cat > ${WEB_ROOT}/deployment-info.txt << EOF
TRENCH Website Deployment Information
=====================================
Deployment Date: $(date)
Domain: ${DOMAIN}
Web Root: ${WEB_ROOT}
nginx Config: ${NGINX_CONF}
nginx User: www-data

File Structure:
${WEB_ROOT}/
├── index.html
├── style.css
├── script.js
└── img/

Useful Commands:
- Restart nginx: sudo systemctl restart nginx
- Check nginx status: sudo systemctl status nginx
- View nginx logs: sudo tail -f /var/log/nginx/${PROJECT_NAME}_error.log
- Test nginx config: sudo nginx -t
- Edit nginx config: sudo nano ${NGINX_CONF}
- Reload nginx: sudo systemctl reload nginx

SSL Renewal (if configured):
- Manual renewal: sudo certbot renew
- Check renewal timer: sudo systemctl status certbot.timer
EOF

chmod 644 ${WEB_ROOT}/deployment-info.txt

################################################################################
# Step 8: Security hardening
################################################################################

print_step "Step 8: Applying security hardening..."

# Update nginx main config for security
NGINX_MAIN_CONF="/etc/nginx/nginx.conf"

# Hide nginx version
if ! grep -q "server_tokens off" ${NGINX_MAIN_CONF}; then
    sed -i '/http {/a \    server_tokens off;' ${NGINX_MAIN_CONF}
    print_step "nginx version hiding enabled"
fi

# Set client body size limit
if ! grep -q "client_max_body_size" ${NGINX_MAIN_CONF}; then
    sed -i '/http {/a \    client_max_body_size 10M;' ${NGINX_MAIN_CONF}
    print_step "Client body size limit set"
fi

# Reload nginx to apply security changes
systemctl reload nginx

################################################################################
# Step 9: Create update script
################################################################################

print_step "Step 9: Creating update script..."

cat > /usr/local/bin/update-trench << 'UPDATE_SCRIPT_EOF'
#!/bin/bash

# TRENCH Website Update Script
# Usage: sudo update-trench [source_directory]

set -e

WEB_ROOT="/var/www/trench"
SOURCE_DIR=${1:-$(pwd)}

echo "Updating TRENCH website..."
echo "Source: ${SOURCE_DIR}"
echo "Destination: ${WEB_ROOT}"

# Backup current version
BACKUP_DIR="/var/backups/trench/$(date +%Y%m%d_%H%M%S)"
mkdir -p ${BACKUP_DIR}
cp -r ${WEB_ROOT}/* ${BACKUP_DIR}/
echo "Backup created: ${BACKUP_DIR}"

# Copy new files
cp -rf ${SOURCE_DIR}/index.html ${WEB_ROOT}/
cp -rf ${SOURCE_DIR}/style.css ${WEB_ROOT}/
cp -rf ${SOURCE_DIR}/script.js ${WEB_ROOT}/

if [[ -d "${SOURCE_DIR}/img" ]]; then
    cp -rf ${SOURCE_DIR}/img/* ${WEB_ROOT}/img/
fi

# Set permissions
chown -R www-data:www-data ${WEB_ROOT}
chmod -R 755 ${WEB_ROOT}

# Clear nginx cache (if any)
systemctl reload nginx

echo "Update complete!"
echo "Backup location: ${BACKUP_DIR}"
UPDATE_SCRIPT_EOF

chmod +x /usr/local/bin/update-trench
print_step "Update script created: /usr/local/bin/update-trench"

################################################################################
# Deployment Complete
################################################################################

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  TRENCH Website Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Website URL: http://${DOMAIN}"
if [[ "${DOMAIN}" != "localhost" ]]; then
    echo "             https://${DOMAIN} (if SSL configured)"
fi
echo ""
echo "Web Root: ${WEB_ROOT}"
echo "nginx Config: ${NGINX_CONF}"
echo ""
echo "Useful Commands:"
echo "  - Update website: sudo update-trench [source_directory]"
echo "  - Restart nginx: sudo systemctl restart nginx"
echo "  - View logs: sudo tail -f /var/log/nginx/${PROJECT_NAME}_error.log"
echo "  - Test config: sudo nginx -t"
echo ""
echo "Deployment info saved to: ${WEB_ROOT}/deployment-info.txt"
echo ""
echo -e "${GREEN}Visit your website at: http://${DOMAIN}${NC}"
echo ""
