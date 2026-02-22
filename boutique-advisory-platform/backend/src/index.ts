import dotenv from 'dotenv';
// Load environment variables IMMEDIATELY
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import rateLimit from 'express-rate-limit';

import RedisStore from 'rate-limit-redis';
import redis from './redis';
import cookieParser from 'cookie-parser';
import { CookieOptions } from 'express';
import { createServer } from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import { initSocket } from './socket';
import { prisma, connectDatabase } from './database';

import { doubleCsrf } from 'csrf-csrf';
import {
  checkMigrationStatus,
  performMigration,
  getMigrationStatus,
  switchToDatabase,
  fallbackToInMemory,
  shouldUseDatabase
} from './migration-manager';

// New Feature Routes
import syndicateRoutes from './routes/syndicates';
import syndicateTokenRoutes from './routes/syndicate-tokens';
import dueDiligenceRoutes from './routes/duediligence';
import dealDueDiligenceRoutes from './routes/deal-due-diligence';
import communityRoutes from './routes/community';
import secondaryTradingRoutes from './routes/secondary-trading';
import notificationRoutes from './routes/notifications';
import dashboardRoutes from './routes/dashboard';
import auditRoutes from './routes/audit';
import adminRoutes from './routes/admin';
import adminActionCenterRoutes from './routes/admin-action-center';
import aiRoutes from './routes/ai';
import disputeRoutes from './routes/disputes';
import escrowRoutes from './routes/escrow';
import agreementRoutes from './routes/agreements';
import operationsRoutes from './routes/operations';
import adminCasesRoutes from './routes/admin-cases';
import adminOnboardingRoutes from './routes/admin-onboarding';
import adminRoleLifecycleRoutes from './routes/admin-role-lifecycle';
import adminDealOpsRoutes from './routes/admin-deal-ops';
import adminAdvisorOpsRoutes from './routes/admin-advisor-ops';
import adminInvestorOpsRoutes from './routes/admin-investor-ops';
import adminDataGovernanceRoutes from './routes/admin-data-governance';
import adminReconciliationRoutes from './routes/admin-reconciliation';

// Core Feature Routes
import authRoutes from './routes/auth';
import smeRoutes from './routes/sme';
import investorRoutes from './routes/investor';
import dealRoutes from './routes/deal';
import documentRoutes from './routes/document';
import pipelineRoutes from './routes/pipeline';
import matchesRoutes from './routes/matches';
import messagesRoutes from './routes/messages';
import calendarRoutes from './routes/calendar';
import reportRoutes from './routes/reports';
import dataroomRoutes from './routes/dataroom';
import advisoryRoutes from './routes/advisory';
import analyticsRoutes from './routes/analytics';
import paymentRoutes from './routes/payments';
import webhookRoutes from './routes/webhooks';

// Security Validation
import { validateSecurityConfiguration } from './utils/securityValidator';

// Middleware
import { authenticateToken, authorizeRoles } from './middleware/jwt-auth';
import {
  requestIdMiddleware,
  securityHeadersMiddleware,
  ipSecurityMiddleware,
  sqlInjectionMiddleware,
  xssMiddleware,
  roleBasedRateLimiting
} from './middleware/securityMiddleware';


