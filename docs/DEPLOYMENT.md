# Deployment Guide

This guide covers various deployment options for CareUnity Network.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis (optional, for caching)
- SSL certificate (for production)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-secure-session-secret
JWT_SECRET=your-secure-jwt-secret

# Optional
REDIS_URL=redis://host:port
NODE_ENV=production
PORT=3000
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. Clone the repository
2. Configure environment variables
3. Run with Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- CareUnity application

### Manual Docker Build

```bash
# Build the image
docker build -t careunity-network .

# Run the container
docker run -d \
  --name careunity-app \
  -p 3000:3000 \
  -e DATABASE_URL=your-database-url \
  -e SESSION_SECRET=your-session-secret \
  careunity-network
```

## Traditional Deployment

### 1. Server Setup

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2
```

### 2. Application Setup

```bash
# Clone and install
git clone https://github.com/NOVUMSOLVO/careunity-network.git
cd careunity-network
npm install

# Build the application
npm run build

# Set up database
npm run db:migrate
```

### 3. PM2 Deployment

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

## Cloud Platform Deployment

### AWS Deployment

#### Using AWS ECS

1. Build and push Docker image to ECR
2. Create ECS task definition
3. Deploy to ECS service
4. Configure load balancer and auto-scaling

#### Using AWS Elastic Beanstalk

1. Install EB CLI
2. Initialize Elastic Beanstalk application
3. Deploy:

```bash
eb init
eb create production
eb deploy
```

### Azure Deployment

#### Using Azure Container Instances

```bash
# Create resource group
az group create --name careunity-rg --location eastus

# Deploy container
az container create \
  --resource-group careunity-rg \
  --name careunity-app \
  --image your-registry/careunity-network \
  --ports 3000 \
  --environment-variables DATABASE_URL=your-db-url
```

### Google Cloud Deployment

#### Using Cloud Run

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/careunity-network

# Deploy to Cloud Run
gcloud run deploy careunity-network \
  --image gcr.io/PROJECT-ID/careunity-network \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Database Setup

### PostgreSQL

```sql
-- Create database and user
CREATE DATABASE careunity;
CREATE USER careunity WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE careunity TO careunity;
```

### Migrations

```bash
# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

## SSL/HTTPS Setup

### Using Let's Encrypt with Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring and Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs

# Monitor processes
pm2 monit

# Restart application
pm2 restart all
```

### Health Checks

The application provides health check endpoints:
- `/api/health` - Basic health check
- `/api/health/detailed` - Detailed system status

## Backup Strategy

### Database Backups

```bash
# Create backup
pg_dump -h localhost -U careunity careunity > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U careunity careunity < backup_file.sql
```

### Automated Backups

Set up cron job for regular backups:

```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **Database**: Use strong passwords and restrict access
3. **SSL**: Always use HTTPS in production
4. **Firewall**: Restrict access to necessary ports only
5. **Updates**: Keep dependencies updated
6. **Monitoring**: Set up security monitoring and alerts

## Troubleshooting

### Common Issues

1. **Database Connection**: Check DATABASE_URL and network connectivity
2. **Port Conflicts**: Ensure port 3000 is available
3. **Memory Issues**: Monitor memory usage and adjust limits
4. **SSL Errors**: Verify certificate configuration

### Logs

Check application logs for errors:

```bash
# PM2 logs
pm2 logs

# Docker logs
docker logs careunity-app

# System logs
journalctl -u careunity-app
```

For additional support, please refer to the main documentation or contact support.
