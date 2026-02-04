/**
 * Security Utilities
 * Centralized security functions for the Boutique Advisory Platform
 */

import crypto from 'crypto';
import { prisma } from '../database';

// ============================================
// PASSWORD SECURITY
// ============================================

/**
 * Generate a cryptographically secure random password
 * Used for initial setup when no password is provided
 */
export function generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    let password = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        password += charset[randomBytes[i] % charset.length];
    }
    return password;
}

/**
 * Validate password strength
 * Returns null if valid, error message if invalid
 */
export function validatePasswordStrength(password: string): string | null {
    if (password.length < 12) {
        return 'Password must be at least 12 characters long';
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return 'Password must contain at least one special character';
    }
    return null;
}

// ============================================
// TOKEN GENERATION
// ============================================

/**
 * Generate a secure token for password reset, email verification, etc.
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a time-limited token with expiry
 */
export function generateTimedToken(): { token: string; expiresAt: Date } {
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    return { token, expiresAt };
}

/**
 * Hash a token for storage (don't store raw tokens)
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// ============================================
// CSRF PROTECTION
// ============================================

const csrfTokens = new Map<string, { token: string; expiresAt: Date }>();

/**
 * Generate a CSRF token for a session
 */
export function generateCsrfToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    csrfTokens.set(sessionId, { token, expiresAt });

    // Clean up expired tokens periodically
    cleanupExpiredCsrfTokens();

    return token;
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
    const stored = csrfTokens.get(sessionId);
    if (!stored) return false;
    if (stored.expiresAt < new Date()) {
        csrfTokens.delete(sessionId);
        return false;
    }
    return crypto.timingSafeEqual(
        Buffer.from(stored.token),
        Buffer.from(token)
    );
}

function cleanupExpiredCsrfTokens(): void {
    const now = new Date();
    for (const [sessionId, data] of csrfTokens.entries()) {
        if (data.expiresAt < now) {
            csrfTokens.delete(sessionId);
        }
    }
}

// ============================================
// AUDIT LOGGING
// ============================================

export interface AuditLogEntry {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
}

/**
 * Log a security-relevant action
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
    const logEntry = {
        timestamp: new Date().toISOString(),
        ...entry,
        // Sanitize sensitive data from details
        details: entry.details ? sanitizeAuditDetails(entry.details) : undefined
    };

    // Log to console in structured format
    console.log(JSON.stringify({
        type: 'AUDIT_LOG',
        ...logEntry
    }));

    // In production, you would also:
    // 1. Write to a secure audit log database table
    // 2. Send to a SIEM system (Splunk, ELK, etc.)
    // 3. Store in immutable storage (AWS S3 with object lock)
}

/**
 * Remove sensitive data from audit log details
 */
function sanitizeAuditDetails(details: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn', 'cvv'];
    const sanitized = { ...details };

    for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeAuditDetails(sanitized[key]);
        }
    }

    return sanitized;
}

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const trimmed = email.trim().toLowerCase();

    if (!emailRegex.test(trimmed)) {
        return null;
    }

    return trimmed;
}

// ============================================
// RATE LIMITING HELPERS
// ============================================

const failedAttempts = new Map<string, { count: number; lockedUntil?: Date }>();

/**
 * Check if an identifier (IP, email) is locked out
 */
export function isLockedOut(identifier: string): boolean {
    const record = failedAttempts.get(identifier);
    if (!record) return false;

    if (record.lockedUntil && record.lockedUntil > new Date()) {
        return true;
    }

    if (record.lockedUntil && record.lockedUntil <= new Date()) {
        failedAttempts.delete(identifier);
    }

    return false;
}

/**
 * Record a failed authentication attempt
 */
export function recordFailedAttempt(identifier: string): void {
    if (process.env.NODE_ENV === 'development') return; // Disable lockout in dev

    const record = failedAttempts.get(identifier) || { count: 0 };
    record.count++;

    // Lock out after 5 failed attempts
    if (record.count >= 5) {
        record.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lockout
    }

    failedAttempts.set(identifier, record);
}

/**
 * Clear failed attempts after successful login
 */
export function clearFailedAttempts(identifier: string): void {
    failedAttempts.delete(identifier);
}

// ============================================
// SECURE HEADERS
// ============================================

/**
 * Get security headers for responses
 */
export function getSecurityHeaders(): Record<string, string> {
    return {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    };
}
