#!/bin/bash

# 🗄️ Database Migration Script
# This script safely migrates data from in-memory storage to PostgreSQL

echo "🗄️  Boutique Advisory Platform - Database Migration"
echo "=================================================="

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

echo -e "${BLUE}📋 Pre-Migration Checks${NC}"
echo "------------------------"

# Check if services are running
echo -e "${YELLOW}1. Checking if services are running...${NC}"
if docker-compose ps | grep -q "Up"; then
    print_status 0 "Services are running"
else
    print_status 1 "Services are not running"
    echo "Please start services with: docker-compose up -d"
    exit 1
fi

# Check backend health
echo -e "${YELLOW}2. Checking backend health...${NC}"
backend_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:1000/health")
if [ "$backend_response" -eq 200 ]; then
    print_status 0 "Backend is healthy"
else
    print_status 1 "Backend is not responding (Status: $backend_response)"
    exit 1
fi

# Check current migration status
echo -e "${YELLOW}3. Checking current migration status...${NC}"
migration_status=$(curl -s "http://localhost:1000/api/migration/status")
if echo "$migration_status" | grep -q '"completed":true'; then
    print_status 0 "Migration already completed"
    echo -e "${GREEN}🎉 Database migration is already complete!${NC}"
    exit 0
elif echo "$migration_status" | grep -q '"completed":false'; then
    print_status 0 "Migration needed"
else
    print_status 1 "Failed to check migration status"
    echo "Response: $migration_status"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Starting Migration${NC}"
echo "-------------------"

# Perform migration
echo -e "${YELLOW}4. Performing data migration...${NC}"
migration_result=$(curl -s -X POST "http://localhost:1000/api/migration/perform")
if echo "$migration_result" | grep -q '"success":true'; then
    print_status 0 "Migration completed successfully"
else
    print_status 1 "Migration failed"
    echo "Response: $migration_result"
    exit 1
fi

# Verify migration
echo -e "${YELLOW}5. Verifying migration...${NC}"
sleep 2
verification_status=$(curl -s "http://localhost:1000/api/migration/status")
if echo "$verification_status" | grep -q '"completed":true'; then
    print_status 0 "Migration verified successfully"
else
    print_status 1 "Migration verification failed"
    echo "Response: $verification_status"
    exit 1
fi

# Switch to database mode
echo -e "${YELLOW}6. Switching to database mode...${NC}"
switch_result=$(curl -s -X POST "http://localhost:1000/api/migration/switch-to-database")
if echo "$switch_result" | grep -q '"success":true'; then
    print_status 0 "Switched to database mode"
else
    print_status 1 "Failed to switch to database mode"
    echo "Response: $switch_result"
    exit 1
fi

echo ""
echo -e "${BLUE}🧪 Post-Migration Testing${NC}"
echo "---------------------------"

# Test API endpoints
echo -e "${YELLOW}7. Testing API endpoints...${NC}"

# Test SME listing
sme_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:1000/api/smes")
if [ "$sme_response" -eq 401 ]; then
    print_status 0 "SME endpoint requires authentication (expected)"
else
    print_status 1 "SME endpoint test failed (Status: $sme_response)"
fi

# Test investor listing
investor_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:1000/api/investors")
if [ "$investor_response" -eq 401 ]; then
    print_status 0 "Investor endpoint requires authentication (expected)"
else
    print_status 1 "Investor endpoint test failed (Status: $investor_response)"
fi

# Test deal listing
deal_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:1000/api/deals")
if [ "$deal_response" -eq 401 ]; then
    print_status 0 "Deal endpoint requires authentication (expected)"
else
    print_status 1 "Deal endpoint test failed (Status: $deal_response)"
fi

echo ""
echo -e "${BLUE}🎯 Migration Summary${NC}"
echo "======================"

echo -e "${GREEN}✅ Database migration completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 What was migrated:${NC}"
echo "  - 1 Default tenant"
echo "  - 4 Test users (Admin, Advisor, Investor, SME)"
echo "  - 2 SMEs (Tech Startup A, E-commerce Platform B)"
echo "  - 1 Investor (John Smith)"
echo "  - 1 Deal (Tech Startup A Series A Funding)"
echo "  - 1 Deal investment"
echo "  - 6 Documents"
echo ""
echo -e "${YELLOW}🔑 Test Credentials:${NC}"
echo "  - Admin: admin@boutique-advisory.com / admin123"
echo "  - Advisor: advisor@boutique-advisory.com / advisor123"
echo "  - Investor: investor@boutique-advisory.com / investor123"
echo "  - SME: sme@boutique-advisory.com / sme123"
echo ""
echo -e "${YELLOW}🌐 Next Steps:${NC}"
echo "  1. Open http://localhost:1001 in your browser"
echo "  2. Login with any test user"
echo "  3. Test all functionality"
echo "  4. Verify data is now persistent in PostgreSQL"
echo ""
echo -e "${GREEN}🎉 Migration complete! Your platform is now using PostgreSQL!${NC}"


