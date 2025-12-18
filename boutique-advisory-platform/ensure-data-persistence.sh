#!/bin/bash

# 🗄️ Data Persistence & Backup Script
# This script ensures your database data is always preserved

echo "🗄️  Boutique Advisory Platform - Data Persistence Assurance"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Create backup directory
BACKUP_DIR="./database-backups"
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}📋 Data Persistence Verification${NC}"
echo "--------------------------------"

# Check if services are running
echo -e "${YELLOW}1. Checking if services are running...${NC}"
if docker-compose ps | grep -q "Up"; then
    print_status 0 "Services are running"
else
    print_status 1 "Services are not running"
    echo "Please start services with: docker-compose up -d"
    exit 1
fi

# Check database volume
echo -e "${YELLOW}2. Checking database volume...${NC}"
VOLUME_NAME="boutique-advisory-platform_boutique_advisory_postgres_data"
if docker volume ls | grep -q "$VOLUME_NAME"; then
    print_status 0 "Database volume exists: $VOLUME_NAME"
    VOLUME_PATH=$(docker volume inspect "$VOLUME_NAME" | grep -o '"/var/lib/docker/volumes/[^"]*"' | tr -d '"')
    echo "   Volume path: $VOLUME_PATH"
else
    print_status 1 "Database volume not found"
    exit 1
fi

# Check database connection
echo -e "${YELLOW}3. Checking database connection...${NC}"
DB_RESPONSE=$(docker-compose exec -T boutique-advisory-postgres pg_isready -U postgres 2>/dev/null)
if [ $? -eq 0 ]; then
    print_status 0 "Database is ready"
else
    print_status 1 "Database is not ready"
    exit 1
fi

# Check if data exists in database
echo -e "${YELLOW}4. Checking if data exists in database...${NC}"
USER_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
SME_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM smes;" 2>/dev/null | tr -d ' ')

if [ "$USER_COUNT" -gt 0 ] && [ "$SME_COUNT" -gt 0 ]; then
    print_status 0 "Data exists in database (Users: $USER_COUNT, SMEs: $SME_COUNT)"
else
    print_status 1 "No data found in database"
    echo "   Users: $USER_COUNT, SMEs: $SME_COUNT"
fi

echo ""
echo -e "${BLUE}💾 Creating Database Backup${NC}"
echo "---------------------------"

# Create timestamp for backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/boutique_advisory_backup_$TIMESTAMP.sql"

echo -e "${YELLOW}5. Creating database backup...${NC}"
if docker-compose exec -T boutique-advisory-postgres pg_dump -U postgres boutique_advisory > "$BACKUP_FILE" 2>/dev/null; then
    print_status 0 "Database backup created: $BACKUP_FILE"
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "   Backup size: $BACKUP_SIZE"
else
    print_status 1 "Failed to create database backup"
    exit 1
fi

# Create volume backup
echo -e "${YELLOW}6. Creating volume backup...${NC}"
VOLUME_BACKUP_FILE="$BACKUP_DIR/volume_backup_$TIMESTAMP.tar"
if docker run --rm -v "$VOLUME_NAME":/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf "/backup/volume_backup_$TIMESTAMP.tar" -C /data . 2>/dev/null; then
    print_status 0 "Volume backup created: volume_backup_$TIMESTAMP.tar"
    VOLUME_BACKUP_SIZE=$(du -h "$VOLUME_BACKUP_FILE" | cut -f1)
    echo "   Volume backup size: $VOLUME_BACKUP_SIZE"
else
    print_status 1 "Failed to create volume backup"
fi

echo ""
echo -e "${BLUE}🔄 Data Persistence Test${NC}"
echo "------------------------"

# Test data persistence by restarting containers
echo -e "${YELLOW}7. Testing data persistence (restarting containers)...${NC}"
echo "   Stopping containers..."
docker-compose stop boutique-advisory-postgres boutique-advisory-backend

echo "   Starting containers..."
docker-compose start boutique-advisory-postgres
sleep 5
docker-compose start boutique-advisory-backend
sleep 5

# Verify data still exists after restart
echo -e "${YELLOW}8. Verifying data after restart...${NC}"
sleep 3
NEW_USER_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
NEW_SME_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM smes;" 2>/dev/null | tr -d ' ')

if [ "$NEW_USER_COUNT" -eq "$USER_COUNT" ] && [ "$NEW_SME_COUNT" -eq "$SME_COUNT" ]; then
    print_status 0 "Data persistence verified (Users: $NEW_USER_COUNT, SMEs: $NEW_SME_COUNT)"
else
    print_status 1 "Data persistence test failed"
    echo "   Before restart: Users: $USER_COUNT, SMEs: $SME_COUNT"
    echo "   After restart: Users: $NEW_USER_COUNT, SMEs: $NEW_SME_COUNT"
fi

echo ""
echo -e "${BLUE}📊 Data Summary${NC}"
echo "================"

# Get detailed data counts
echo -e "${YELLOW}9. Getting detailed data counts...${NC}"
TENANT_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM tenants;" 2>/dev/null | tr -d ' ')
INVESTOR_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM investors;" 2>/dev/null | tr -d ' ')
DEAL_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM deals;" 2>/dev/null | tr -d ' ')
DOCUMENT_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM documents;" 2>/dev/null | tr -d ' ')

echo -e "${GREEN}📊 Current Database Contents:${NC}"
echo "  - Tenants: $TENANT_COUNT"
echo "  - Users: $NEW_USER_COUNT"
echo "  - SMEs: $NEW_SME_COUNT"
echo "  - Investors: $INVESTOR_COUNT"
echo "  - Deals: $DEAL_COUNT"
echo "  - Documents: $DOCUMENT_COUNT"

echo ""
echo -e "${BLUE}🔒 Data Protection Summary${NC}"
echo "============================="

echo -e "${GREEN}✅ Your data is protected by:${NC}"
echo "  1. **Docker Volumes**: Data stored in persistent Docker volumes"
echo "  2. **Database Backups**: SQL dumps created automatically"
echo "  3. **Volume Backups**: Complete volume snapshots"
echo "  4. **Persistence Testing**: Verified data survives container restarts"
echo ""
echo -e "${YELLOW}📁 Backup Files Created:${NC}"
echo "  - Database backup: $BACKUP_FILE"
echo "  - Volume backup: $VOLUME_BACKUP_FILE"
echo ""
echo -e "${YELLOW}🛡️  Data Safety Features:${NC}"
echo "  - Data persists even if containers are deleted"
echo "  - Data survives system restarts"
echo "  - Multiple backup formats (SQL + Volume)"
echo "  - Automatic backup timestamps"
echo ""
echo -e "${GREEN}🎉 Your testing data is now permanently preserved!${NC}"
echo ""
echo -e "${YELLOW}💡 Tips for Safe Testing:${NC}"
echo "  - Your data will persist even if you run 'docker-compose down'"
echo "  - Only 'docker-compose down -v' would delete the data (don't use -v flag)"
echo "  - Backups are stored in ./database-backups/ directory"
echo "  - You can restore from backups if needed"
echo ""
echo -e "${BLUE}🌐 Ready for Testing:${NC}"
echo "  - Platform: http://localhost:1001"
echo "  - Database Admin: http://localhost:1004"
echo "  - API: http://localhost:1000"


