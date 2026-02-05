import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwt-auth';

const router = Router();

// Get calendar events
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const events = [
            {
                id: '1',
                title: 'TechCorp Due Diligence',
                start: new Date().toISOString(),
                end: new Date(Date.now() + 3600000).toISOString(),
                type: 'DUE_DILIGENCE',
                location: 'Online'
            },
            {
                id: '2',
                title: 'Investment Review Meeting',
                start: new Date(Date.now() + 86400000).toISOString(),
                end: new Date(Date.now() + 86400000 * 1.1).toISOString(),
                type: 'MEETING',
                location: 'Conference Room A'
            }
        ];

        res.json({ events });
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
