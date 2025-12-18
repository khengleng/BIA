#!/bin/bash

# Boutique Advisory Platform Startup Script
# This script helps you set up and run the platform with existing DID, CM, and RWA infrastructure

set -e

echo "🚀 Starting Boutique Advisory Platform Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker status..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if required external services are running
check_external_services() {
    print_status "Checking external infrastructure services..."
    
    # Check DID API Gateway
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        print_success "DID API Gateway is running on port 8080"
    else
        print_warning "DID API Gateway is not accessible on port 8080"
    fi
    
    # Check CM Portal
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "CM Portal is running on port 3000"
    else
        print_warning "CM Portal is not accessible on port 3000"
    fi
    
    # Check RWA API
    if curl -s http://localhost:9000 > /dev/null 2>&1; then
        print_success "RWA API is running on port 9000"
    else
        print_warning "RWA API is not accessible on port 9000"
    fi
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        print_success "Created backend/.env from template"
    else
        print_warning "backend/.env already exists"
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:1000
NEXT_PUBLIC_DID_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_CM_PORTAL_URL=http://localhost:3000
NEXT_PUBLIC_RWA_API_URL=http://localhost:9000
EOF
        print_success "Created frontend/.env.local"
    else
        print_warning "frontend/.env.local already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend dependencies
    if [ -d "backend" ]; then
        cd backend
        npm install
        cd ..
        print_success "Backend dependencies installed"
    fi
    
    # Frontend dependencies
    if [ -d "frontend" ]; then
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd backend
    
    # Generate Prisma client
    npx prisma generate
    print_success "Prisma client generated"
    
    # Run database migrations
    npx prisma db push
    print_success "Database schema updated"
    
    cd ..
}

# Start services
start_services() {
    print_status "Starting Boutique Advisory Platform services..."
    
    # Start with Docker Compose
    docker-compose up -d boutique-advisory-postgres boutique-advisory-redis
    print_success "Database and Redis started"
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Start backend
    docker-compose up -d boutique-advisory-backend
    print_success "Backend service started"
    
    # Wait for backend to be ready
    print_status "Waiting for backend to be ready..."
    sleep 15
    
    # Start frontend
    docker-compose up -d boutique-advisory-frontend
    print_success "Frontend service started"
    
    # Start PgAdmin
    docker-compose up -d boutique-advisory-pgadmin
    print_success "PgAdmin started"
}

# Show status
show_status() {
    print_status "Checking service status..."
    
    echo ""
    echo "📊 Service Status:"
    echo "=================="
    
    # Check backend
    if curl -s http://localhost:1000/health > /dev/null 2>&1; then
        print_success "Backend API: http://localhost:1000"
    else
        print_error "Backend API: Not responding"
    fi
    
    # Check frontend
    if curl -s http://localhost:1001 > /dev/null 2>&1; then
        print_success "Frontend: http://localhost:1001"
    else
        print_error "Frontend: Not responding"
    fi
    
    # Check PgAdmin
    if curl -s http://localhost:1004 > /dev/null 2>&1; then
        print_success "PgAdmin: http://localhost:1004 (admin@boutique-advisory.com / admin123)"
    else
        print_error "PgAdmin: Not responding"
    fi
    
    echo ""
    echo "🔗 External Infrastructure:"
    echo "=========================="
    echo "DID API Gateway: http://localhost:8080"
    echo "CM Portal: http://localhost:3000"
    echo "RWA API: http://localhost:9000"
    echo "RWA Investor App: http://localhost:9002"
    echo "RWA Issuer Console: http://localhost:9001"
}

# Main execution
main() {
    echo "🎯 Boutique Advisory Platform Setup"
    echo "==================================="
    echo ""
    
    check_docker
    check_external_services
    setup_environment
    install_dependencies
    setup_database
    start_services
    show_status
    
    echo ""
    print_success "🎉 Boutique Advisory Platform is ready!"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Access the frontend at: http://localhost:1001"
    echo "2. Access the backend API at: http://localhost:1000"
    echo "3. Manage database at: http://localhost:1004"
    echo "4. Check the README.md for detailed documentation"
    echo ""
    echo "🔧 To stop services: docker-compose down"
    echo "🔧 To view logs: docker-compose logs -f"
}

# Run main function
main "$@"
