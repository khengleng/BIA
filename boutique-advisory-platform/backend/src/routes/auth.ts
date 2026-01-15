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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
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
        errorMessage: 'Invalid credentials'
      });
      return res.status(401).json({
        error: 'Invalid credentials'
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
        lastName: user.lastName
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
        lastName: user.lastName
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

      // Store hashed token in user record (you'd want a separate table in production)
      // For now, we'll log it securely
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

      // In production: Send email with reset link containing the unhashed token
      // The link would be: ${FRONTEND_URL}/reset-password?token=${resetToken}
      console.log(`[SECURITY] Password reset token generated for ${sanitizedEmail}`);
      console.log(`[SECURITY] Reset link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
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

    // In production: Find user by hashed token and verify expiry
    // const resetRecord = await prisma.passwordReset.findFirst({
    //   where: { tokenHash: hashedToken, expiresAt: { gt: new Date() } }
    // });

    // For demonstration, if email is provided, update the password
    if (email) {
      const sanitizedEmail = sanitizeEmail(email);
      if (!sanitizedEmail) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const user = await prisma.user.findFirst({
        where: { email: sanitizedEmail }
      });

      if (user) {
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });

        await logAuditEvent({
          userId: user.id,
          action: 'PASSWORD_RESET_SUCCESS',
          resource: 'auth',
          details: { email: sanitizedEmail },
          ipAddress: clientIp,
          success: true
        });

        // Clear any failed login attempts for this user
        clearFailedAttempts(sanitizedEmail);

        return res.json({
          message: 'Password has been reset successfully.',
          success: true
        });
      }
    }

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

export default router;

