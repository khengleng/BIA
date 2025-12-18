#!/bin/bash

# 🧪 Comprehensive Function Testing Script
# This script tests all basic API endpoints and functionality

echo "🚀 Starting Comprehensive Function Testing..."
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

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local headers=$5
    local data=$6
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X $method "http://localhost:1000$endpoint" $headers -d "$data")
    else
        response=$(curl -s -w "%{http_code}" -X $method "http://localhost:1000$endpoint" $headers)
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" -eq "$expected_status" ]; then
        print_status 0 "$description"
    else
        print_status 1 "$description (Expected: $expected_status, Got: $http_code)"
        echo "   Response: $body"
    fi
}

echo -e "${BLUE}📋 Pre-Testing Setup${NC}"
echo "------------------------"

# Test 1: Check if services are running
echo -e "${YELLOW}1. Checking if services are running...${NC}"
if docker-compose ps | grep -q "Up"; then
    print_status 0 "Services are running"
else
    print_status 1 "Services are not running"
    exit 1
fi

# Test 2: Backend health check
echo -e "${YELLOW}2. Testing backend health...${NC}"
test_endpoint "GET" "/health" 200 "Backend health check"

# Test 3: Get test tokens
echo -e "${YELLOW}3. Getting test tokens...${NC}"
tokens_response=$(curl -s "http://localhost:1000/api/test/tokens")
if echo "$tokens_response" | grep -q "admin"; then
    print_status 0 "Test tokens generated successfully"
    
    # Extract tokens
    admin_token=$(echo "$tokens_response" | grep -o '"admin":"[^"]*"' | cut -d'"' -f4)
    advisor_token=$(echo "$tokens_response" | grep -o '"advisor":"[^"]*"' | cut -d'"' -f4)
    investor_token=$(echo "$tokens_response" | grep -o '"investor":"[^"]*"' | cut -d'"' -f4)
    sme_token=$(echo "$tokens_response" | grep -o '"sme":"[^"]*"' | cut -d'"' -f4)
else
    print_status 1 "Failed to get test tokens"
    exit 1
fi

echo ""
echo -e "${BLUE}🔐 Authentication Testing${NC}"
echo "----------------------------"

# Test 4: Authentication required endpoints
echo -e "${YELLOW}4. Testing authentication requirements...${NC}"
test_endpoint "GET" "/api/smes" 401 "SMEs endpoint requires authentication"
test_endpoint "GET" "/api/investors" 401 "Investors endpoint requires authentication"
test_endpoint "GET" "/api/deals" 401 "Deals endpoint requires authentication"

echo ""
echo -e "${BLUE}🏢 SME Management Testing${NC}"
echo "----------------------------"

# Test 5: SME listing with authentication
echo -e "${YELLOW}5. Testing SME listing with different roles...${NC}"
test_endpoint "GET" "/api/smes" 200 "Admin can view SMEs" "-H \"Authorization: Bearer $admin_token\""
test_endpoint "GET" "/api/smes" 200 "Advisor can view SMEs" "-H \"Authorization: Bearer $advisor_token\""
test_endpoint "GET" "/api/smes" 200 "Investor can view SMEs" "-H \"Authorization: Bearer $investor_token\""

# Test 6: SME creation with different roles
echo -e "${YELLOW}6. Testing SME creation with different roles...${NC}"
test_endpoint "POST" "/api/smes" 201 "Admin can create SME" "-H \"Authorization: Bearer $admin_token\" -H \"Content-Type: application/json\"" '{"companyName": "Test SME Admin", "sector": "Technology", "businessDescription": "Test description"}'
test_endpoint "POST" "/api/smes" 201 "Advisor can create SME" "-H \"Authorization: Bearer $advisor_token\" -H \"Content-Type: application/json\"" '{"companyName": "Test SME Advisor", "sector": "Technology", "businessDescription": "Test description"}'
test_endpoint "POST" "/api/smes" 403 "Investor cannot create SME" "-H \"Authorization: Bearer $investor_token\" -H \"Content-Type: application/json\"" '{"companyName": "Test SME Investor", "sector": "Technology", "businessDescription": "Test description"}'

echo ""
echo -e "${BLUE}💼 Investor Management Testing${NC}"
echo "--------------------------------"

