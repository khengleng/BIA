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

# Enforce strong JWT secret in production
if [ "$NODE_ENV" = "production" ]; then
    JWT_LEN=${#JWT_SECRET}
    if [ "$JWT_LEN" -lt 32 ]; then
        echo "❌ FATAL: JWT_SECRET is too short ($JWT_LEN chars). Minimum is 32."
        exit 1
    fi

    JWT_SECRET_LOWER=$(printf '%s' "$JWT_SECRET" | tr '[:upper:]' '[:lower:]')
    for weak in secret password jwt token 123456 admin changeme qwerty; do
        case "$JWT_SECRET_LOWER" in
            *"$weak"*)
                echo "⚠️  WARNING: JWT_SECRET contains weak pattern: '$weak'"
                echo "   Rotate JWT_SECRET to a high-entropy random value as soon as possible."
                ;;
        esac
    done
fi

# Ensure SSL mode for external PostgreSQL in production.
if [ "$NODE_ENV" = "production" ]; then
    case "$DATABASE_URL" in
        *".railway.internal"*)
            # Railway private network connection; no sslmode mutation needed.
            ;;
        *"sslmode=require"*)
            ;;
        *)
            if printf '%s' "$DATABASE_URL" | grep -q '?'; then
                export DATABASE_URL="${DATABASE_URL}&sslmode=require"
            else
                export DATABASE_URL="${DATABASE_URL}?sslmode=require"
            fi
            echo "🔐 Appended sslmode=require to DATABASE_URL for production startup."
            ;;
    esac
fi

# Note: Database migrations are now handled inside the Node.js application 
# to allow the server to start listening immediately on $PORT.


# Start the application
echo "🚀 Starting Node.js server..."
exec node dist/index.js
