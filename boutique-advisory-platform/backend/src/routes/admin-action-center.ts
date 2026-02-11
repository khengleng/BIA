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

// Approve KYC
import { sendNotification } from '../services/notification.service';

router.post('/kyc/:id/approve', authorize('admin.user_manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const investorId = req.params.id;
        const investor = await prisma.investor.update({
            where: { id: investorId },
            data: { kycStatus: 'APPROVED' },
            include: { user: true }
        });

        await sendNotification(
            investor.userId,
            'KYC Approved',
            'Your investor profile has been verified. You can now access deal details.',
            'SUCCESS',
            '/investor/dashboard'
        );

        return res.json({ message: 'KYC Approved', investor });
    } catch (error) {
        console.error('Error approving KYC:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Reject KYC
router.post('/kyc/:id/reject', authorize('admin.user_manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const investorId = req.params.id;
        const { reason } = req.body;

        const investor = await prisma.investor.update({
            where: { id: investorId },
            data: { kycStatus: 'REJECTED' },
            include: { user: true }
        });

        await sendNotification(
            investor.userId,
            'KYC Rejected',
            `Your verification was rejected: ${reason || 'Incomplete information'}. Please update your profile.`,
            'alert' as any, // Using 'alert' or 'SYSTEM' based on enum availability, fallback to cast if needed
            '/settings/profile'
        );

        return res.json({ message: 'KYC Rejected', investor });
    } catch (error) {
        console.error('Error rejecting KYC:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
