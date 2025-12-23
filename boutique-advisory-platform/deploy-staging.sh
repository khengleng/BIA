#!/bin/bash

# BIA Platform - Staging Deployment Script
# This script helps deploy the platform to the staging environment on Railway

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  BIA Platform - Staging Deployment Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

# Function to display usage
usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup       - Set up staging environment (first time)"
    echo "  deploy      - Deploy to staging"
    echo "  logs        - View staging logs"
    echo "  status      - Check deployment status"
    echo "  rollback    - Rollback to previous deployment"
    echo "  shell       - Open shell in staging service"
    echo "  help        - Show this help message"
    echo ""
}

# Setup staging environment
setup_staging() {
    echo -e "${YELLOW}Setting up staging environment...${NC}"
    
    # Check if logged in
    if ! railway whoami &> /dev/null; then
        echo -e "${YELLOW}Please login to Railway:${NC}"
        railway login
    fi
    
    # Link to project
    echo -e "${YELLOW}Linking to Railway project...${NC}"
    railway link
    
    # Try to create staging environment (may already exist)
    echo -e "${YELLOW}Creating staging environment...${NC}"
    railway environment create staging 2>/dev/null || echo -e "${GREEN}Staging environment already exists${NC}"
    
    # Switch to staging
    railway environment staging
    
    echo -e "${GREEN}✓ Staging environment setup complete!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Configure environment variables in Railway Dashboard"
    echo "2. Run: ./deploy-staging.sh deploy"
}

# Deploy to staging
deploy() {
    echo -e "${YELLOW}Deploying to staging environment...${NC}"
    
    # Switch to staging environment
    railway environment staging
    
    # Build check
    echo -e "${YELLOW}Running build check...${NC}"
    
    # Frontend build check
    echo -e "${BLUE}Checking frontend...${NC}"
    cd frontend
    npm run build --dry-run 2>/dev/null || npm run build || echo -e "${YELLOW}Frontend build check (local) - see Railway for actual build${NC}"
    cd ..
    
    # Backend build check
    echo -e "${BLUE}Checking backend...${NC}"
    cd backend
    npm run build || echo -e "${YELLOW}Backend build check (local) - see Railway for actual build${NC}"
    cd ..
    
    # Deploy
    echo -e "${YELLOW}Deploying to Railway...${NC}"
    railway up
    
    echo -e "${GREEN}✓ Deployment initiated!${NC}"
    echo ""
    echo "Check deployment status at: https://railway.app"
}

# View logs
view_logs() {
    echo -e "${YELLOW}Fetching staging logs...${NC}"
    railway environment staging
    
    echo -e "${BLUE}Select service:${NC}"
    echo "1. Frontend"
    echo "2. Backend"
    read -p "Enter choice (1 or 2): " choice
    
    case $choice in
        1)
            railway logs --service frontend
            ;;
        2)
            railway logs --service backend
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            ;;
    esac
}

# Check status
check_status() {
    echo -e "${YELLOW}Checking staging deployment status...${NC}"
    railway environment staging
    railway status
}

# Rollback
rollback() {
    echo -e "${YELLOW}Rolling back staging deployment...${NC}"
    railway environment staging
    railway rollback
    echo -e "${GREEN}✓ Rollback initiated${NC}"
}

# Open shell
open_shell() {
    echo -e "${YELLOW}Opening shell in staging...${NC}"
    railway environment staging
    railway shell
}

# Main command handler
case "$1" in
    setup)
        setup_staging
        ;;
    deploy)
        deploy
        ;;
    logs)
        view_logs
        ;;
    status)
        check_status
        ;;
    rollback)
        rollback
        ;;
    shell)
        open_shell
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        if [ -z "$1" ]; then
            usage
        else
            echo -e "${RED}Unknown command: $1${NC}"
            usage
            exit 1
        fi
        ;;
esac