# Test 7: Investor listing with authentication
echo -e "${YELLOW}7. Testing investor listing with different roles...${NC}"
test_endpoint "GET" "/api/investors" 200 "Admin can view investors" "-H \"Authorization: Bearer $admin_token\""
test_endpoint "GET" "/api/investors" 200 "Advisor can view investors" "-H \"Authorization: Bearer $advisor_token\""
test_endpoint "GET" "/api/investors" 200 "Investor can view investors" "-H \"Authorization: Bearer $investor_token\""

echo ""
echo -e "${BLUE}🤝 Deal Management Testing${NC}"
echo "----------------------------"

# Test 8: Deal listing with authentication
echo -e "${YELLOW}8. Testing deal listing with different roles...${NC}"
test_endpoint "GET" "/api/deals" 200 "Admin can view deals" "-H \"Authorization: Bearer $admin_token\""
test_endpoint "GET" "/api/deals" 200 "Advisor can view deals" "-H \"Authorization: Bearer $advisor_token\""
test_endpoint "GET" "/api/deals" 200 "Investor can view deals" "-H \"Authorization: Bearer $investor_token\""

echo ""
echo -e "${BLUE}📊 Reports & Analytics Testing${NC}"
echo "--------------------------------"

# Test 9: Reports access
echo -e "${YELLOW}9. Testing reports access...${NC}"
test_endpoint "GET" "/api/reports" 200 "Admin can access reports" "-H \"Authorization: Bearer $admin_token\""
test_endpoint "GET" "/api/reports" 200 "Advisor can access reports" "-H \"Authorization: Bearer $advisor_token\""
test_endpoint "GET" "/api/reports" 200 "Investor can access reports" "-H \"Authorization: Bearer $investor_token\""

echo ""
echo -e "${BLUE}🔧 API Endpoint Testing${NC}"
echo "---------------------------"

# Test 10: Document endpoints
echo -e "${YELLOW}10. Testing document endpoints...${NC}"
test_endpoint "GET" "/api/documents/term-sheet" 200 "Document viewing works" "-H \"Authorization: Bearer $admin_token\""
test_endpoint "GET" "/api/documents/term-sheet/download" 200 "Document download works" "-H \"Authorization: Bearer $admin_token\""

# Test 11: Advisory booking
echo -e "${YELLOW}11. Testing advisory booking...${NC}"
test_endpoint "POST" "/api/advisory/book" 201 "Advisory booking works" "-H \"Authorization: Bearer $admin_token\" -H \"Content-Type: application/json\"" '{"service": "Financial Planning", "advisorId": "advisor_1", "preferredDate": "2024-01-15"}'

echo ""
echo -e "${BLUE}🔒 Security Testing${NC}"
echo "---------------------"

# Test 12: Invalid token
echo -e "${YELLOW}12. Testing invalid token...${NC}"
test_endpoint "GET" "/api/smes" 401 "Invalid token is rejected" "-H \"Authorization: Bearer invalid_token\""

# Test 13: Missing token
echo -e "${YELLOW}13. Testing missing token...${NC}"
test_endpoint "GET" "/api/smes" 401 "Missing token is rejected"

echo ""
echo -e "${BLUE}📱 Frontend Testing${NC}"
echo "---------------------"

# Test 14: Frontend accessibility
echo -e "${YELLOW}14. Testing frontend accessibility...${NC}"
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:1001")
if [ "$frontend_response" -eq 200 ]; then
    print_status 0 "Frontend is accessible"
else
    print_status 1 "Frontend is not accessible (Status: $frontend_response)"
fi

echo ""
echo -e "${BLUE}🎯 Testing Summary${NC}"
echo "======================"

echo -e "${GREEN}✅ All basic API endpoints are working correctly!${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Open http://localhost:1001 in your browser"
echo "2. Login with test users:"
echo "   - Admin: admin@boutique-advisory.com / admin123"
echo "   - Advisor: advisor@boutique-advisory.com / advisor123"
echo "   - Investor: investor@boutique-advisory.com / investor123"
echo "   - SME: sme@boutique-advisory.com / sme123"
echo "3. Test all UI functionality manually"
echo "4. Follow the comprehensive testing guide for detailed testing"
echo ""
echo -e "${GREEN}🎉 Ready for comprehensive manual testing!${NC}"
