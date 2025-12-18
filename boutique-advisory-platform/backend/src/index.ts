import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { prisma, connectDatabase } from './database';
import {
  checkMigrationStatus,
  performMigration,
  getMigrationStatus,
  switchToDatabase,
  fallbackToInMemory,
  shouldUseDatabase
} from './migration-manager';

// Load environment variables
dotenv.config();

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize in-memory storage (temporary until migration is complete)
// const prisma = new PrismaClient();

// Test users for role-based testing
const users: any[] = [
  {
    id: 'admin_1',
    email: 'admin@boutique-advisory.com',
    password: '$2a$12$TV8iqAD8TbH4/eDTMZ9wgO87jhuWw5BZTxvBuIuhH1IXR42TzvuXe', // password: admin123
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User',
    tenantId: 'default',
    createdAt: new Date()
  },
  {
    id: 'advisor_1',
    email: 'advisor@boutique-advisory.com',
    password: '$2a$12$vdD2HhKM6g23LYMz/bVB8OBpRoOoEubLLG6E526dSa0R4NEgLUbcO', // password: advisor123
    role: 'ADVISOR',
    firstName: 'Sarah',
    lastName: 'Johnson',
    tenantId: 'default',
    createdAt: new Date()
  },
  {
    id: 'investor_1',
    email: 'investor@boutique-advisory.com',
    password: '$2a$12$QsfpQ02y0Rr9SJ3rqEsV7.ggGUNw97v3a5A.YwIAnknTBCvSxI8Ru', // password: investor123
    role: 'INVESTOR',
    firstName: 'John',
    lastName: 'Smith',
    tenantId: 'default',
    createdAt: new Date()
  },
  {
    id: 'sme_1',
    email: 'sme@boutique-advisory.com',
    password: '$2a$12$NJCImGBHObs/GtaqkBXr/unG24iEOmWJWykAGitdO79dm4LWCrPvq', // password: sme123
    role: 'SME',
    firstName: 'Tech',
    lastName: 'Startup',
    tenantId: 'default',
    createdAt: new Date()
  }
];

// Test SMEs data
const smes: any[] = [
  {
    id: 'sme_1',
    userId: 'sme_1',
    tenantId: 'default',
    name: 'Tech Startup A',
    sector: 'Technology',
    stage: 'Series A',
    fundingRequired: 500000,
    description: 'Innovative fintech solution for digital payments and financial inclusion.',
    website: 'https://techstartupa.com',
    location: 'Phnom Penh, Cambodia',
    registrationNumber: 'TECH001',
    taxId: 'TAX123456',
    foundedDate: '2022-01-15',
    address: '123 Tech Street',
    city: 'Phnom Penh',
    province: 'Phnom Penh',
    postalCode: '12000',
    phone: '+855 12 345 678',
    email: 'contact@techstartupa.com',
    industry: 'Fintech',
    businessStage: 'Early Growth',
    employeeCount: '11-25',
    annualRevenue: '$200,000',
    currentAssets: '$150,000',
    currentLiabilities: '$50,000',
    totalRevenue: '$200,000',
    netProfit: '$30,000',
    valueProposition: 'Secure and affordable digital payment solutions',
    targetMarket: 'Small businesses and individuals in Cambodia',
    competitiveAdvantage: 'Local market expertise and regulatory compliance',
    businessPlan: null,
    financialStatements: null,
    legalDocuments: null,
    createdAt: new Date()
  },
  {
    id: 'sme_2',
    userId: 'advisor_1',
    tenantId: 'default',
    name: 'E-commerce Platform B',
    sector: 'E-commerce',
    stage: 'Seed',
    fundingRequired: 200000,
    description: 'Online marketplace connecting local artisans with global customers.',
    website: 'https://ecommerceb.com',
    location: 'Siem Reap, Cambodia',
    registrationNumber: 'ECOMM002',
    taxId: 'TAX789012',
    foundedDate: '2023-03-20',
    address: '456 Artisan Road',
    city: 'Siem Reap',
    province: 'Siem Reap',
    postalCode: '17252',
    phone: '+855 12 345 679',
    email: 'info@ecommerceb.com',
    industry: 'E-commerce',
    businessStage: 'Startup',
    employeeCount: '6-10',
    annualRevenue: '$80,000',
    currentAssets: '$60,000',
    currentLiabilities: '$20,000',
    totalRevenue: '$80,000',
    netProfit: '$15,000',
    valueProposition: 'Authentic Cambodian handicrafts for global markets',
    targetMarket: 'International tourists and online shoppers',
    competitiveAdvantage: 'Direct artisan partnerships and cultural authenticity',
    businessPlan: null,
    financialStatements: null,
    legalDocuments: null,
    createdAt: new Date()
  }
];