// Helper to ensure admin account is synced with .env
async function ensureAdminAccount() {
  const adminEmail = 'admin@boutique-advisory.com';
  let adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (!adminPassword) {
    // SECURITY: Never use hardcoded fallback passwords in production
    const crypto = require('crypto');
    adminPassword = crypto.randomBytes(16).toString('hex') + 'A!1';
    console.warn('CRITICAL SECURITY: INITIAL_ADMIN_PASSWORD not set. A secure random password has been generated.');
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV ONLY] Initial Admin Password: ${adminPassword}`);
    }
  }

  try {
    const user = await prisma.user.findFirst({ where: { email: adminEmail, tenantId: 'default' } });

    if (user) {
      // SECURITY: Don't automatically rewrite password/role on every boot in production
      // Only ensure account is ACTIVE. Admin password changes should happen via UI/Recovery.
      if (user.status !== 'ACTIVE') {
        await prisma.user.update({
          where: { id: user.id },
          data: { status: 'ACTIVE' }
        });
        console.log(`✅ Admin account status restored to ACTIVE`);
      } else {
        console.log(`✅ Admin account verified (active)`);
      }
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'SUPER_ADMIN', // Ensure initial admin is SUPER_ADMIN
          firstName: 'System',
          lastName: 'Administrator',
          tenantId: 'default',
          status: 'ACTIVE'
        }
      });
      console.log(`✅ Initial SUPER_ADMIN account created successfully`);
    }
  } catch (error: any) {
    console.error('❌ FATAL: Could not initialize admin account:', error.message);
  }
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
      rawBody?: Buffer;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy (required for rate limiting and secure cookies on most cloud platforms)
app.set('trust proxy', 1);

// Disable X-Powered-By
app.disable('x-powered-by');

// Security Headers with Helmet (stricter in production)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginEmbedderPolicy: { policy: "credentialless" },
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"], // SECURITY: Removed 'unsafe-inline' for better posture
      imgSrc: ["'self'", "data:", "blob:", "https://storage.googleapis.com", "https://*.stripe.com", "https://*.sumsub.com"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "https://www.cambobia.com", "https://storage.googleapis.com", "https://*.stripe.com", "https://*.sumsub.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: [],
    }
  } : false,
  hsts: isProduction ? {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true
  } : false,
}));

let isStartingUp = true;

app.get('/health', async (req, res) => {
  try {
    if (isStartingUp) {
      return res.status(200).json({
        status: 'starting',
        timestamp: new Date(),
        message: 'Server is booting up and running migrations'
      });
    }

    // 1. Check Database
    await prisma.$queryRaw`SELECT 1`;

    // 2. Check Redis
    let redisStatus = 'connected';
    try {
      if (redis.status !== 'ready') {
        redisStatus = redis.status;
      }
    } catch (e) {
      redisStatus = 'error';
    }

    return res.json({
      status: 'ok',
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      redis: redisStatus
    });
  } catch (error) {
    return res.status(503).json({
      status: 'degraded',
      timestamp: new Date(),
      error: 'Core dependency failure',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Logging - reduced in production
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Request body limits to prevent DoS
app.use(express.json({
  limit: '10mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const cookieSecret = process.env.COOKIE_SECRET;
if (isProduction && !cookieSecret) {
  console.error('❌ FATAL ERROR: COOKIE_SECRET environment variable is missing!');
  console.error('👉 Please add a long random string to your Railway environment variables:');
  console.error('   Key: COOKIE_SECRET');
  process.exit(1);
}

app.use(cookieParser(cookieSecret || 'dev-cookie-secret'));

// CORS configuration - strict in production
app.use((req, res, next) => {
  cors({
    origin: (origin, callback) => {
      // In production, strictly match the FRONTEND_URL
      const frontendUrl = process.env.FRONTEND_URL || '';
      const allowedOrigins = [frontendUrl, frontendUrl.replace(/\/$/, '')];

      if (!origin) {
        // Requests without an Origin header can be legitimate (same-origin navigations,
        // server-to-server calls, health checks). CORS only needs to gate explicit cross-origin.
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (!isProduction && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
        // In development, allow localhost/127.0.0.1 with exact match to prevent attacker.com spoofing
        callback(null, true);
      } else {
        console.warn(`Blocked by CORS: origin ${origin} not in ${allowedOrigins}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token', 'x-csrf-token'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400,
  })(req, res, next);
});

// ============================================
// SECURITY MIDDLEWARE (Applied to all requests)
// ============================================

// Add unique request ID for tracing
app.use(requestIdMiddleware);

// Additional security headers
app.use(securityHeadersMiddleware);

// IP security (block malicious IPs)
app.use(ipSecurityMiddleware);

// SQL injection prevention
app.use(sqlInjectionMiddleware);

// XSS prevention
app.use(xssMiddleware);

// ============================================
// ROUTES
// ============================================


// Rate limiting - shared via Redis for multi-instance support
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 1000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => req.path === '/health' || req.path === '/csrf-token' || req.path.startsWith('/health'),

  store: new RedisStore({
    sendCommand: async (...args: string[]) => {
      try {
        return await (redis as any).call(args[0], ...args.slice(1));
      } catch (err) {
        console.warn('⚠️ Redis rate limit failure (limiter):', err);
        return 0; // Fail-open (allowed)
      }
    },
    prefix: 'bia:rl:main:',
  } as any),

});
app.use('/api/', limiter);

// Stricter rate limiting for authentication endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
  skipSuccessfulRequests: true,
  // Prevent one user's failed attempts from locking out all users on the same IP.
  keyGenerator: (req) => {
    const ip = req.ip || 'unknown-ip';
    if (req.path === '/login' && req.method === 'POST') {
      const email = typeof (req as any).body?.email === 'string'
        ? (req as any).body.email.trim().toLowerCase()
        : 'unknown-email';
      return `auth:login:${ip}:${email}`;
    }
    return `auth:${ip}`;
  },
  // CSRF token endpoint should stay available even during auth throttling.
  skip: (req) => req.path === '/csrf-token' || req.path === '/api/csrf-token',
  store: new RedisStore({
    sendCommand: async (...args: string[]) => {
      try {
        return await (redis as any).call(args[0], ...args.slice(1));
      } catch (err) {
        console.warn('⚠️ Redis rate limit failure (authLimiter):', err);
        return 0; // Fail-open (allowed)
      }
    },
    prefix: 'bia:rl:auth:',
  } as any),

});

