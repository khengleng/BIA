import { Response, Request, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../database';
import { generateSecureToken, hashToken } from './security';

export const COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours default, usually overridden
};

/**
 * Helper to issue Access & Refresh tokens and set cookies
 */
export async function issueTokensAndSetCookies(res: Response, user: any, req: Request) {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');

    // 1. Access Token (Short-lived: 15m)
    const accessToken = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    // 2. Refresh Token (Long-lived: 7d)
    const refreshToken = generateSecureToken(64);
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Store hash in DB
    await prisma.refreshToken.create({
        data: {
            token: refreshTokenHash,
            userId: user.id,
            expiresAt,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'] || 'unknown'
        }
    });

    // 3. Set Cookies
    // Access Token
    res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Refresh Token
    res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        path: '/api', // Scope to all API calls for middleware auto-refresh
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Set 'token' cookie for backward compatibility with existing middleware/FE
    res.cookie('token', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000
    });
}

/**
 * Resolves the tenant ID from the request (headers or domain)
 */
export function getTenantId(req: Request): string {
    // 1. Check for custom header (e.g., from a mobile app or specific client)
    const headerTenantId = req.headers['x-tenant-id'];
    if (headerTenantId && typeof headerTenantId === 'string') {
        return headerTenantId;
    }

    // 2. Check hostname (multi-tenant subdomain pattern)
    const host = req.headers.host || '';
    // Example: tenant1.ambobia.com -> tenant1
    if (host.includes('.') &&
        !host.includes('localhost') &&
        !host.includes('127.0.0.1') &&
        !host.includes('railway.app') && // Ignore railway default domains
        !host.includes('cambobia.com')) { // Ignore main domain
        const parts = host.split('.');
        if (parts.length >= 3) {
            return parts[0];
        }
    }

    // 3. Fallback to default
    return 'default';
}