// Test Investors data
const investors: any[] = [
  {
    id: 'investor_1',
    userId: 'investor_1',
    tenantId: 'default',
    name: 'John Smith',
    type: 'ANGEL',
    kycStatus: 'APPROVED',
    createdAt: new Date()
  }
];

// Test Deals data
const deals: any[] = [
  {
    id: 'deal_1',
    smeId: 'sme_1',
    investorId: 'investor_1',
    title: 'Tech Startup A Series A Funding',
    description: 'Series A funding round for Tech Startup A to expand their fintech platform',
    amount: 500000,
    equity: 15,
    status: 'ACTIVE',
    stage: 'DUE_DILIGENCE',
    createdAt: new Date()
  }
];

// Test Documents data (temporary until migration is complete)
const documents: any[] = [
  {
    id: 'doc_1',
    name: 'Identification Document',
    type: 'PDF',
    size: '1.2 MB',
    uploaded: '2024-01-15',
    mimeType: 'application/pdf',
    dealId: null,
    userId: 'user_1'
  },
  {
    id: 'doc_2',
    name: 'Proof of Funds',
    type: 'PDF',
    size: '2.1 MB',
    uploaded: '2024-01-10',
    mimeType: 'application/pdf',
    dealId: null,
    userId: 'user_1'
  },
  {
    id: 'doc_3',
    name: 'Professional References',
    type: 'PDF',
    size: '0.8 MB',
    uploaded: '2024-01-05',
    mimeType: 'application/pdf',
    dealId: null,
    userId: 'user_1'
  },
  {
    id: 'doc_4',
    name: 'Term Sheet',
    type: 'PDF',
    size: '1.5 MB',
    uploaded: '2024-01-20',
    mimeType: 'application/pdf',
    dealId: 'deal_1',
    userId: 'user_1'
  },
  {
    id: 'doc_5',
    name: 'Financial Model',
    type: 'XLSX',
    size: '2.8 MB',
    uploaded: '2024-01-18',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dealId: 'deal_1',
    userId: 'user_1'
  },
  {
    id: 'doc_6',
    name: 'Due Diligence Report',
    type: 'PDF',
    size: '3.2 MB',
    uploaded: '2024-01-22',
    mimeType: 'application/pdf',
    dealId: 'deal_1',
    userId: 'user_1'
  }
];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xlsx|xls|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, XLSX, XLS, JPG, JPEG, PNG files are allowed'));
    }
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
      'https://frontend-production-deae.up.railway.app',
      process.env.FRONTEND_URL || 'https://frontend-production-deae.up.railway.app'
    ]
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:1001'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Rate limiting configurations
// General API rate limiter - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Strict rate limiter for auth endpoints - 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again after 15 minutes.' },
  skipSuccessfulRequests: true // Don't count successful logins
});

// Password reset limiter - 3 attempts per hour
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many password reset attempts, please try again after 1 hour.' }
});

// Registration limiter - 3 registrations per hour per IP
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many registration attempts, please try again after 1 hour.' }
});

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

