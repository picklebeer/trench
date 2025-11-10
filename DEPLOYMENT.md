# TRENCH Website Deployment Guide

This guide provides comprehensive instructions for deploying the TRENCH cryptocurrency website on a Linux server using nginx.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Deployment](#manual-deployment)
- [Configuration Options](#configuration-options)
- [SSL/TLS Setup](#ssltls-setup)
- [Updating the Website](#updating-the-website)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## Prerequisites

### Server Requirements

- **Operating System**: Ubuntu 20.04+ or Debian 11+ (recommended)
- **RAM**: Minimum 512 MB (1 GB recommended)
- **Storage**: Minimum 1 GB free space
- **Access**: Root or sudo privileges
- **Network**: Public IP address (if accessible from internet)

### Domain Setup (Optional but Recommended)

If you want to use a custom domain:

1. Register a domain name
2. Point your domain's DNS A record to your server's IP address
3. Wait for DNS propagation (can take up to 48 hours, usually much faster)

### Local Testing

For local testing, you can use `localhost` as the domain name.

---

## Quick Start

### Automated Deployment

1. **Upload files to your server**:
   ```bash
   # On your local machine
   scp -r /path/to/trench root@your-server-ip:/root/
   ```

2. **SSH into your server**:
   ```bash
   ssh root@your-server-ip
   ```

3. **Navigate to the project directory**:
   ```bash
   cd /root/trench
   ```

4. **Make the deployment script executable**:
   ```bash
   chmod +x deploy.sh
   ```

5. **Run the deployment script**:
   ```bash
   # For a custom domain
   sudo ./deploy.sh yourdomain.com

   # For localhost (testing)
   sudo ./deploy.sh localhost
   ```

6. **Follow the prompts** for SSL setup (optional)

7. **Access your website**:
   - Open a browser and navigate to `http://yourdomain.com` or `http://your-server-ip`

---

## Manual Deployment

If you prefer to deploy manually or need more control:

### Step 1: Install nginx

```bash
sudo apt-get update
sudo apt-get install -y nginx
```

### Step 2: Create Web Directory

```bash
sudo mkdir -p /var/www/trench
```

### Step 3: Copy Website Files

```bash
# Copy HTML, CSS, and JavaScript
sudo cp index.html /var/www/trench/
sudo cp style.css /var/www/trench/
sudo cp script.js /var/www/trench/

# Copy images directory
sudo cp -r img /var/www/trench/
```

### Step 4: Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/trench
sudo chmod -R 755 /var/www/trench
```

### Step 5: Configure nginx

Create nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/trench
```

Add the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name yourdomain.com;  # Change this to your domain

    root /var/www/trench;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/javascript application/javascript;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/trench_access.log;
    error_log /var/log/nginx/trench_error.log;
}
```

### Step 6: Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/trench /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 7: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Allow SSH (if not already allowed)
sudo ufw allow 'OpenSSH'

# Enable firewall
sudo ufw enable
```

---

## Configuration Options

### Custom Port

To run nginx on a custom port (e.g., 8080):

Edit `/etc/nginx/sites-available/trench`:

```nginx
server {
    listen 8080;
    listen [::]:8080;
    # ... rest of config
}
```

### Multiple Domains

To serve the same site on multiple domains:

```nginx
server_name yourdomain.com www.yourdomain.com alternate-domain.com;
```

### Custom Error Pages

Create custom error pages and add to nginx config:

```nginx
error_page 404 /404.html;
location = /404.html {
    root /var/www/trench;
    internal;
}
```

---

## SSL/TLS Setup

### Using Let's Encrypt (Free SSL)

1. **Install Certbot**:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   ```

2. **Obtain SSL Certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Follow the prompts** to configure SSL

4. **Test Auto-Renewal**:
   ```bash
   sudo certbot renew --dry-run
   ```

5. **Certificate will auto-renew** via systemd timer

### Using Custom SSL Certificate

If you have your own SSL certificate:

1. **Copy certificate files**:
   ```bash
   sudo cp your-cert.crt /etc/ssl/certs/
   sudo cp your-key.key /etc/ssl/private/
   ```

2. **Update nginx config**:
   ```nginx
   server {
       listen 443 ssl http2;
       listen [::]:443 ssl http2;

       ssl_certificate /etc/ssl/certs/your-cert.crt;
       ssl_certificate_key /etc/ssl/private/your-key.key;

       # ... rest of config
   }

   # Redirect HTTP to HTTPS
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

3. **Reload nginx**:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## Updating the Website

### Using the Update Script (Automated Deployment)

If you used the automated deployment script, an update script was created:

```bash
# Upload updated files to server
scp -r /path/to/updated/trench root@your-server-ip:/root/trench-new

# SSH to server
ssh root@your-server-ip

# Run update script
sudo update-trench /root/trench-new
```

The script will:
- Create a backup of the current version
- Copy new files
- Set correct permissions
- Reload nginx

### Manual Update

```bash
# Backup current version
sudo cp -r /var/www/trench /var/backups/trench-$(date +%Y%m%d)

# Copy new files
sudo cp index.html /var/www/trench/
sudo cp style.css /var/www/trench/
sudo cp script.js /var/www/trench/
sudo cp -r img/* /var/www/trench/img/

# Set permissions
sudo chown -R www-data:www-data /var/www/trench
sudo chmod -R 755 /var/www/trench

# Clear browser cache (users may need to hard refresh)
sudo systemctl reload nginx
```

---

## Troubleshooting

### Website Not Loading

**Check nginx status**:
```bash
sudo systemctl status nginx
```

**Check nginx error logs**:
```bash
sudo tail -f /var/log/nginx/trench_error.log
```

**Test nginx configuration**:
```bash
sudo nginx -t
```

**Restart nginx**:
```bash
sudo systemctl restart nginx
```

### Permission Denied Errors

```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/trench
sudo chmod -R 755 /var/www/trench
```

### 404 Errors for Images

**Check image paths**:
```bash
ls -la /var/www/trench/img/
```

**Ensure images are uploaded**:
- All image files should be in `/var/www/trench/img/`
- Check file names match exactly (case-sensitive)

### SSL Certificate Issues

**Check certificate expiration**:
```bash
sudo certbot certificates
```

**Renew certificate manually**:
```bash
sudo certbot renew
```

**Check nginx SSL configuration**:
```bash
sudo nginx -t
```

### Port Already in Use

**Check what's using port 80**:
```bash
sudo lsof -i :80
```

**Stop conflicting service** (e.g., Apache):
```bash
sudo systemctl stop apache2
sudo systemctl disable apache2
```

### Firewall Blocking Access

**Check firewall status**:
```bash
sudo ufw status
```

**Allow nginx**:
```bash
sudo ufw allow 'Nginx Full'
```

---

## Security Best Practices

### 1. Keep System Updated

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Configure Fail2Ban

Protect against brute force attacks:

```bash
sudo apt-get install -y fail2ban

# Configure for nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Disable Directory Listing

Add to nginx config:
```nginx
autoindex off;
```

### 4. Rate Limiting

Add to nginx config to prevent DDoS:

```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

server {
    location / {
        limit_req zone=one burst=20;
        # ... rest of config
    }
}
```

### 5. Hide nginx Version

Edit `/etc/nginx/nginx.conf`:
```nginx
http {
    server_tokens off;
    # ... rest of config
}
```

### 6. Regular Backups

Create a backup cron job:

```bash
# Create backup script
sudo nano /usr/local/bin/backup-trench
```

Add:
```bash
#!/bin/bash
tar -czf /var/backups/trench-$(date +%Y%m%d).tar.gz /var/www/trench
find /var/backups -name "trench-*.tar.gz" -mtime +7 -delete
```

Make executable and schedule:
```bash
sudo chmod +x /usr/local/bin/backup-trench

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-trench
```

### 7. Monitor Logs

```bash
# Watch access logs
sudo tail -f /var/log/nginx/trench_access.log

# Watch error logs
sudo tail -f /var/log/nginx/trench_error.log
```

### 8. Use Content Security Policy (CSP)

Add to nginx config:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';" always;
```

---

## Performance Optimization

### Enable HTTP/2

```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;
```

### Browser Caching

Already configured in deployment script, but you can adjust:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;  # Cache for 1 year
    add_header Cache-Control "public, immutable";
}
```

### Compression

Gzip is already enabled, but you can tune it:

```nginx
gzip_comp_level 6;  # 1-9, higher = more compression but more CPU
gzip_min_length 1024;  # Only compress files > 1KB
```

---

## Monitoring

### Check nginx Status

```bash
sudo systemctl status nginx
```

### View Real-time Logs

```bash
# Access log
sudo tail -f /var/log/nginx/trench_access.log

# Error log
sudo tail -f /var/log/nginx/trench_error.log
```

### Monitor Server Resources

```bash
# CPU and Memory
htop

# Disk usage
df -h

# nginx connections
sudo ss -tln | grep :80
```

---

## Additional Resources

- [nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)
- [nginx Security Best Practices](https://www.nginx.com/blog/nginx-security-best-practices/)

---

## Support

For issues specific to this deployment:

1. Check the troubleshooting section above
2. Review nginx error logs: `/var/log/nginx/trench_error.log`
3. Verify file permissions and ownership
4. Test nginx configuration: `sudo nginx -t`

---

## License

This deployment guide is provided as-is for the TRENCH cryptocurrency website.
