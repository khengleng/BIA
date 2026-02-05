/**
 * Security Middleware
 * Enhanced security controls for the Boutique Advisory Platform
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logAuditEvent } from '../utils/security';

// ============================================
// REQUEST ID MIDDLEWARE
// ============================================

/**
 * Add unique request ID for tracing and debugging
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] as string || crypto.randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
};

// ============================================
// SECURITY HEADERS MIDDLEWARE
// ============================================

/**
 * Add additional security headers beyond what Helmet provides
 */
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Prevent caching of sensitive data
    if (req.path.includes('/api/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }

    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');

    next();
};

// ============================================
// IP SECURITY MIDDLEWARE
// ============================================

// Blocked IPs (in production, use Redis or database)
const blockedIps = new Set<string>();
const suspiciousIps = new Map<string, { count: number; lastSeen: Date }>();

/**
 * Block malicious IPs
 */
export const ipSecurityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = getClientIp(req);

    // Check if IP is blocked
    if (blockedIps.has(clientIp)) {
        logAuditEvent({
            userId: 'system',
            action: 'BLOCKED_IP_ACCESS',
            resource: req.path,
            ipAddress: clientIp,
            success: false,
            errorMessage: 'IP is blocked'
        });
        res.status(403).json({ error: 'Access denied' });
        return;
    }

    next();
};

/**
 * Get real client IP considering proxies
 */
export function getClientIp(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        const ips = (typeof forwardedFor === 'string' ? forwardedFor : forwardedFor[0]).split(',');
        return ips[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Block an IP address
 */
export function blockIp(ip: string): void {
    blockedIps.add(ip);
    logAuditEvent({
        userId: 'system',
        action: 'IP_BLOCKED',
        resource: 'security',
        details: { ip },
        ipAddress: ip,
        success: true
    });
}

/**
 * Unblock an IP address
 */
export function unblockIp(ip: string): void {
    blockedIps.delete(ip);
}

// ============================================
// SENSITIVE DATA PROTECTION
// ============================================

/**
 * Mask sensitive data in request body for logging
 */
export function maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = [
        'password', 'currentPassword', 'newPassword', 'confirmPassword',
        'token', 'accessToken', 'refreshToken', 'apiKey', 'secret',
        'creditCard', 'cardNumber', 'cvv', 'cvc', 'ssn', 'nationalId',
        'totpCode', 'backupCode', 'otp'
    ];

    const masked = { ...data };

    for (const field of sensitiveFields) {
        if (masked[field]) {
            masked[field] = '***REDACTED***';
        }
    }

    return masked;
}

// ============================================
// CONTENT VALIDATION MIDDLEWARE
// ============================================

/**
 * Validate content type for POST/PUT requests
 */
export const contentTypeValidation = (req: Request, res: Response, next: NextFunction) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];

        // Skip for multipart (file uploads)
        if (contentType?.includes('multipart/form-data')) {
            return next();
        }

        // Require JSON for API endpoints
        if (req.path.startsWith('/api/') && !contentType?.includes('application/json')) {
            return res.status(415).json({
                error: 'Unsupported Media Type',
                message: 'Content-Type must be application/json'
            });
        }
    }

    next();
};

// ============================================
// SQL INJECTION PREVENTION
// ============================================

const sqlInjectionPatterns = [
    /(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /UNION(\s+)ALL(\s+)SELECT/i,
    /SELECT.*FROM.*WHERE/i,
    /INSERT(\s+)INTO/i,
    /DELETE(\s+)FROM/i,
    /DROP(\s+)TABLE/i,
];

/**
 * Check for SQL injection patterns in input
 */
export function detectSqlInjection(input: string): boolean {
    for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(input)) {
            return true;
        }
    }
    return false;
}

/**
 * SQL injection prevention middleware
 */
export const sqlInjectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: any, path: string): boolean => {
        if (typeof value === 'string' && detectSqlInjection(value)) {
            logAuditEvent({
                userId: (req as any).user?.id || 'anonymous',
                action: 'SQL_INJECTION_ATTEMPT',
                resource: req.path,
                details: { field: path },
                ipAddress: getClientIp(req),
                success: false,
                errorMessage: 'Potential SQL injection detected'
            });
            return true;
        }
        if (typeof value === 'object' && value !== null) {
            for (const [key, val] of Object.entries(value)) {
                if (checkValue(val, `${path}.${key}`)) return true;
            }
        }
        return false;
    };

    if (checkValue(req.body, 'body') ||
        checkValue(req.query, 'query') ||
        checkValue(req.params, 'params')) {
        res.status(400).json({ error: 'Invalid input detected' });
        return;
    }

    next();
};

// ============================================
// XSS PREVENTION
// ============================================

const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
];

/**
 * Check for XSS patterns in input
 */
export function detectXss(input: string): boolean {
    for (const pattern of xssPatterns) {
        if (pattern.test(input)) {
            return true;
        }
    }
    return false;
}

/**
 * XSS prevention middleware
 */
export const xssMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const checkValue = (value: any, path: string): boolean => {
        if (typeof value === 'string' && detectXss(value)) {
            logAuditEvent({
                userId: (req as any).user?.id || 'anonymous',
                action: 'XSS_ATTEMPT',
                resource: req.path,
                details: { field: path },
                ipAddress: getClientIp(req),
                success: false,
                errorMessage: 'Potential XSS detected'
            });
            return true;
        }
        if (typeof value === 'object' && value !== null) {
            for (const [key, val] of Object.entries(value)) {
                if (checkValue(val, `${path}.${key}`)) return true;
            }
        }
        return false;
    };

    if (checkValue(req.body, 'body')) {
        res.status(400).json({ error: 'Invalid input detected' });
        return;
    }

    next();
};

// ============================================
// ROLE-BASED RATE LIMITING
// ============================================

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}

const roleRateLimits: Record<string, RateLimitConfig> = {
    'ADMIN': { windowMs: 60000, maxRequests: 1000 },
    'ADVISOR': { windowMs: 60000, maxRequests: 500 },
    'INVESTOR': { windowMs: 60000, maxRequests: 300 },
    'SME': { windowMs: 60000, maxRequests: 200 },
    'anonymous': { windowMs: 60000, maxRequests: 60 },
};

const roleRequestCounts = new Map<string, { count: number; resetTime: Date }>();

/**
 * Role-based rate limiting middleware
 */
export const roleBasedRateLimiting = (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    const role = user?.role || 'anonymous';
    const userId = user?.id || getClientIp(req);
    const key = `${role}:${userId}`;

    const config = roleRateLimits[role] || roleRateLimits['anonymous'];
    const now = new Date();

    let record = roleRequestCounts.get(key);

    if (!record || record.resetTime < now) {
        record = { count: 0, resetTime: new Date(now.getTime() + config.windowMs) };
    }

    record.count++;
    roleRequestCounts.set(key, record);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', record.resetTime.toISOString());

    if (record.count > config.maxRequests) {
        logAuditEvent({
            userId: userId,
            action: 'RATE_LIMIT_EXCEEDED',
            resource: req.path,
            details: { role, count: record.count, limit: config.maxRequests },
            ipAddress: getClientIp(req),
            success: false
        });

        res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((record.resetTime.getTime() - now.getTime()) / 1000)
        });
        return;
    }

    next();
};

export default {
    requestIdMiddleware,
    securityHeadersMiddleware,
    ipSecurityMiddleware,
    contentTypeValidation,
    sqlInjectionMiddleware,
    xssMiddleware,
    roleBasedRateLimiting,
    getClientIp,
    blockIp,
    unblockIp,
    maskSensitiveData,
    detectSqlInjection,
    detectXss
};
