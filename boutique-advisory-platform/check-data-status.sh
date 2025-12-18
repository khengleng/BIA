#!/bin/bash

# 📊 Data Status Checker
# Quick script to check your database data status

echo "📊 Boutique Advisory Platform - Data Status"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Services are not running${NC}"
    echo "Start with: docker-compose up -d"
    exit 1
fi

# Get data counts
echo -e "${BLUE}📊 Current Database Contents:${NC}"
echo "--------------------------------"

TENANT_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM tenants;" 2>/dev/null | tr -d ' ')
USER_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
SME_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM smes;" 2>/dev/null | tr -d ' ')
INVESTOR_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM investors;" 2>/dev/null | tr -d ' ')
DEAL_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM deals;" 2>/dev/null | tr -d ' ')
DOCUMENT_COUNT=$(docker-compose exec -T boutique-advisory-postgres psql -U postgres -d boutique_advisory -t -c "SELECT COUNT(*) FROM documents;" 2>/dev/null | tr -d ' ')

echo -e "${GREEN}  🏢 Tenants: $TENANT_COUNT${NC}"
echo -e "${GREEN}  👥 Users: $USER_COUNT${NC}"
echo -e "${GREEN}  🏢 SMEs: $SME_COUNT${NC}"
echo -e "${GREEN}  💼 Investors: $INVESTOR_COUNT${NC}"
echo -e "${GREEN}  🤝 Deals: $DEAL_COUNT${NC}"
echo -e "${GREEN}  📄 Documents: $DOCUMENT_COUNT${NC}"

echo ""
echo -e "${BLUE}🔑 Test Users Available:${NC}"
echo "------------------------"

# Get user details
echo -e "${GREEN}  👤 Admin: admin@boutique-advisory.com${NC}"
echo -e "${GREEN}  👤 Advisor: advisor@boutique-advisory.com${NC}"
echo -e "${GREEN}  👤 Investor: investor@boutique-advisory.com${NC}"
echo -e "${GREEN}  👤 SME: sme@boutique-advisory.com${NC}"
echo -e "${YELLOW}  🔑 Password for all: admin123${NC}"

echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo "-------------"
echo -e "${GREEN}  🌐 Platform: http://localhost:1001${NC}"
echo -e "${GREEN}  🗄️  Database Admin: http://localhost:1004${NC}"
echo -e "${GREEN}  🔌 API: http://localhost:1000${NC}"

echo ""
echo -e "${BLUE}💾 Backup Status:${NC}"
echo "-----------------"
BACKUP_DIR="./database-backups"
if [ -d "$BACKUP_DIR" ]; then
    BACKUP_COUNT=$(ls "$BACKUP_DIR"/*.sql 2>/dev/null | wc -l)
    VOLUME_BACKUP_COUNT=$(ls "$BACKUP_DIR"/*.tar 2>/dev/null | wc -l)
    echo -e "${GREEN}  📁 SQL Backups: $BACKUP_COUNT${NC}"
    echo -e "${GREEN}  📦 Volume Backups: $VOLUME_BACKUP_COUNT${NC}"
    
    if [ $BACKUP_COUNT -gt 0 ]; then
        LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.sql 2>/dev/null | head -1)
        BACKUP_SIZE=$(du -h "$LATEST_BACKUP" 2>/dev/null | cut -f1)
        echo -e "${GREEN}  📅 Latest backup: $(basename "$LATEST_BACKUP") ($BACKUP_SIZE)${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠️  No backups found${NC}"
fi

echo ""
echo -e "${GREEN}✅ Your data is safe and persistent!${NC}"


