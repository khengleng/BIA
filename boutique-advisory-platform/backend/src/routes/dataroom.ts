import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwt-auth';
import { prisma } from '../database';

const router = Router();

// Get datarooms
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // Group documents by deal to create datarooms
        const documents = await prisma.document.findMany({
            include: {
                sme: true,
                deal: true
            }
        });

        // Mock data for initial implementation if DB is empty
        const mockRooms = [
            {
                id: 'dr-1',
                dealId: 'deal-1',
                name: 'TechCorp Series A Data Room',
                status: 'ACTIVE',
                createdBy: 'Advisor Team',
                accessList: [userId || 'user-1'],
                documents: [
                    {
                        id: 'doc-1',
                        name: 'Financial Statements 2023.pdf',
                        category: 'Financials',
                        size: '2.4 MB',
                        uploadedBy: 'SME Admin',
                        uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                        accessCount: 12,
                        lastAccessedBy: 'Alice Johnson',
                        lastAccessedAt: new Date(Date.now() - 3600000).toISOString()
                    },
                    {
                        id: 'doc-2',
                        name: 'Articles of Incorporation.pdf',
                        category: 'Legal',
                        size: '1.1 MB',
                        uploadedBy: 'Legal Counsel',
                        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
                        accessCount: 5,
                        lastAccessedBy: null,
                        lastAccessedAt: null
                    }
                ],
                activityLog: [
                    { action: 'VIEWED', documentId: 'doc-1', userId: 'investor-1', timestamp: new Date().toISOString() },
                    { action: 'DOWNLOADED', documentId: 'doc-1', userId: 'investor-1', timestamp: new Date(Date.now() - 1800000).toISOString() }
                ],
                createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
            }
        ];

        res.json(mockRooms);
    } catch (error) {
        console.error('Error fetching data rooms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Log document access
router.post('/:dealId/documents/:docId/access', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { action } = req.body;
        // In a real app, we would record this in an ActivityLog table
        res.json({ success: true, action });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log access' });
    }
});

// Upload document to dataroom
router.post('/:dealId/documents', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, category, size } = req.body;
        const newDoc = {
            id: `doc-${Date.now()}`,
            name,
            category,
            size,
            uploadedBy: 'Current User',
            uploadedAt: new Date().toISOString(),
            accessCount: 0,
            lastAccessedBy: null,
            lastAccessedAt: null
        };
        res.json(newDoc);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload document' });
    }
});

export default router;
