import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { prisma } from '../database';

const router = Router();

// ==================== User Management ====================

// List all users (System-wide)
router.get('/users', authorize('admin.user_manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                sme: { select: { id: true, name: true, status: true } },
                investor: { select: { id: true, name: true, kycStatus: true } },
                advisor: { select: { id: true, name: true, status: true } },
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user status
router.put('/users/:userId/status', authorize('admin.user_manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // ACTIVE, INACTIVE, SUSPENDED

        const user = await prisma.user.update({
            where: { id: userId },
            data: { status }
        });

        return res.json({ message: `User status updated to ${status}`, user });
    } catch (error) {
        console.error('Error updating user status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user role
router.put('/users/:userId/role', authorize('admin.user_manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        return res.json({ message: `User role updated to ${role}`, user });
    } catch (error) {
        console.error('Error updating user role:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== Platform Overview ====================

router.get('/stats', authorize('admin.read'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const [
            userCount,
            smeCount,
            investorCount,
            advisorCount,
            dealCount,
            totalDealAmount
        ] = await Promise.all([
            prisma.user.count(),
            prisma.sME.count(),
            prisma.investor.count(),
            prisma.advisor.count(),
            prisma.deal.count(),
            prisma.deal.aggregate({ _sum: { amount: true } })
        ]);

        return res.json({
            stats: {
                users: userCount,
                smes: smeCount,
                investors: investorCount,
                advisors: advisorCount,
                deals: dealCount,
                totalVolume: totalDealAmount._sum.amount || 0
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
