#!/bin/bash

# 🔄 Database Restore Script
# This script restores database from backups

echo "🔄 Boutique Advisory Platform - Database Restore"
echo "=============================================="

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

BACKUP_DIR="./database-backups"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ Backup directory not found: $BACKUP_DIR${NC}"
    exit 1
fi

# List available backups
echo -e "${BLUE}📁 Available Backups:${NC}"
echo "----------------------"

SQL_BACKUPS=($(ls -t "$BACKUP_DIR"/boutique_advisory_backup_*.sql 2>/dev/null))
VOLUME_BACKUPS=($(ls -t "$BACKUP_DIR"/volume_backup_*.tar 2>/dev/null))

if [ ${#SQL_BACKUPS[@]} -eq 0 ]; then
    echo -e "${RED}❌ No SQL backups found${NC}"
    exit 1
fi

echo -e "${GREEN}SQL Backups:${NC}"
for i in "${!SQL_BACKUPS[@]}"; do
    BACKUP_FILE=$(basename "${SQL_BACKUPS[$i]}")
    BACKUP_SIZE=$(du -h "${SQL_BACKUPS[$i]}" | cut -f1)
    echo "  $((i+1)). $BACKUP_FILE ($BACKUP_SIZE)"
done

echo ""
echo -e "${GREEN}Volume Backups:${NC}"
for i in "${!VOLUME_BACKUPS[@]}"; do
    BACKUP_FILE=$(basename "${VOLUME_BACKUPS[$i]}")
    BACKUP_SIZE=$(du -h "${VOLUME_BACKUPS[$i]}" | cut -f1)
    echo "  $((i+1)). $BACKUP_FILE ($BACKUP_SIZE)"
done

echo ""
echo -e "${YELLOW}⚠️  WARNING: This will overwrite current database data!${NC}"
read -p "Do you want to proceed with restore? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

# Select backup to restore
echo ""
echo -e "${BLUE}🔍 Select Backup to Restore:${NC}"
echo "----------------------------"

if [ ${#SQL_BACKUPS[@]} -gt 0 ]; then
    echo -e "${GREEN}Latest SQL backup: ${SQL_BACKUPS[0]}${NC}"
    read -p "Use latest SQL backup? (Y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo "Please specify the backup file path:"
        read -p "Backup file: " BACKUP_FILE
        if [ ! -f "$BACKUP_FILE" ]; then
            echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
            exit 1
        fi
    else
        BACKUP_FILE="${SQL_BACKUPS[0]}"
    fi
else
    echo -e "${RED}❌ No SQL backups available${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔄 Starting Database Restore${NC}"
echo "----------------------------"

# Stop services
echo -e "${YELLOW}1. Stopping services...${NC}"
docker-compose stop boutique-advisory-backend boutique-advisory-postgres
print_status 0 "Services stopped"

# Start only database
echo -e "${YELLOW}2. Starting database...${NC}"
docker-compose start boutique-advisory-postgres
sleep 5
print_status 0 "Database started"

# Wait for database to be ready
echo -e "${YELLOW}3. Waiting for database to be ready...${NC}"
for i in {1..30}; do
    if docker-compose exec -T boutique-advisory-postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_status 0 "Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_status 1 "Database failed to start"
        exit 1
    fi
    sleep 1
done

# Drop and recreate database
echo -e "${YELLOW}4. Preparing database for restore...${NC}"
docker-compose exec -T boutique-advisory-postgres psql -U postgres -c "DROP DATABASE IF EXISTS boutique_advisory;" >/dev/null 2>&1
docker-compose exec -T boutique-advisory-postgres psql -U postgres -c "CREATE DATABASE boutique_advisory;" >/dev/null 2>&1
print_status 0 "Database prepared"

# Restore from backup
echo -e "${YELLOW}5. Restoring from backup: $(basename "$BACKUP_FILE")${NC}"
if docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory < "$BACKUP_FILE" >/dev/null 2>&1; then
    print_status 0 "Database restored successfully"
else
    print_status 1 "Database restore failed"
    exit 1
fi

# Verify restore
echo -e "${YELLOW}6. Verifying restore...${NC}"
USER_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
SME_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM smes;" 2>/dev/null | tr -d ' ')

if [ "$USER_COUNT" -gt 0 ] && [ "$SME_COUNT" -gt 0 ]; then
    print_status 0 "Restore verified (Users: $USER_COUNT, SMEs: $SME_COUNT)"
else
    print_status 1 "Restore verification failed"
    exit 1
fi

# Start backend
echo -e "${YELLOW}7. Starting backend...${NC}"
docker-compose start boutique-advisory-backend
sleep 5
print_status 0 "Backend started"

# Test API
echo -e "${YELLOW}8. Testing API...${NC}"
sleep 3
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:1000/health")
if [ "$API_RESPONSE" -eq 200 ]; then
    print_status 0 "API is responding"
else
    print_status 1 "API test failed (Status: $API_RESPONSE)"
fi

echo ""
echo -e "${BLUE}🎯 Restore Summary${NC}"
echo "=================="

echo -e "${GREEN}✅ Database restore completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📊 Restored Data:${NC}"
echo "  - Users: $USER_COUNT"
echo "  - SMEs: $SME_COUNT"
echo ""
echo -e "${YELLOW}🔑 Test Credentials:${NC}"
echo "  - Admin: admin@boutique-advisory.com / admin123"
echo "  - Advisor: advisor@boutique-advisory.com / advisor123"
echo "  - Investor: investor@boutique-advisory.com / investor123"
echo "  - SME: sme@boutique-advisory.com / sme123"
echo ""
echo -e "${BLUE}🌐 Ready for Testing:${NC}"
echo "  - Platform: http://localhost:1001"
echo "  - Database Admin: http://localhost:1004"
echo "  - API: http://localhost:1000"
echo ""
echo -e "${GREEN}🎉 Database restore complete!${NC}"


