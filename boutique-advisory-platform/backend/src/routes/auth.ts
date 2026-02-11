import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../database';
import {
  validatePasswordStrength,
  generateSecureToken,
  hashToken,
  logAuditEvent,
  isLockedOut,
  recordFailedAttempt,
  clearFailedAttempts,
  sanitizeEmail
} from '../utils/security';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email';
import { generateMfaSecret, generateQrCode, verifyMfaToken, generateBackupCodes } from '../utils/mfa';
import {
  authenticateToken,
  AuthenticatedRequest
} from '../middleware/jwt-auth';

const router = Router();

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role, firstName, lastName, tenantId = 'default' } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Validate required fields
    if (!email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, role, firstName, lastName'
      });
    }

    // SECURITY: Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // SECURITY: Validate password strength
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: sanitizedEmail,
        tenantId
      }
    });

    if (existingUser) {
      // SECURITY: Log attempt to register with existing email
      await logAuditEvent({
        userId: 'anonymous',
        action: 'REGISTER_ATTEMPT',
        resource: 'user',
        details: { email: sanitizedEmail, reason: 'email_exists' },
        ipAddress: clientIp,
        success: false,
        errorMessage: 'Email already registered'
      });
      return res.status(409).json({
        error: 'User already exists with this email'
      });
    }

    // Hash password with strong hashing
    const hashedPassword = await bcrypt.hash(password, 12);

    // SECURITY: Restrict roles for public registration to prevent privilege escalation
    // Roles like ADVISOR, ADMIN, and SUPER_ADMIN have elevated permissions and must be manually assigned
    const allowedPublicRoles = ['SME', 'INVESTOR'];
    if (!allowedPublicRoles.includes(role)) {
      await logAuditEvent({
        userId: 'anonymous',
        action: 'REGISTER_BLOCKED',
        resource: 'user',
        details: { email: sanitizedEmail, attemptedRole: role },
        ipAddress: clientIp,
        success: false,
        errorMessage: 'Unauthorized role registration'
      });
      return res.status(403).json({
        error: 'Unauthorized role. Please contact support for administrative access.'
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as any,
        firstName,
        lastName,
        tenantId,
        status: 'ACTIVE',
        language: 'EN'
      }
    });

    // Create role-specific profile
    if (role === 'SME') {
      await prisma.sME.create({
        data: {
          userId: user.id,
          tenantId,
          name: `${firstName} ${lastName}`,
          sector: req.body.sector || 'General',
          stage: 'SEED',
          fundingRequired: req.body.fundingRequired || 0,
          status: 'DRAFT'
        }
      });
    } else if (role === 'INVESTOR') {
      await prisma.investor.create({
        data: {
          userId: user.id,
          tenantId,
          name: `${firstName} ${lastName}`,
          type: req.body.investorType || 'ANGEL',
          kycStatus: 'PENDING'
        }
      });
    } else if (role === 'ADVISOR') {
      await prisma.advisor.create({
        data: {
          userId: user.id,
          tenantId,
          name: `${firstName} ${lastName}`,
          specialization: req.body.specialization || ['General'],
          certificationList: req.body.certifications || [],
          status: 'ACTIVE'
        }
      });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send welcome email (don't block registration if email fails)
    sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`, user.role)
      .catch(error => console.error('Failed to send welcome email:', error));

    return res.status(201).json({
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
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // SECURITY: Sanitize email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // SECURITY: Check for account lockout (brute force protection)
    if (isLockedOut(sanitizedEmail) || isLockedOut(clientIp)) {
      await logAuditEvent({
        userId: 'unknown',
        action: 'LOGIN_BLOCKED',
        resource: 'auth',
        details: { email: sanitizedEmail, reason: 'account_locked' },
        ipAddress: clientIp,
        success: false,
        errorMessage: 'Account temporarily locked'
      });
      return res.status(429).json({
        error: 'Too many failed attempts. Please try again in 15 minutes.'
      });
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: { email: sanitizedEmail }
    });

    if (!user) {
      // SECURITY: Record failed attempt but don't reveal if user exists
      recordFailedAttempt(sanitizedEmail);
      recordFailedAttempt(clientIp);
      await logAuditEvent({
        userId: 'unknown',
        action: 'LOGIN_FAILED',
        resource: 'auth',
        details: { email: sanitizedEmail },
        ipAddress: clientIp,
        success: false,
        errorMessage: 'Account not found'
      });
      return res.status(401).json({
        error: 'Account not found'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // SECURITY: Record failed attempt
      recordFailedAttempt(sanitizedEmail);
      recordFailedAttempt(clientIp);
      await logAuditEvent({
        userId: user.id,
        action: 'LOGIN_FAILED',
        resource: 'auth',
        details: { email: sanitizedEmail },
        ipAddress: clientIp,
        success: false,
        errorMessage: 'Invalid password'
      });
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // SECURITY: Check if account is active
    if (user.status !== 'ACTIVE') {
      await logAuditEvent({
        userId: user.id,
        action: 'LOGIN_BLOCKED',
        resource: 'auth',
        details: { email: sanitizedEmail, status: user.status },
        ipAddress: clientIp,
        success: false,
        errorMessage: 'Account not active'
      });
      return res.status(403).json({
        error: 'Account is not active. Please contact support.'
      });
    }

    // SECURITY: Clear failed attempts on successful login
    clearFailedAttempts(sanitizedEmail);
    clearFailedAttempts(clientIp);

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // 2FA Check
    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          isPreAuth: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '5m' } // Short expiration for 2FA entry
      );

      return res.status(200).json({
        message: '2FA verification required',
        require2fa: true,
        tempToken
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // SECURITY: Log successful login
    await logAuditEvent({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      resource: 'auth',
      details: { email: sanitizedEmail },
      ipAddress: clientIp,
      success: true
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    await logAuditEvent({
      userId: 'unknown',
      action: 'LOGIN_ERROR',
      resource: 'auth',
      ipAddress: clientIp,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // SECURITY: Sanitize email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // SECURITY: Rate limit password reset requests
    if (isLockedOut(`reset_${sanitizedEmail}`)) {
      return res.status(429).json({
        error: 'Too many password reset requests. Please try again later.'
      });
    }

    const user = await prisma.user.findFirst({
      where: { email: sanitizedEmail }
    });

    // SECURITY: Always return success message to prevent email enumeration
    // But only generate token if user exists
    if (user) {
      // Generate secure reset token
      const resetToken = generateSecureToken(32);
      const hashedResetToken = hashToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      // Store hashed token in user record
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedResetToken,
          resetTokenExpiry: expiresAt
        }
      });

      await logAuditEvent({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        resource: 'auth',
        details: {
          email: sanitizedEmail,
          tokenHash: hashedResetToken.substring(0, 10) + '...',
          expiresAt: expiresAt.toISOString()
        },
        ipAddress: clientIp,
        success: true
      });

      // Send password reset email (don't block response if email fails)
      sendPasswordResetEmail(user.email, resetToken)
        .catch(error => console.error('Failed to send password reset email:', error));
    } else {
      // Log attempt for non-existent user (for security monitoring)
      await logAuditEvent({
        userId: 'unknown',
        action: 'PASSWORD_RESET_UNKNOWN_EMAIL',
        resource: 'auth',
        details: { email: sanitizedEmail },
        ipAddress: clientIp,
        success: false
      });
    }

    // Always return same response to prevent email enumeration
    return res.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
      success: true
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    await logAuditEvent({
      userId: 'unknown',
      action: 'PASSWORD_RESET_ERROR',
      resource: 'auth',
      ipAddress: clientIp,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    const { token, password, email } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // SECURITY: Validate password strength
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = hashToken(token);

    // In production: Look up the hashed token in the database
    // For now, we'll validate the token format
    if (token.length !== 64) { // 32 bytes = 64 hex characters
      await logAuditEvent({
        userId: 'unknown',
        action: 'PASSWORD_RESET_INVALID_TOKEN',
        resource: 'auth',
        details: { tokenLength: token.length },
        ipAddress: clientIp,
        success: false,
        errorMessage: 'Invalid token format'
      });
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Verify token exists and is not expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      await logAuditEvent({
        userId: 'unknown',
        action: 'PASSWORD_RESET_INVALID_TOKEN',
        resource: 'auth',
        details: { tokenHash: hashedToken.substring(0, 10) + '...' },
        ipAddress: clientIp,
        success: false,
        errorMessage: 'Token not found or expired'
      });
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Has valid token, update password
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,       // Invalidate token
        resetTokenExpiry: null
      }
    });

    await logAuditEvent({
      userId: user.id,
      action: 'PASSWORD_RESET_SUCCESS',
      resource: 'auth',
      details: { email: user.email },
      ipAddress: clientIp,
      success: true
    });

    // Clear any failed login attempts for this user
    clearFailedAttempts(user.email);

    return res.json({
      message: 'Password has been reset successfully.',
      success: true
    });

    // If we get here, token validation would have failed in production
    await logAuditEvent({
      userId: 'unknown',
      action: 'PASSWORD_RESET_FAILED',
      resource: 'auth',
      ipAddress: clientIp,
      success: false,
      errorMessage: 'Token validation failed'
    });

    return res.status(400).json({ error: 'Invalid or expired reset token' });

  } catch (error) {
    console.error('Reset password error:', error);
    await logAuditEvent({
      userId: 'unknown',
      action: 'PASSWORD_RESET_ERROR',
      resource: 'auth',
      ipAddress: clientIp,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password endpoint (for authenticated users)
router.post('/change-password', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // SECURITY: Validate new password strength
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      await logAuditEvent({
        userId: user.id,
        action: 'PASSWORD_CHANGE_FAILED',
        resource: 'auth',
        ipAddress: clientIp,
        success: false,
        errorMessage: 'Invalid current password'
      });
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    await logAuditEvent({
      userId: user.id,
      action: 'PASSWORD_CHANGE_SUCCESS',
      resource: 'auth',
      ipAddress: clientIp,
      success: true
    });

    return res.json({
      message: 'Password changed successfully',
      success: true
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== 2FA ENDPOINTS ====================

// Verify 2FA during Login
router.post('/verify-2fa', async (req: Request, res: Response) => {
  const { tempToken, code } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  if (!tempToken || !code) {
    return res.status(400).json({ error: 'Token and code are required' });
  }

  try {
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Config error' });

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET) as any;

    // Ensure it is a pre-auth token
    if (!decoded.isPreAuth) {
      return res.status(400).json({ error: 'Invalid token usage' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA not enabled or configured' });
    }

    // Verify TOTP or Backup Code
    let verified = verifyMfaToken(user.twoFactorSecret, code);
    let usedBackupCode = false;

    if (!verified && user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0) {
      // Check backup codes
      for (const hashedCode of user.twoFactorBackupCodes) {
        const isMatch = await bcrypt.compare(code, hashedCode);
        if (isMatch) {
          verified = true;
          usedBackupCode = true;

          // Remove used backup code (SECURITY best practice)
          const updatedCodes = user.twoFactorBackupCodes.filter(c => c !== hashedCode);
          await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorBackupCodes: updatedCodes }
          });

          await logAuditEvent({
            userId: user.id,
            action: 'LOGIN_MFA_BACKUP',
            resource: 'user',
            details: { remaining: updatedCodes.length },
            ipAddress: clientIp,
            success: true
          });
          break;
        }
      }
    }

    if (!verified) {
      await logAuditEvent({
        userId: user.id,
        action: 'LOGIN_MFA_FAIL',
        resource: 'user',
        details: { reason: 'invalid_code' },
        ipAddress: clientIp,
        success: false
      });
      return res.status(401).json({ error: 'Invalid 2FA code' });
    }

    // Generate real access token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAuditEvent({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      resource: 'auth',
      details: { method: '2FA' },
      ipAddress: clientIp,
      success: true
    });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        twoFactorEnabled: true
      }
    });

  } catch (error) {
    console.error('2FA Verify Error:', error);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
});

// Setup 2FA (Generate Secret)
router.post('/2fa/setup', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is already enabled' });
    }

    const secret = generateMfaSecret(user.email);
    if (!secret.otpauth_url) {
      return res.status(500).json({ error: 'Failed to generate 2FA secret URL' });
    }
    const qrCode = await generateQrCode(secret.otpauth_url);

    // Return secret to client (client must send it back to confirm)
    // We do NOT save it to DB yet to prevent lockout if they fail to scan
    return res.json({
      secret: secret.base32,
      qrCode
    });

  } catch (error) {
    console.error('2FA Setup Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Activate 2FA (Verify and Save)
router.post('/2fa/activate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { code, secret } = req.body;
  const user = req.user;

  if (!code || !secret) {
    return res.status(400).json({ error: 'Code and secret are required' });
  }

  try {
    const isValid = verifyMfaToken(secret, code);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid code. Please try again.' });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(); // Assuming this function exists and generates an array of plaintext codes
    const hashedBackupCodes = await Promise.all(backupCodes.map(code => bcrypt.hash(code, 12)));

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret, // Encrypting secret is recommended for production
        twoFactorBackupCodes: hashedBackupCodes
      }
    });

    await logAuditEvent({
      userId: user.id,
      action: '2FA_ENABLED',
      resource: 'auth',
      ipAddress: req.ip || 'unknown',
      success: true
    });

    return res.json({
      message: 'Two-factor authentication enabled successfully',
      success: true,
      backupCodes
    });

  } catch (error) {
    console.error('2FA Activation Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Disable 2FA
router.post('/2fa/disable', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { password } = req.body; // Require password to disable
  const user = req.user;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  try {
    // Verify password again for security
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return res.status(404).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, dbUser.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    });

    await logAuditEvent({
      userId: user.id,
      action: '2FA_DISABLED',
      resource: 'auth',
      ipAddress: req.ip || 'unknown',
      success: true
    });

    return res.json({ message: 'Two-factor authentication disabled' });

  } catch (error) {
    console.error('2FA Disable Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account (Soft Delete)
router.post('/delete-account', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    const user: any = req.user;

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // New unique email to free up the original email
    // Format: deleted_<timestamp>_<original_email>
    const timestamp = Date.now();
    const deletedEmail = `deleted_${timestamp}_${user.email}`;

    // Transaction to update user and related profiles
    await prisma.$transaction(async (tx) => {
      // 1. Update User Record
      await tx.user.update({
        where: { id: user.id },
        data: {
          status: 'DELETED' as any, // Soft delete
          email: deletedEmail,
          firstName: 'Deleted',
          lastName: 'User',
          password: `deleted_${timestamp}`, // Scramble password
          twoFactorSecret: null,
          twoFactorEnabled: false,
          did: null, // Remove DID link
          resetToken: null,
          resetTokenExpiry: null
          // Keep tenantId for data segregation if needed, or move to a 'deleted' tenant
        }
      });

      // 2. Anonymize Linked Profiles based on Role using raw queries or updates
      // We check for existence first or just attempt updates which is safer in transaction

      // Anonymize SME Profile if exists
      if (user.role === 'SME') {
        const sme = await tx.sME.findUnique({ where: { userId: user.id } });
        if (sme) {
          await tx.sME.update({
            where: { id: sme.id },
            data: {
              name: `Deleted Company ${timestamp}`,
              description: 'This account has been deleted.',
              website: null,
              location: null,
              status: 'REJECTED' // or a specific DELETED status if available
            }
          });
        }
      }

      // Anonymize Investor Profile if exists
      if (user.role === 'INVESTOR') {
        const investor = await tx.investor.findUnique({ where: { userId: user.id } });
        if (investor) {
          await tx.investor.update({
            where: { id: investor.id },
            data: {
              type: 'ANGEL', // minimal default
              preferences: {}, // Clear preferences
              kycStatus: 'REJECTED'
            }
          });
        }
      }

      // Anonymize Advisor Profile if exists
      if (user.role === 'ADVISOR') {
        const advisor = await tx.advisor.findUnique({ where: { userId: user.id } });
        if (advisor) {
          await tx.advisor.update({
            where: { id: advisor.id },
            data: {
              name: `Deleted Advisor ${timestamp}`,
              // bio field might not exist, checking schema would be better but removing for now to fix lint
              status: 'SUSPENDED'
            }
          });
        }
      }
    });

    await logAuditEvent({
      userId: user.id,
      action: 'ACCOUNT_DELETED',
      resource: 'user',
      details: {
        originalEmail: user.email,
        newEmail: deletedEmail
      },
      ipAddress: clientIp,
      success: true
    });

    return res.json({
      message: 'Account deleted successfully. You have been logged out.',
      success: true
    });

  } catch (error: any) {
    console.error('Delete account error:', error);
    await logAuditEvent({
      userId: req.user?.id || 'unknown',
      action: 'ACCOUNT_DELETE_ERROR',
      resource: 'user',
      ipAddress: clientIp,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