// CAPTCHA verification helper function
const verifyCaptcha = async (captchaToken: string): Promise<boolean> => {
  // If no CAPTCHA secret is configured, skip verification (for development)
  const captchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (!captchaSecret) {
    console.log('⚠️ CAPTCHA verification skipped - RECAPTCHA_SECRET_KEY not configured');
    return true;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${captchaSecret}&response=${captchaToken}`
    });

    const data = await response.json() as { success: boolean; score?: number };

    // For reCAPTCHA v3, check score (0.0 - 1.0, higher is more likely human)
    if (data.score !== undefined) {
      return data.success && data.score >= 0.5;
    }

    // For reCAPTCHA v2
    return data.success;
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return false;
  }
};


// Authentication middleware
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    // Check if we should use database or in-memory
    const useDatabase = await shouldUseDatabase();

    let user;
    if (useDatabase) {
      // Find user in database
      user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
    } else {
      // Fallback to in-memory
      user = users.find(u => u.id === decoded.userId);
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
    return;
  }
};

// Role-based authorization middleware
const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Resource ownership middleware
const authorizeResourceAccess = (resourceType: 'sme' | 'investor' | 'deal') => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const resourceId = req.params.id;
    let resource: any = null;

    switch (resourceType) {
      case 'sme':
        resource = smes.find(s => s.id === resourceId);
        break;
      case 'investor':
        resource = investors.find(i => i.id === resourceId);
        break;
      case 'deal':
        resource = deals.find(d => d.id === resourceId);
        break;
    }

    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    // Admin can access all resources
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Users can only access their own resources
    if (resource.userId === req.user.id) {
      return next();
    }

    res.status(403).json({ error: 'Access denied' });
  };
};

// Migration management endpoints
app.get('/api/migration/status', async (req, res) => {
  try {
    const status = await checkMigrationStatus();
    res.json({
      ...status,
      message: status.completed ? 'Migration completed' : 'Migration needed'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check migration status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/migration/perform', async (req, res) => {
  try {
    console.log('🔄 Migration requested via API...');
    const result = await performMigration();

    if (result.completed) {
      res.json({
        success: true,
        message: 'Migration completed successfully',
        ...result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Migration failed',
        ...result
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/migration/switch-to-database', (req, res) => {
  try {
    const success = switchToDatabase();
    if (success) {
      res.json({
        success: true,
        message: 'Switched to database mode successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Cannot switch to database mode - migration not completed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to switch to database mode'
    });
  }
});

app.post('/api/migration/fallback-to-memory', (req, res) => {
  try {
    fallbackToInMemory();
    res.json({
      success: true,
      message: 'Fallback to in-memory mode successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fallback to in-memory mode'
    });
  }
});

// Test endpoint to get login tokens for testing
app.get('/api/test/tokens', (req, res) => {
  try {
    const tokens = {
      admin: jwt.sign(
        { userId: 'admin_1', email: 'admin@boutique-advisory.com', role: 'ADMIN' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      ),
      advisor: jwt.sign(
        { userId: 'advisor_1', email: 'advisor@boutique-advisory.com', role: 'ADVISOR' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      ),
      investor: jwt.sign(
        { userId: 'investor_1', email: 'investor@boutique-advisory.com', role: 'INVESTOR' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      ),
      sme: jwt.sign(
        { userId: 'sme_1', email: 'sme@boutique-advisory.com', role: 'SME' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      )
    };

    res.json({
      message: 'Test tokens generated successfully',
      tokens,
      testUsers: {
        admin: { email: 'admin@boutique-advisory.com', password: 'admin123' },
        advisor: { email: 'advisor@boutique-advisory.com', password: 'advisor123' },
        investor: { email: 'investor@boutique-advisory.com', password: 'investor123' },
        sme: { email: 'sme@boutique-advisory.com', password: 'sme123' }
      },
      rolePermissions: {
        ADMIN: {
          description: 'Full system access',
          permissions: ['View all SMEs', 'Create SMEs', 'Edit SMEs', 'Delete SMEs', 'View all Investors', 'Create Investors', 'Edit Investors', 'Delete Investors', 'View all Deals', 'Create Deals', 'Edit Deals', 'Delete Deals', 'Access Reports', 'Manage Users']
        },
        ADVISOR: {
          description: 'Advisory and management access',
          permissions: ['View all SMEs', 'Create SMEs', 'Edit SMEs', 'Delete SMEs', 'View all Investors', 'Create Investors', 'Edit Investors', 'Delete Investors', 'View all Deals', 'Create Deals', 'Edit Deals', 'Delete Deals', 'Access Reports']
        },
        INVESTOR: {
          description: 'Investment-focused access',
          permissions: ['View SMEs', 'View Investors', 'View Deals', 'Create Deals', 'Access Reports']
        },
        SME: {
          description: 'Limited access for SME users',
          permissions: ['View own SME profile', 'Edit own SME profile', 'View Investors', 'View Deals']
        }
      }
    });
  } catch (error) {
    console.error('Error generating test tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Simple health check without database
    res.json({
      service: 'boutique-advisory-platform',
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'in-memory'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      service: 'boutique-advisory-platform',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});

// Authentication endpoints
app.post('/api/auth/register', registrationLimiter, async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, captchaToken } = req.body;

    // Verify CAPTCHA if token provided
    if (captchaToken) {
      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) {
        res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
        return;
      }
    }

    if (!email || !password || !role || !firstName || !lastName) {
      res.status(400).json({
        error: 'Missing required fields: email, password, role, firstName, lastName'
      });
      return;
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      res.status(409).json({
        error: 'User already exists with this email'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      tenantId: 'default',
      createdAt: new Date()
    };

    users.push(user);

    // Create role-specific profile
    if (role === 'SME') {
      const sme = {
        id: `sme_${Date.now()}`,
        userId: user.id,
        tenantId: 'default',
        name: `${firstName} ${lastName}`,
        sector: 'Technology',
        stage: 'SEED',
        fundingRequired: 100000,
        description: 'New SME registration',
        createdAt: new Date()
      };
      smes.push(sme);
    } else if (role === 'INVESTOR') {
      const investor = {
        id: `investor_${Date.now()}`,
        userId: user.id,
        tenantId: 'default',
        name: `${firstName} ${lastName}`,
        type: 'ANGEL',
        kycStatus: 'PENDING',
        createdAt: new Date()
      };
      investors.push(investor);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    // Verify CAPTCHA if token provided
    if (captchaToken) {
      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) {
        res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
        return;
      }
    }

    if (!email || !password) {
      res.status(400).json({
        error: 'Email and password are required'
      });
      return;
    }

    // Check if we should use database or in-memory
    const useDatabase = await shouldUseDatabase();

    let user;
    if (useDatabase) {
      // Find user in database using tenantId_email compound unique constraint
      user = await prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: 'default',
            email: email
          }
        }
      });
    } else {
      // Fallback to in-memory
      user = users.find(u => u.email === email);
    }

    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials'
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password endpoint
app.post('/api/auth/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email, captchaToken } = req.body;

    // Verify CAPTCHA if token provided
    if (captchaToken) {
      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) {
        res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
        return;
      }
    }

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Check if user exists (don't reveal if email exists for security)
    const user = users.find(u => u.email === email);

    // Always return success to prevent email enumeration attacks
    console.log(`Password reset requested for: ${email}, User exists: ${!!user}`);

    // In production, you would:
    // 1. Generate a secure token
    // 2. Store token with expiration in database
    // 3. Send email with reset link

    res.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
      success: true
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password endpoint
app.post('/api/auth/reset-password', passwordResetLimiter, async (req, res) => {
  try {
    const { token, password, captchaToken } = req.body;

    // Verify CAPTCHA if token provided
    if (captchaToken) {
      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) {
        res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
        return;
      }
    }

    if (!token || !password) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    // In production, you would:
    // 1. Verify the reset token is valid and not expired
    // 2. Find the user associated with the token
    // 3. Hash and update the password
    // 4. Invalidate the token

    // For demo purposes, we'll return success
    console.log(`Password reset attempted with token: ${token.substring(0, 10)}...`);

    res.json({
      message: 'Password has been reset successfully.',
      success: true
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SME endpoints
app.get('/api/smes', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR', 'INVESTOR', 'SME'), async (req, res) => {
  try {
    const smesWithUsers = smes.map(sme => ({
      ...sme,
      user: users.find(u => u.id === sme.userId)
    }));
    res.json(smesWithUsers);
  } catch (error) {
    console.error('Error fetching SMEs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/smes/:id', authenticateToken, async (req, res) => {
  try {
    const sme = smes.find(s => s.id === req.params.id);

    if (!sme) {
      res.status(404).json({ error: 'SME not found' });
      return;
    }

    const smeWithUser = {
      ...sme,
      user: users.find(u => u.id === sme.userId)
    };

    res.json(smeWithUser);
  } catch (error) {
    console.error('Error fetching SME:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/smes', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR'), async (req, res) => {
  try {
    const {
      companyName,
      registrationNumber,
      taxId,
      foundedDate,
      website,
      address,
      city,
      province,
      postalCode,
      phone,
      email,
      sector,
      industry,
      businessStage,
      employeeCount,
      annualRevenue,
      fundingRequired,
      currentAssets,
      currentLiabilities,
      totalRevenue,
      netProfit,
      businessDescription,
      valueProposition,
      targetMarket,
      competitiveAdvantage
    } = req.body;

    // Validate required fields
    if (!companyName || !sector || !businessDescription) {
      res.status(400).json({ error: 'Company name, sector, and business description are required' });
      return;
    }

    const sme = {
      id: `sme_${Date.now()}`,
      tenantId: 'default',
      userId: req.user!.id,
      name: companyName,
      sector,
      stage: businessStage || 'Startup',
      fundingRequired: fundingRequired ? parseFloat(fundingRequired.replace(/[^0-9.-]+/g, '')) : 0,
      description: businessDescription,
      website,
      location: `${address}, ${city}, ${province}`,
      // Additional fields
      registrationNumber,
      taxId,
      foundedDate,
      address,
      city,
      province,
      postalCode,
      phone,
      email,
      industry,
      employeeCount,
      annualRevenue,
      currentAssets,
      currentLiabilities,
      totalRevenue,
      netProfit,
      valueProposition,
      targetMarket,
      competitiveAdvantage,
      // File uploads (temporarily disabled for testing)
      businessPlan: null,
      financialStatements: null,
      legalDocuments: null,
      createdAt: new Date()
    };

    smes.push(sme);

    const smeWithUser = {
      ...sme,
      user: users.find(u => u.id === sme.userId)
    };

    res.status(201).json(smeWithUser);
  } catch (error) {
    console.error('Error creating SME:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/smes/:id', authenticateToken, async (req, res) => {
  try {
    const { name, sector, stage, fundingRequired, description, website, location } = req.body;

    const smeIndex = smes.findIndex(s => s.id === req.params.id);
    if (smeIndex === -1) {
      res.status(404).json({ error: 'SME not found' });
      return;
    }

    // Check permissions: ADMIN/ADVISOR can edit all, or user must own the SME profile
    const sme = smes[smeIndex];
    const isOwner = sme.userId === req.user!.userId;
    const isAdminOrAdvisor = req.user!.role === 'ADMIN' || req.user!.role === 'ADVISOR';

    if (!isOwner && !isAdminOrAdvisor) {
      res.status(403).json({ error: 'Permission denied. You can only edit your own SME profile.' });
      return;
    }

    smes[smeIndex] = {
      ...smes[smeIndex],
      name,
      sector,
      stage,
      fundingRequired: parseFloat(fundingRequired),
      description,
      website,
      location
    };

    const smeWithUser = {
      ...smes[smeIndex],
      user: users.find(u => u.id === smes[smeIndex].userId)
    };

    res.json(smeWithUser);
  } catch (error) {
    console.error('Error updating SME:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/smes/:id', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR'), async (req, res) => {
  try {
    const smeIndex = smes.findIndex(s => s.id === req.params.id);
    if (smeIndex === -1) {
      res.status(404).json({ error: 'SME not found' });
      return;
    }

    smes.splice(smeIndex, 1);

    res.json({ message: 'SME deleted successfully' });
  } catch (error) {
    console.error('Error deleting SME:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Investor endpoints
app.get('/api/investors', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR', 'SME', 'INVESTOR'), async (req, res) => {
  try {
    const investorsWithUsers = investors.map(investor => ({
      ...investor,
      user: users.find(u => u.id === investor.userId)
    }));
    res.json(investorsWithUsers);
  } catch (error) {
    console.error('Error fetching investors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/investors/:id', authenticateToken, async (req, res) => {
  try {
    const investor = investors.find(i => i.id === req.params.id);

    if (!investor) {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    const investorWithUser = {
      ...investor,
      user: users.find(u => u.id === investor.userId)
    };

    res.json(investorWithUser);
  } catch (error) {
    console.error('Error fetching investor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/investors', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR'), async (req, res) => {
  try {
    const { name, type, preferences } = req.body;

    const investor = {
      id: `investor_${Date.now()}`,
      tenantId: 'default',
      userId: req.user!.id,
      name,
      type,
      preferences: preferences || {},
      createdAt: new Date()
    };

    investors.push(investor);

    const investorWithUser = {
      ...investor,
      user: users.find(u => u.id === investor.userId)
    };

    res.status(201).json(investorWithUser);
  } catch (error) {
    console.error('Error creating investor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/investors/:id', authenticateToken, async (req, res) => {
  try {
    const { name, type, preferences } = req.body;

    const investorIndex = investors.findIndex(i => i.id === req.params.id);
    if (investorIndex === -1) {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    // Check permissions: ADMIN/ADVISOR can edit all, or user must own the investor profile
    const investor = investors[investorIndex];
    const isOwner = investor.userId === req.user!.userId;
    const isAdminOrAdvisor = req.user!.role === 'ADMIN' || req.user!.role === 'ADVISOR';

    if (!isOwner && !isAdminOrAdvisor) {
      res.status(403).json({ error: 'Permission denied. You can only edit your own investor profile.' });
      return;
    }

    investors[investorIndex] = {
      ...investors[investorIndex],
      name,
      type,
      preferences: preferences || {}
    };

    const investorWithUser = {
      ...investors[investorIndex],
      user: users.find(u => u.id === investors[investorIndex].userId)
    };

    res.json(investorWithUser);
  } catch (error) {
    console.error('Error updating investor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/investors/:id', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR'), async (req, res) => {
  try {
    const investorIndex = investors.findIndex(i => i.id === req.params.id);
    if (investorIndex === -1) {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    investors.splice(investorIndex, 1);

    res.json({ message: 'Investor deleted successfully' });
  } catch (error) {
    console.error('Error deleting investor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deal endpoints
app.get('/api/deals', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR', 'SME', 'INVESTOR'), async (req, res) => {
  try {
    const dealsWithRelations = deals.map(deal => ({
      ...deal,
      sme: smes.find(s => s.id === deal.smeId),
      documents: documents.filter(d => d.dealId === deal.id)
    }));
    res.json(dealsWithRelations);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/deals/:id', authenticateToken, async (req, res) => {
  try {
    const deal = deals.find(d => d.id === req.params.id);

    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    const dealWithRelations = {
      ...deal,
      sme: smes.find(s => s.id === deal.smeId),
      documents: documents.filter(d => d.dealId === deal.id)
    };

    res.json(dealWithRelations);
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/deals', authenticateToken, async (req, res) => {
  try {
    const { smeId, title, description, amount, equity, successFee, stage } = req.body;

    const deal = {
      id: `deal_${Date.now()}`,
      tenantId: 'default',
      smeId,
      title,
      description,
      amount: parseFloat(amount),
      equity: equity ? parseFloat(equity) : null,
      successFee: successFee ? parseFloat(successFee) : null,
      status: 'DRAFT',
      stage: stage || 'Initial Contact',
      createdAt: new Date()
    };

    deals.push(deal);

    const dealWithRelations = {
      ...deal,
      sme: smes.find(s => s.id === deal.smeId)
    };

    res.status(201).json(dealWithRelations);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/deals/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, amount, equity, status, successFee, stage } = req.body;

    const dealIndex = deals.findIndex(d => d.id === req.params.id);
    if (dealIndex === -1) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    deals[dealIndex] = {
      ...deals[dealIndex],
      title,
      description,
      amount: parseFloat(amount),
      equity: equity ? parseFloat(equity) : null,
      status,
      stage,
      successFee: successFee ? parseFloat(successFee) : null
    };

    const dealWithRelations = {
      ...deals[dealIndex],
      sme: smes.find(s => s.id === deals[dealIndex].smeId)
    };

    res.json(dealWithRelations);
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/deals/:id', authenticateToken, async (req, res) => {
  try {
    const dealIndex = deals.findIndex(d => d.id === req.params.id);
    if (dealIndex === -1) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    deals.splice(dealIndex, 1);

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Document endpoints
app.post('/api/documents', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { name, type, smeId, dealId } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const document = {
      id: `doc_${Date.now()}`,
      tenantId: 'default',
      name,
      type,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
      smeId: smeId || null,
      dealId: dealId || null,
      uploadedBy: req.user!.id,
      createdAt: new Date()
    };

    documents.push(document);

    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/documents/:docName', async (req, res) => {
  try {
    // Check for token in Authorization header or query parameter
    const authHeader = req.headers['authorization'];
    const queryToken = req.query.token as string;
    const token = authHeader ? authHeader.split(' ')[1] : queryToken;

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      const user = users.find(u => u.id === decoded.userId);

      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
    } catch (error) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }

    const { docName } = req.params;
    const decodedDocName = decodeURIComponent(docName);

    const document = documents.find(d => d.name === decodedDocName);

    if (!document) {
      res.status(404).json({
        error: 'Document not found',
        message: `Document "${decodedDocName}" not found`
      });
      return;
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${document.name}"`);

    // In production, you would serve the actual file from storage
    res.send(`Mock content for ${document.name}`);

  } catch (error) {
    console.error('Document viewing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/documents/:docName/download', authenticateToken, async (req, res) => {
  try {
    const { docName } = req.params;
    const decodedDocName = decodeURIComponent(docName);

    const document = documents.find(d => d.name === decodedDocName);

    if (!document) {
      res.status(404).json({
        error: 'Document not found',
        message: `Document "${decodedDocName}" not found`
      });
      return;
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);

    // In production, you would serve the actual file from storage
    res.send(`Mock content for ${document.name} download`);

  } catch (error) {
    console.error('Document download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Advisory services endpoints
app.get('/api/advisory/services', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, this would come from a database
    const services = [
      {
        id: 1,
        name: 'Business Strategy Consulting',
        category: 'Strategy',
        description: 'Comprehensive business strategy development and implementation',
        duration: '2-4 weeks',
        price: '$5,000 - $15,000',
        advisor: 'Dr. Sarah Johnson',
        rating: 4.8,
        reviews: 24,
        features: ['Market Analysis', 'Competitive Positioning', 'Growth Strategy', 'Implementation Plan']
      },
      {
        id: 2,
        name: 'Financial Planning & Analysis',
        category: 'Finance',
        description: 'Financial modeling, forecasting, and investment analysis',
        duration: '1-3 weeks',
        price: '$3,000 - $10,000',
        advisor: 'Michael Chen',
        rating: 4.9,
        reviews: 18,
        features: ['Financial Modeling', 'Forecasting', 'Investment Analysis', 'Risk Assessment']
      }
    ];

    res.json(services);
  } catch (error) {
    console.error('Error fetching advisory services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/advisory/book', authenticateToken, async (req, res) => {
  try {
    const { serviceId, serviceName, advisorName, preferredDate, notes } = req.body;

    // In a real implementation, this would create a booking record in the database
    const booking = {
      id: Date.now(),
      serviceId,
      serviceName,
      advisorName,
      preferredDate,
      notes,
      status: 'Pending',
      userId: req.user!.id,
      createdAt: new Date()
    };

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server with migration handling
async function startServer() {
  try {
    console.log('🚀 Starting Boutique Advisory Platform...');

    // Check migration status on startup
    console.log('📋 Checking migration status...');
    const migrationStatus = await checkMigrationStatus();

    if (migrationStatus.completed) {
      console.log('✅ Database migration already completed');
      console.log('🗄️  Using PostgreSQL database');
    } else if (migrationStatus.error) {
      console.log('⚠️  Database connection failed, using in-memory storage');
      console.log(`   Error: ${migrationStatus.error}`);
    } else {
      console.log('📋 Database is empty, migration needed');
      console.log('💾 Using in-memory storage as backup');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Boutique Advisory Platform API running on port ${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/health`);
      console.log(`🔄 Migration status: http://localhost:${PORT}/api/migration/status`);
      console.log(`📋 Migration endpoints:`);
      console.log(`   - GET  /api/migration/status - Check migration status`);
      console.log(`   - POST /api/migration/perform - Perform migration`);
      console.log(`   - POST /api/migration/switch-to-database - Switch to database mode`);
      console.log(`   - POST /api/migration/fallback-to-memory - Fallback to in-memory mode`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