const csrfSecret = process.env.CSRF_SECRET;
if (isProduction && !csrfSecret) {
  console.error('❌ FATAL ERROR: CSRF_SECRET environment variable is missing!');
  console.error('👉 Please add a long random string to your Railway environment variables:');
  console.error('   Key: CSRF_SECRET');
  console.error('   Value: (e.g., openssl rand -base64 32)');
  process.exit(1);
}


// CSRF Protection Setup
const { invalidCsrfTokenError, generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => csrfSecret || 'dev-csrf-secret',
  getSessionIdentifier: (req: express.Request) => {
    // Use user-agent only to avoid instability from proxy/load balancer IP changes
    return String(req.headers['user-agent'] || 'unknown');
  },
  // Simply naming for diagnostics
  cookieName: (process.env.NODE_ENV === 'production' && !process.env.DISABLE_STRICT_CSRF)
    ? 'psifi.x-csrf-token'
    : 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  },

  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req: express.Request) => req.headers['x-csrf-token'] as string
} as any) as any;


// CSRF Token Endpoint
app.get('/api/csrf-token', (req: express.Request, res: express.Response) => {
  try {
    if (isStartingUp) {
      return res.status(503).json({
        error: 'Service starting up',
        message: 'The server is currently performing background migrations. Please try again in a few seconds.'
      });
    }
    const csrfToken = generateCsrfToken(req, res);
    return res.json({ csrfToken });
  } catch (error: any) {
    console.error('❌ CSRF Token Generation Error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate CSRF token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Apply CSRF protection to API routes (excluding webhooks and token endpoint)
app.use('/api', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path === '/csrf-token' || req.path.startsWith('/webhooks')) {
    return next();
  }
  doubleCsrfProtection(req, res, next);
});

// Health check moved to the top of middleware stack


// Authentication endpoints (public but rate limited)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/webhooks', webhookRoutes);

// Core endpoints - NOW PROTECTED (Fix #1)
app.use('/api/smes', authenticateToken, smeRoutes);
app.use('/api/investors', authenticateToken, investorRoutes);
app.use('/api/deals', authenticateToken, dealRoutes);
app.use('/api/documents', authenticateToken, documentRoutes);

// Feature endpoints (already protected)
app.use('/api/syndicates', authenticateToken, syndicateRoutes);
app.use('/api/syndicate-tokens', authenticateToken, syndicateTokenRoutes);
app.use('/api/due-diligence', authenticateToken, dueDiligenceRoutes);
app.use('/api/duediligence', authenticateToken, dueDiligenceRoutes);
app.use('/api/deal-due-diligence', authenticateToken, dealDueDiligenceRoutes);
app.use('/api/community', authenticateToken, communityRoutes);
app.use('/api/secondary-trading', authenticateToken, secondaryTradingRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/push', authenticateToken, notificationRoutes); // Alias for push subscription endpoints
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/pipeline', authenticateToken, pipelineRoutes);
app.use('/api/matches', authenticateToken, matchesRoutes);
app.use('/api/messages', authenticateToken, messagesRoutes);
app.use('/api/calendar', authenticateToken, calendarRoutes);
app.use('/api/report', authenticateToken, reportRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/dataroom', authenticateToken, dataroomRoutes);
app.use('/api/audit', authenticateToken, auditRoutes);
app.use('/api/advisory', authenticateToken, advisoryRoutes);
app.use('/api/advisory-services', authenticateToken, advisoryRoutes);
app.use('/api/advisors', authenticateToken, advisoryRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/disputes', authenticateToken, disputeRoutes);
app.use('/api/escrow', authenticateToken, escrowRoutes);
app.use('/api/agreements', authenticateToken, agreementRoutes);
app.use('/api/admin/action-center', authenticateToken, adminActionCenterRoutes);
app.use('/api/operations', authenticateToken, operationsRoutes);
app.use('/api/admin/cases', authenticateToken, adminCasesRoutes);
app.use('/api/admin/onboarding', authenticateToken, adminOnboardingRoutes);
app.use('/api/admin/role-lifecycle', authenticateToken, adminRoleLifecycleRoutes);
app.use('/api/admin/deal-ops', authenticateToken, adminDealOpsRoutes);
app.use('/api/admin/advisor-ops', authenticateToken, adminAdvisorOpsRoutes);
app.use('/api/admin/investor-ops', authenticateToken, adminInvestorOpsRoutes);
app.use('/api/admin/data-governance', authenticateToken, adminDataGovernanceRoutes);
app.use('/api/admin/reconciliation', authenticateToken, adminReconciliationRoutes);

// Migration endpoints - PROTECTED: Only available in development or with SUPER_ADMIN role (Fix #2)
const migrationAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Allow in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // In production, require SUPER_ADMIN authentication
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Migration endpoints require authentication in production' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    if (decoded?.isPreAuth) {
      return res.status(401).json({ error: 'Two-factor authentication required' });
    }

    if (decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Migration endpoints require SUPER_ADMIN role' });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token for migration access' });
  }
};

app.get('/api/migration/status', migrationAuthMiddleware, async (req, res) => {
  const status = await getMigrationStatus();
  res.json(status);
});

app.post('/api/migration/perform', migrationAuthMiddleware, async (req, res) => {
  const result = await performMigration();
  if (result.completed) {
    res.json({ message: 'Migration completed successfully', result });
  } else {
    res.status(500).json({ error: 'Migration failed', details: result.error });
  }
});

app.post('/api/migration/switch-to-database', migrationAuthMiddleware, (req, res) => {
  switchToDatabase();
  res.json({ message: 'Switched to database mode' });
});

app.post('/api/migration/fallback-to-memory', migrationAuthMiddleware, (req, res) => {
  fallbackToInMemory();
  res.json({ message: 'Switched to in-memory mode' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err?.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'CSRF validation failed'
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server with migration handling
async function startServer() {
  const httpServer = createServer(app);
  initSocket(httpServer);

  // Start listening immediately to pass health checks during startup
  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Boutique Advisory Platform API starting on port ${PORT}`);
    console.log(`📡 Real-time WebSockets initialized`);
  });

  // Helper function for retrying database connection
  async function waitForDatabase(maxRetries = 10, initialDelay = 2000) {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connection established');
        return true;
      } catch (error: any) {
        retries++;
        const delay = initialDelay * Math.pow(1.5, retries - 1);
        console.warn(`⏳ [Attempt ${retries}/${maxRetries}] Database not ready: ${error.message}`);
        if (retries < maxRetries) {
          console.log(`   Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    return false;
  }

  try {
    console.log('🚀 Finalizing system startup...');

    // ============================================
    // WAIT FOR DATABASE (Critical for Railway)
    // ============================================
    const dbReady = await waitForDatabase();
    if (!dbReady) {
      console.error('❌ FATAL: Database could not be reached after multiple retries.');
      process.exit(1);
    }

    // ============================================
    // SCHEMA MIGRATION (Background)
    // ============================================
    console.log('📦 Running database schema migrations...');
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync('npx prisma migrate deploy');
      if (stdout) console.log(stdout.split('\n').filter(Boolean).map(l => `   ${l}`).join('\n'));
      console.log('✅ Schema migrations applied successfully');
    } catch (migrateError: any) {
      console.warn('⚠️  Prisma migrate deploy failed, attempting db push fallback...');
      const errorMsg = migrateError.stdout || migrateError.message || '';
      console.warn(`   Info: ${errorMsg.substring(0, 200)}...`);

      try {
        const { stdout } = await execAsync('npx prisma db push --accept-data-loss');
        if (stdout) console.log(stdout.split('\n').filter(Boolean).map(l => `   ${l}`).join('\n'));
        console.log('✅ Database schema pushed successfully');
      } catch (pushError: any) {
        console.error('❌ Database schema update failed:', pushError.stdout || pushError.message);
      }
    }



    // ============================================
    // SECURITY VALIDATION
    // ============================================
    console.log('🔒 Validating security configuration...');
    const securityCheck = validateSecurityConfiguration();

    if (!securityCheck.success) {
      console.error('❌ CRITICAL SECURITY CHECKS FAILED');
      console.error('   Cannot continue with insecure configuration.');
      process.exit(1);
    }
    console.log('✅ Security configuration validated');

    // Check data migration status (seeding)
    console.log('📋 Checking database data status...');
    const migrationStatus = await checkMigrationStatus();

    if (migrationStatus.error) {
      console.error('❌ Database connection failed during data check!');
      console.error(`   Error: ${migrationStatus.error}`);
      console.log('⏳ Server will remain in startup mode and wait for database to recover...');
      return; // Stop initialization but keep server running
    }

    if (migrationStatus.completed) {
      console.log('✅ Data seeding already completed');
    } else {
      console.log('📋 Database is empty, performing automatic data seeding...');
      try {
        const migrationResult = await performMigration();

        if (migrationResult.completed) {
          console.log('✅ Automatic data seeding completed successfully');
        } else {
          console.error('❌ Automatic data seeding failed!');
          console.error(`   Error: ${migrationResult.error}`);
          // Don't throw, just allow retry later
        }
      } catch (seedError: any) {
        console.error('❌ Error during data seeding:', seedError.message);
      }
    }


    // Run admin sync
    await ensureAdminAccount();

    isStartingUp = false;
    console.log('✅ System fully operational');
    console.log(`🔄 Migration status: http://localhost:${PORT}/api/migration/status`);


  } catch (error) {
    console.error('❌ Failed to start server components:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

startServer();

export default app;
