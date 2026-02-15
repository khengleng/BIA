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
    console.error('CRITICAL SECURITY NOTICE: INITIAL_ADMIN_PASSWORD not set.');
    console.error(`A secure random password has been generated for ${adminEmail}: ${adminPassword}`);
    console.error('Please change this password immediately after first login or set INITIAL_ADMIN_PASSWORD env var.');
  }

  try {
    const user = await prisma.user.findFirst({ where: { email: adminEmail } });
    const hashedPassword = await bcrypt.hash(adminPassword, 12); // Use higher cost factor

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          status: 'ACTIVE',
          role: 'SUPER_ADMIN' // Force role update
        }
      });
      console.log(`✅ Admin account synced with password from environment`);
    } else {
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
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: 'ok',
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
      database: 'connected'
    });
  } catch (error) {
    return res.status(503).json({
      status: 'degraded',
      timestamp: new Date(),
      error: 'Database connection failed'
    });
  }
});

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
  console.error('FATAL: COOKIE_SECRET environment variable is not set!');
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
        if (isProduction) {
          // Allow no-origin calls only for health and CSRF token endpoints
          if (req.path === '/health' || req.path === '/api/csrf-token') {
            return callback(null, true);
          }
          console.warn(`Blocked by CORS: Request with no origin rejected in production.`);
          return callback(new Error('Not allowed by CORS: Origin required'), false);
        }
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (!isProduction || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        // In development or for localhost, be more permissive
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
  skip: (req) => req.path === '/health',
  store: new RedisStore({
    sendCommand: ((...args: string[]) => redis.call(args[0], ...args.slice(1))) as any,
    prefix: 'bia:rl:main:',
  }),
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
  store: new RedisStore({
    sendCommand: ((...args: string[]) => redis.call(args[0], ...args.slice(1))) as any,
    prefix: 'bia:rl:auth:',
  }),
});

const csrfSecret = process.env.CSRF_SECRET;
if (isProduction && !csrfSecret) {
  console.error('FATAL: CSRF_SECRET environment variable is not set!');
  process.exit(1);
}

// CSRF Protection Setup
const { invalidCsrfTokenError, generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => csrfSecret || 'dev-csrf-secret',
  cookieName: process.env.NODE_ENV === 'production' ? '__Host-psifi.x-csrf-token' : 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
    // signed: true // Removed to fix type error, handled by cookieParser if secret provided?
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req: express.Request) => req.headers['x-csrf-token'] as string
} as any) as any;

// CSRF Token Endpoint
app.get('/api/csrf-token', (req: express.Request, res: express.Response) => {
  const csrfToken = generateToken(res, req);
  res.json({ csrfToken });
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
  try {
    console.log('🚀 Starting Boutique Advisory Platform...');

    // ============================================
    // SECURITY VALIDATION (First step)
    // ============================================
    console.log('🔒 Validating security configuration...');
    const securityCheck = validateSecurityConfiguration();

    if (!securityCheck.success) {
      console.error('❌ CRITICAL SECURITY CHECKS FAILED');
      console.error('   Cannot start server with insecure configuration.');
      console.error('   Please fix the issues above and try again.');
      process.exit(1);
    }
    console.log('✅ Security configuration validated');

    // Check migration status on startup
    console.log('📋 Checking database connection and migration status...');
    const migrationStatus = await checkMigrationStatus();

    if (migrationStatus.error) {
      console.error('❌ Database connection failed!');
      console.error(`   Error: ${migrationStatus.error}`);
      console.error('   Please ensure PostgreSQL is running and accessible.');
      console.error('   Check DATABASE_URL in your .env file.');
      throw new Error('Database connection required - cannot start without database');
    }

    if (migrationStatus.completed) {
      console.log('✅ Database migration already completed');
      console.log('🗄️  Using PostgreSQL database');
    } else {
      console.log('📋 Database is empty, performing automatic migration...');
      const migrationResult = await performMigration();

      if (migrationResult.completed) {
        console.log('✅ Automatic migration completed successfully');
        console.log('🗄️  Using PostgreSQL database');
      } else {
        console.error('❌ Automatic migration failed!');
        console.error(`   Error: ${migrationResult.error}`);
        throw new Error('Database migration required - cannot start without migrated database');
      }
    }

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.io
    initSocket(httpServer);

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Boutique Advisory Platform API running on port ${PORT}`);
      console.log(`📡 Real-time WebSockets enabled`);
      console.log(`📊 Health check available at http://localhost:${PORT}/health`);
      console.log(`🔄 Migration status: http://localhost:${PORT}/api/migration/status`);
    });

    // Run admin sync after server starts
    await ensureAdminAccount();

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
