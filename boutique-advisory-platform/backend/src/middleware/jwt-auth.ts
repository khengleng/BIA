
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../database';

// Extend Express Request interface locally to avoid conflicts if not globally set yet
export interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];

    // Check authorization header
    const token = (authHeader && authHeader.split(' ')[1])
        || (req.cookies && req.cookies['token'])
        || (req.signedCookies && req.signedCookies['token']);

    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    try {
        if (!process.env.JWT_SECRET) {
            console.error('FATAL: JWT_SECRET environment variable is not set');
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

        // Find user in database
        if (decoded.isPreAuth) {
            res.status(401).json({ error: 'Two-factor authentication required', code: '2FA_REQUIRED' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user || user.status === 'DELETED') {
            res.status(401).json({ error: 'User not found or account deleted' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
};

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
