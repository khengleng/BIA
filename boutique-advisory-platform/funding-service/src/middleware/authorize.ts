import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from './jwt-auth';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        tenantId: string;
        email: string;
        role: string;
        did?: string;
    };
    tenantId?: string;
    permissionContext?: Record<string, unknown>;
}

export function authorize(_permission: string) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        return authenticateToken(req, res, next);
    };
}

export function authorizeAny(permissions: string[]) {
    return authorize(permissions[0] || 'authenticated');
}

export function getAuditLogs() {
    return [];
}

export function clearAuditLogs(): void {
    return;
}
