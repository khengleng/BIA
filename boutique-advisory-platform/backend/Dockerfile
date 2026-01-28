# ============================================
# PRODUCTION HARDENED DOCKERFILE
# Boutique Advisory Platform - Backend
# ============================================

# Build stage
FROM node:20-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# ============================================
# PRODUCTION STAGE - Minimal & Secure
# ============================================
FROM node:20-slim AS production

# Security: Install only essential packages
RUN apt-get update && apt-get install -y \
    openssl \
    libssl3 \
    ca-certificates \
    dumb-init \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && apt-get autoremove -y

# Security: Create non-root user
RUN groupadd --gid 1001 nodejs \
    && useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home appuser

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./

# Copy production dependencies only
COPY --from=builder /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Security: Set proper file permissions
RUN chown -R appuser:nodejs /app \
    && chmod -R 550 /app \
    && chmod -R 770 /app/dist

# Security: Create necessary directories with proper permissions
RUN mkdir -p /app/uploads /app/logs \
    && chown -R appuser:nodejs /app/uploads /app/logs \
    && chmod -R 770 /app/uploads /app/logs

# Security: Remove unnecessary files
RUN rm -rf /app/.git /app/.env* /app/*.md /app/src

# Security: Set environment to production
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=error

# Security: Disable npm update check
ENV NO_UPDATE_NOTIFIER=1
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Security: Node.js hardening flags
ENV NODE_OPTIONS="--max-old-space-size=512 --no-deprecation"

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
