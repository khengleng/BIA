import { Router, Response } from 'express';
import { AuthenticatedRequest, getAuditLogs } from '../middleware/authorize';

const router = Router();

// Get audit logs (Admins only)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can access audit logs' });
        }

        const logs = getAuditLogs();
        return res.json({ logs });
    } catch (error) {
        console.error('Audit log error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
