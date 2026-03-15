# BIA Backend - Dockerfile
# Node.js + Express + Prisma API Server

FROM node:20-alpine AS base
RUN apk add --no-cache openssl wget netcat-openbsd

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY . .
RUN npm run build

# Runner stage - production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy built assets and necessary files
COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=expressjs:nodejs /app/package*.json ./
COPY --from=builder --chown=expressjs:nodejs /app/start.sh ./start.sh

# Make startup script executable
RUN chmod +x ./start.sh

USER expressjs

# Explicitly bypass node's docker-entrypoint.sh which can sometimes cause issues in Railway
ENTRYPOINT ["/bin/sh"]
CMD ["./start.sh"]
