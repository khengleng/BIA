#!/bin/bash

# Local Deployment Script for BIA Platform

echo "🚀 Starting Local Deployment..."

# 1. Ensure Database is Running
echo "🗄️ Checking Database..."
# Try brew check first
if brew services list | grep -q "postgresql@15.*started"; then
    echo "✅ Postgres service is running."
else
    echo "⚠️ Postgres not started via brew. Attempting to start..."
    brew services start postgresql@15 || {
        echo "Trying manual start with pg_ctl..."
        /opt/homebrew/opt/postgresql@15/bin/pg_ctl -D /opt/homebrew/var/postgresql@15 start
    }
fi

# Give it a moment to initialize
sleep 3

# 2. Run Database Migrations
echo "🔄 Applying Database Migrations..."
cd backend
if npx prisma migrate dev --name add_deal_refinement; then
    echo "✅ Database schema updated."
else
    echo "❌ Migration failed. Please check if Postgres is running correctly."
    exit 1
fi
cd ..

# 3. Start Application Services
echo "🌍 Starting Services..."

# Kills existing node processes on ports 3001/3003 (optional, prevents 'port in use' errors)
# lsof -ti:3001 | xargs kill -9 2>/dev/null
# lsof -ti:3003 | xargs kill -9 2>/dev/null

# Start Backend
cd backend
echo "Starting Backend (Port 3001)..."
npm run dev &
BACKEND_PID=$!
cd ..

# Start Frontend
cd frontend
echo "Starting Frontend (Port 3000)..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Deployment Successful!"
echo "   - Backend: http://localhost:3001"
echo "   - Frontend: http://localhost:3000"
echo "   (Press Ctrl+C to stop both servers)"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
