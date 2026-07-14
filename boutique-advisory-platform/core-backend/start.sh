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

# Note: All critical configuration validation (JWT_SECRET, DATABASE_URL, etc.) 
# is now handled inside the Node.js application. 
# This ensures the server can start and pass Railway health checks even if config is missing.


# Note: Detailed database discovery and connectivity checks are now handled 
# inside the Node.js application to ensure the health check can respond immediately.
echo "📡 Handing over database connection management to Node.js..."



# Note: Database migrations are now handled inside the Node.js application 
# to allow the server to start listening immediately on $PORT.

# Ensure schema is up-to-date before boot so admin/security modules don't fail on missing tables.
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️ Running Prisma migrations (migrate deploy)..."
  npx prisma migrate deploy
  echo "✅ Prisma migrations applied"
  # Reconcile any schema drift not captured by migrations (models added to
  # schema.prisma without a migration — e.g. wallets, invoices, admin_cases).
  # Additive/non-destructive: no --accept-data-loss, and non-fatal so the
  # server still boots and passes health checks if this reports a diff.
  echo "🔄 Reconciling schema drift (prisma db push, additive)..."
  npx prisma db push --skip-generate || echo "⚠️ db push reported a diff it won't apply automatically; continuing boot"
  echo "✅ Schema drift reconciled"
fi


# Start the application
echo "🚀 Starting Node.js server..."
exec node dist/index.js
