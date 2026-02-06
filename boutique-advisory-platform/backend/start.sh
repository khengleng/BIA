#!/bin/sh
set -e

echo "🚀 BIA Backend Startup Script"
echo "================================"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-3000}"
echo "DATABASE_URL exists: $(if [ -n "$DATABASE_URL" ]; then echo 'YES'; else echo 'NO - CRITICAL!'; fi)"
echo "JWT_SECRET exists: $(if [ -n "$JWT_SECRET" ]; then echo 'YES'; else echo 'NO - CRITICAL!'; fi)"
echo "INITIAL_ADMIN_PASSWORD exists: $(if [ -n "$INITIAL_ADMIN_PASSWORD" ]; then echo 'YES'; else echo 'NO'; fi)"
echo "================================"

# Check critical environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ FATAL: DATABASE_URL is not set!"
    echo "   Please add DATABASE_URL to your Railway service variables."
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ FATAL: JWT_SECRET is not set!"
    echo "   Please add JWT_SECRET to your Railway service variables."
    exit 1
fi

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo "❌ Migration failed! Trying prisma db push instead..."
    npx prisma db push --accept-data-loss
fi

echo "✅ Database ready"

# Start the application
echo "🚀 Starting Node.js server..."
exec node dist/index.js
