
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../database';

// Extend Express Request interface locally to avoid conflicts if not globally set yet
export interface AuthenticatedRequest extends Request {
    user?: any;
}

import { hashToken } from '../utils/security';
import { issueTokensAndSetCookies } from '../utils/auth-utils';

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // 1. Try to get Access Token
    const authHeader = req.headers['authorization'];
    let token = (authHeader && authHeader.split(' ')[1])
        || (req.cookies && req.cookies['accessToken'])
        || (req.cookies && req.cookies['token']); // Backward compatibility

    if (!token) {
        // No access token, try refresh token logic immediately?
        // Or wait for next block. Let's try refresh if access token is missing.
        return handleRefresh(req, res, next);
    }

    try {
        if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET missing');

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

        if (decoded.isPreAuth) {
            res.status(401).json({ error: 'Two-factor authentication required', code: '2FA_REQUIRED' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user || user.status === 'DELETED') {
            res.status(401).json({ error: 'User not found or account deleted' });
            return;
        }

        req.user = user;
        next();
    } catch (error: any) {
        // If token expired, try to refresh
        if (error.name === 'TokenExpiredError') {
            return handleRefresh(req, res, next);
        }

        res.status(401).json({ error: 'Invalid token' });
    }
};

/**
 * Helper to handle silent refresh within middleware
 */
async function handleRefresh(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
        res.status(401).json({ error: 'Session expired. Please login again.' });
        return;
    }

    try {
        const tokenHash = hashToken(refreshToken);
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: tokenHash },
            include: { user: true }
        });

        if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
            if (storedToken) await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            res.status(401).json({ error: 'Invalid or expired session' });
            return;
        }

        // Rotate token
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        await issueTokensAndSetCookies(res, storedToken.user, req);

        // Attach user and continue
        req.user = storedToken.user;
        next();
    } catch (err) {
        console.error('Auto-refresh error:', err);
        res.status(401).json({ error: 'Authentication failed during refresh' });
    }
}

export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
