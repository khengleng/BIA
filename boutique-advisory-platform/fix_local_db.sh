#!/bin/bash

echo "🛠️  Attempting to fix local database and migrations..."

# 1. Stop any existing postgres nicely
echo "🛑 Stopping conflicting services..."
brew services stop postgresql@15
pkill -9 postgres

# 2. Start Postgres using brew services (requires user permission if not running)
echo "🚀 Starting Postgres..."
brew services start postgresql@15 || {
    echo "⚠️  Brew start failed, trying manual start..."
    /opt/homebrew/opt/postgresql@15/bin/pg_ctl -D /opt/homebrew/var/postgresql@15 start
}

echo "⏳ Waiting for DB to initialize..."
sleep 5

# 3. Check if running
if ! lsof -i :5432 > /dev/null; then
    echo "❌ Postgres failed to start on port 5432."
    echo "   Please try running: 'brew services restart postgresql@15' manually."
    exit 1
fi

echo "✅ Database is up!"

# 4. Run Migration
echo "🔄 Running outstanding migrations..."
cd backend
npx prisma migrate dev --name sync_schema_updates

echo "✨ All done! Local environment should be fixed."
