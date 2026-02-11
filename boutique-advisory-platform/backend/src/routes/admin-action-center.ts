import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { prisma } from '../database';

const router = Router();

// GET /api/admin/action-center/stats
router.get('/stats', authorize('admin.dashboard_view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const tenantId = req.user?.tenantId || 'default';

        const [kycPending, disputesOpen, disputesInProgress] = await Promise.all([
            // KYC Requests: PENDING Investors
            prisma.investor.count({
                where: {
                    tenantId,
                    kycStatus: 'PENDING'
                }
            }),
            // Open Disputes
            prisma.dispute.count({
                where: {
                    tenantId,
                    status: 'OPEN'
                }
            }),
            // In Progress Disputes (Manual Mediation)
            prisma.dispute.count({
                where: {
                    tenantId,
                    status: 'IN_PROGRESS'
                }
            })
        ]);

        return res.json({
            kycRequests: kycPending,
            dealDisputes: disputesOpen + disputesInProgress,
            disputeDetails: {
                open: disputesOpen,
                inProgress: disputesInProgress
            }
        });
    } catch (error) {
        console.error('Error fetching admin action center stats:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/action-center/kyc-requests
router.get('/kyc-requests', authorize('admin.user_manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const tenantId = req.user?.tenantId || 'default';

        const requests = await prisma.investor.findMany({
            where: {
                tenantId,
                kycStatus: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
            take: 20
        });

        return res.json(requests);
    } catch (error) {
        console.error('Error fetching KYC requests:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/action-center/disputes
router.get('/disputes', authorize('admin.user_manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const tenantId = req.user?.tenantId || 'default';

        const disputes = await prisma.dispute.findMany({
            where: {
                tenantId,
                status: {
                    in: ['OPEN', 'IN_PROGRESS']
                }
            },
            include: {
                initiator: {
                    select: { firstName: true, lastName: true, email: true }
                },
                deal: {
                    select: { title: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return res.json(disputes);
    } catch (error) {
        console.error('Error fetching disputes:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
