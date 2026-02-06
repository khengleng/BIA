#!/bin/bash

# Quick Email Test Script
# Tests email notifications functionality

echo "📧 Testing Email Notifications..."
echo ""

# Configuration
API_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if RESEND_API_KEY is configured
if grep -q "RESEND_API_KEY=re_\.\.\." backend/.env; then
    echo -e "${YELLOW}⚠️  Resend API key not configured${NC}"
    echo ""
    echo "To test email notifications:"
    echo "1. Get API key from https://resend.com/"
    echo "2. Update backend/.env with your RESEND_API_KEY"
    echo "3. Run this script again"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Resend API key configured${NC}"
echo ""

# Prompt for test email
read -p "Enter your email address for testing: " TEST_EMAIL

if [ -z "$TEST_EMAIL" ]; then
    echo -e "${RED}❌ Email address required${NC}"
    exit 1
fi

echo ""
echo "📝 Test 1: Welcome Email (via registration)"
echo "Registering test user..."

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPass123!\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"role\": \"INVESTOR\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q '"token"'; then
    echo -e "${GREEN}✅ Registration successful!${NC}"
    echo -e "${GREEN}📧 Welcome email should be sent to: $TEST_EMAIL${NC}"
    echo ""
    echo "Check your inbox (and spam folder) for the welcome email!"
else
    if echo "$REGISTER_RESPONSE" | grep -q "already exists"; then
        echo -e "${YELLOW}⚠️  User already exists, trying password reset instead...${NC}"
        echo ""
        echo "📝 Test 2: Password Reset Email"
        
        RESET_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/forgot-password" \
          -H "Content-Type: application/json" \
          -d "{\"email\": \"$TEST_EMAIL\"}")
        
        if echo "$RESET_RESPONSE" | grep -q "success"; then
            echo -e "${GREEN}✅ Password reset email sent!${NC}"
            echo -e "${GREEN}📧 Check your inbox: $TEST_EMAIL${NC}"
        else
            echo -e "${RED}❌ Password reset failed${NC}"
            echo "Response: $RESET_RESPONSE"
        fi
    else
        echo -e "${RED}❌ Registration failed${NC}"
        echo "Response: $REGISTER_RESPONSE"
    fi
fi

echo ""
echo "========================================="
echo "📊 Email Test Summary"
echo "========================================="
echo "✅ Email service: Configured"
echo "✅ Sender: contact@cambobia.com"
echo "✅ Test email: $TEST_EMAIL"
echo ""
echo "Next steps:"
echo "1. Check your email inbox"
echo "2. Check spam folder if not in inbox"
echo "3. View delivery status at https://resend.com/emails"
echo ""
