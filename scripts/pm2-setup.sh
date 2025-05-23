#!/bin/bash

# PM2 Setup Script for CareUnity Network
# This script sets up PM2 with enhanced monitoring and logging capabilities

set -e

echo "🚀 Setting up PM2 for CareUnity Network..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    npm install -g pm2
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs
mkdir -p backups

# Install PM2 modules for enhanced functionality
echo "🔧 Installing PM2 modules..."

# Log rotation module
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:date_format YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:worker_interval 30
pm2 set pm2-logrotate:rotate_interval "0 0 * * *"

# Server monitoring module
pm2 install pm2-server-monit

# Auto-pull module (optional - for development environments)
if [ "$NODE_ENV" = "development" ] || [ "$NODE_ENV" = "staging" ]; then
    pm2 install pm2-auto-pull
    pm2 set pm2-auto-pull:enabled false  # Disabled by default
fi

# Install process monitoring
pm2 install pm2-process-list

# Set up PM2 startup script
echo "⚙️ Setting up PM2 startup script..."
pm2 startup

# Create PM2 ecosystem configuration backup
echo "💾 Creating configuration backup..."
cp ecosystem.config.js backups/ecosystem.config.backup.$(date +%Y%m%d_%H%M%S).js

# Set up log rotation for application logs
echo "📋 Configuring log rotation..."
sudo tee /etc/logrotate.d/careunity-logs > /dev/null <<EOF
/var/www/careunity-*/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 careunity careunity
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Set up health check script
echo "🏥 Setting up health check script..."
cat > scripts/health-check.sh << 'EOF'
#!/bin/bash

# Health check script for CareUnity Network
HEALTH_URL=${1:-http://localhost:3000/health}
TIMEOUT=${2:-5}

response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT $HEALTH_URL)

if [ $response -eq 200 ]; then
    echo "✅ Health check passed"
    exit 0
else
    echo "❌ Health check failed (HTTP $response)"
    exit 1
fi
EOF

chmod +x scripts/health-check.sh

# Set up monitoring script
echo "📊 Setting up monitoring script..."
cat > scripts/monitor.sh << 'EOF'
#!/bin/bash

# PM2 monitoring script
echo "=== PM2 Process Status ==="
pm2 status

echo -e "\n=== System Resources ==="
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "Memory Usage: $(free | grep Mem | awk '{printf("%.2f%%", $3/$2 * 100.0)}')"
echo "Disk Usage: $(df -h / | awk 'NR==2{printf "%s", $5}')"

echo -e "\n=== Application Health ==="
./scripts/health-check.sh

echo -e "\n=== Recent Errors ==="
pm2 logs --err --lines 5

echo -e "\n=== Process Details ==="
pm2 describe all
EOF

chmod +x scripts/monitor.sh

# Set up backup script
echo "💾 Setting up backup script..."
cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# Backup script for CareUnity Network
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🔄 Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR/$DATE

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_DIR/$DATE/

# Backup application configuration
cp ecosystem.config.js $BACKUP_DIR/$DATE/
cp package.json $BACKUP_DIR/$DATE/
cp package-lock.json $BACKUP_DIR/$DATE/

# Backup environment variables (without sensitive data)
env | grep -E '^(NODE_ENV|PORT|LOG_LEVEL)=' > $BACKUP_DIR/$DATE/env.backup

# Backup logs (last 7 days)
find logs -name "*.log" -mtime -7 -exec cp {} $BACKUP_DIR/$DATE/ \;

# Compress backup
tar -czf $BACKUP_DIR/careunity-backup-$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE

echo "✅ Backup completed: $BACKUP_DIR/careunity-backup-$DATE.tar.gz"

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "careunity-backup-*.tar.gz" -mtime +30 -delete

# Upload to S3 if configured
if [ ! -z "$BACKUP_S3_BUCKET" ]; then
    aws s3 cp $BACKUP_DIR/careunity-backup-$DATE.tar.gz s3://$BACKUP_S3_BUCKET/
    echo "📤 Backup uploaded to S3"
fi
EOF

chmod +x scripts/backup.sh

# Set up deployment verification script
echo "🔍 Setting up deployment verification..."
cat > scripts/verify-deployment.sh << 'EOF'
#!/bin/bash

# Deployment verification script
echo "🔍 Verifying deployment..."

# Check if processes are running
if ! pm2 list | grep -q "online"; then
    echo "❌ No PM2 processes are online"
    exit 1
fi

# Check health endpoints
for port in 3000 3001; do
    if ! curl -f http://localhost:$port/health > /dev/null 2>&1; then
        echo "❌ Health check failed for port $port"
        exit 1
    fi
done

# Check database connectivity
if ! npm run db:check; then
    echo "❌ Database connectivity check failed"
    exit 1
fi

# Check logs for critical errors
if pm2 logs --err --lines 50 | grep -i "critical\|fatal\|error"; then
    echo "⚠️ Critical errors found in logs"
    exit 1
fi

echo "✅ Deployment verification successful"
EOF

chmod +x scripts/verify-deployment.sh

# Set up alerting script
echo "🚨 Setting up alerting script..."
cat > scripts/alert.sh << 'EOF'
#!/bin/bash

# Alerting script for PM2 events
MESSAGE="$1"
SEVERITY="$2"
WEBHOOK_URL="$SLACK_WEBHOOK_URL"

if [ -z "$MESSAGE" ]; then
    echo "Usage: $0 <message> [severity]"
    exit 1
fi

# Send Slack notification if webhook is configured
if [ ! -z "$WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🔔 CareUnity Alert: $MESSAGE\", \"channel\":\"#careunity-alerts\"}" \
        $WEBHOOK_URL
fi

# Send email if configured
if [ ! -z "$ALERT_EMAIL" ]; then
    echo "$MESSAGE" | mail -s "CareUnity Alert: $SEVERITY" $ALERT_EMAIL
fi

# Log alert
echo "$(date): $SEVERITY - $MESSAGE" >> logs/alerts.log
EOF

chmod +x scripts/alert.sh

echo "✅ PM2 setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure environment variables in .env file"
echo "2. Run 'pm2 start ecosystem.config.js --env production'"
echo "3. Run 'pm2 save' to persist the configuration"
echo "4. Set up monitoring with 'pm2 monit'"
echo ""
echo "Available commands:"
echo "- ./scripts/monitor.sh    - View system status"
echo "- ./scripts/backup.sh     - Create backup"
echo "- ./scripts/health-check.sh - Check application health"
echo "- ./scripts/verify-deployment.sh - Verify deployment"
