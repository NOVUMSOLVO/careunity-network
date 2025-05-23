#!/bin/bash

# Database Migration Script for PM2 Deployment
# This script handles database migrations during PM2 deployment

set -e  # Exit on any error

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-careunity}
DB_USER=${DB_USER:-careunity_user}
BACKUP_DIR=${BACKUP_DIR:-./backups/migrations}
LOG_FILE=${LOG_FILE:-./logs/migration.log}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a $LOG_FILE
}

# Create necessary directories
mkdir -p $(dirname $LOG_FILE)
mkdir -p $BACKUP_DIR

log "Starting database migration process..."

# Check if database is accessible
check_database() {
    log "Checking database connectivity..."
    
    if command -v psql >/dev/null 2>&1; then
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" >/dev/null 2>&1; then
            log "Database connection successful"
            return 0
        else
            error "Cannot connect to database"
            return 1
        fi
    else
        warn "PostgreSQL client (psql) not found, skipping database connectivity check"
        return 0
    fi
}

# Create database backup before migration
create_backup() {
    log "Creating database backup..."
    
    local backup_file="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if command -v pg_dump >/dev/null 2>&1; then
        if PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $backup_file 2>/dev/null; then
            log "Database backup created: $backup_file"
            
            # Compress backup
            gzip $backup_file
            log "Backup compressed: ${backup_file}.gz"
            
            # Keep only last 10 backups
            cd $BACKUP_DIR
            ls -t backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm
            log "Old backups cleaned up"
        else
            warn "Failed to create database backup, continuing without backup"
        fi
    else
        warn "pg_dump not found, skipping backup creation"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Check if we're using Drizzle migrations
    if [ -d "./drizzle" ]; then
        log "Found Drizzle migrations directory"
        
        if [ -f "./package.json" ] && grep -q "drizzle-kit" package.json; then
            log "Running Drizzle migrations..."
            
            # Install dependencies if needed
            if [ ! -d "./node_modules" ]; then
                log "Installing dependencies..."
                npm ci --production
            fi
            
            # Run migrations
            npx drizzle-kit push:pg 2>&1 | tee -a $LOG_FILE
            
            if [ $? -eq 0 ]; then
                log "Drizzle migrations completed successfully"
            else
                error "Drizzle migrations failed"
                return 1
            fi
        else
            warn "Drizzle Kit not found in package.json"
        fi
    fi
    
    # Check for custom migration scripts
    if [ -d "./migrations" ]; then
        log "Found custom migrations directory"
        
        for migration_file in ./migrations/*.sql; do
            if [ -f "$migration_file" ]; then
                log "Running migration: $(basename $migration_file)"
                
                if command -v psql >/dev/null 2>&1; then
                    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migration_file 2>&1 | tee -a $LOG_FILE
                    
                    if [ $? -eq 0 ]; then
                        log "Migration $(basename $migration_file) completed"
                    else
                        error "Migration $(basename $migration_file) failed"
                        return 1
                    fi
                else
                    warn "PostgreSQL client not found, skipping SQL migrations"
                fi
            fi
        done
    fi
    
    return 0
}

# Seed data if needed
seed_data() {
    log "Checking if data seeding is needed..."
    
    if [ -f "./scripts/seed-data.js" ] || [ -f "./scripts/seed-data.ts" ]; then
        log "Found seed data script"
        
        # Check if database is empty (no service users)
        if command -v psql >/dev/null 2>&1; then
            local count=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM service_users;" 2>/dev/null | tr -d ' ')
            
            if [ "$count" = "0" ]; then
                log "Database appears empty, running seed data..."
                
                if [ -f "./scripts/seed-data.js" ]; then
                    node ./scripts/seed-data.js 2>&1 | tee -a $LOG_FILE
                elif [ -f "./scripts/seed-data.ts" ]; then
                    npx ts-node ./scripts/seed-data.ts 2>&1 | tee -a $LOG_FILE
                fi
                
                log "Data seeding completed"
            else
                log "Database contains data, skipping seeding"
            fi
        else
            warn "Cannot check database contents, skipping seeding"
        fi
    else
        log "No seed data script found"
    fi
}

# Update database indexes
update_indexes() {
    log "Updating database indexes..."
    
    if [ -f "./scripts/update-indexes.sql" ]; then
        log "Running index updates..."
        
        if command -v psql >/dev/null 2>&1; then
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./scripts/update-indexes.sql 2>&1 | tee -a $LOG_FILE
            log "Index updates completed"
        else
            warn "PostgreSQL client not found, skipping index updates"
        fi
    else
        log "No index update script found"
    fi
}

# Verify migration success
verify_migration() {
    log "Verifying migration success..."
    
    if command -v psql >/dev/null 2>&1; then
        # Check if essential tables exist
        local tables=("users" "service_users" "care_plans" "visits" "tasks")
        
        for table in "${tables[@]}"; do
            local exists=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');" 2>/dev/null | tr -d ' ')
            
            if [ "$exists" = "t" ]; then
                log "Table $table exists"
            else
                error "Table $table is missing"
                return 1
            fi
        done
        
        log "All essential tables verified"
    else
        warn "Cannot verify migration, PostgreSQL client not found"
    fi
    
    return 0
}

# Main migration process
main() {
    log "=== Database Migration Started ==="
    
    # Check database connectivity
    if ! check_database; then
        error "Database check failed, aborting migration"
        exit 1
    fi
    
    # Create backup
    create_backup
    
    # Run migrations
    if ! run_migrations; then
        error "Migration failed, check logs for details"
        exit 1
    fi
    
    # Seed initial data if needed
    seed_data
    
    # Update indexes
    update_indexes
    
    # Verify migration
    if ! verify_migration; then
        error "Migration verification failed"
        exit 1
    fi
    
    log "=== Database Migration Completed Successfully ==="
}

# Handle script arguments
case "${1:-}" in
    "backup")
        log "Creating database backup only..."
        check_database && create_backup
        ;;
    "migrate")
        log "Running migrations only..."
        check_database && run_migrations
        ;;
    "seed")
        log "Running data seeding only..."
        check_database && seed_data
        ;;
    "verify")
        log "Verifying database only..."
        check_database && verify_migration
        ;;
    "full"|"")
        main
        ;;
    *)
        echo "Usage: $0 [backup|migrate|seed|verify|full]"
        echo "  backup  - Create database backup only"
        echo "  migrate - Run migrations only"
        echo "  seed    - Seed initial data only"
        echo "  verify  - Verify database structure"
        echo "  full    - Run complete migration process (default)"
        exit 1
        ;;
esac
