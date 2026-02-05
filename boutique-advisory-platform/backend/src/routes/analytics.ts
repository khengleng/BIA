import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwt-auth';
import { prisma } from '../database';

const router = Router();

// Get financial performance stats
router.get('/performance', async (req: AuthenticatedRequest, res: Response) => {
    try {
        // High-end mock analytics until we have deep transaction history
        const performanceData = {
            monthlyReturns: [
                { month: 'Jan', value: 4500, return: 5.2 },
                { month: 'Feb', value: 5200, return: 4.8 },
                { month: 'Mar', value: 4800, return: -1.2 },
                { month: 'Apr', value: 6100, return: 8.5 },
                { month: 'May', value: 5900, return: 3.1 },
                { month: 'Jun', value: 7200, return: 6.4 }
            ],
            sectorDistribution: [
                { name: 'Technology', value: 45 },
                { name: 'Fintech', value: 25 },
                { name: 'Healthcare', value: 15 },
                { name: 'E-commerce', value: 10 },
                { name: 'Other', value: 5 }
            ],
            pipelineValue: 12500000,
            activeDeals: 12,
            successRate: 84.5
        };

        res.json(performanceData);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Get platform-wide stats for institutional display
router.get('/platform-overview', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const stats = await prisma.$transaction([
            prisma.user.count(),
            prisma.sME.count(),
            prisma.investor.count(),
            prisma.deal.count(),
            prisma.deal.aggregate({ _sum: { amount: true } })
        ]);

        res.json({
            totalUsers: stats[0],
            totalSMEs: stats[1],
            totalInvestors: stats[2],
            totalDeals: stats[3],
            totalVolume: stats[4]._sum.amount || 0,
            avgDealSize: (stats[4]._sum.amount || 0) / (stats[3] || 1)
        });
    } catch (error) {
        console.error('Error fetching platform overview:', error);
        res.status(500).json({ error: 'Failed to fetch platform overview' });
    }
});

export default router;
