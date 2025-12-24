/**
 * Dashboard Routes
 * 
 * Provides dashboard analytics and overview data
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../database';
import { shouldUseDatabase } from '../migration-manager';

const router = Router();

// Get dashboard analytics
router.get('/analytics', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            // Return sample data when database is not ready
            res.json({
                overview: {
                    totalSMEs: 15,
                    totalInvestors: 28,
                    activeDeals: 8,
                    totalFunding: 5250000
                },
                recentActivity: [
                    { type: 'deal', message: 'New deal created: TechCorp Series A', time: '2 hours ago' },
                    { type: 'investor', message: 'New investor joined the platform', time: '5 hours ago' },
                    { type: 'sme', message: 'SME profile updated: AgriSmart', time: '1 day ago' }
                ],
                trends: {
                    fundingGrowth: 25,
                    newSMEs: 5,
                    newInvestors: 8,
                    dealsClosed: 3
                }
            });
            return;
        }

        // Get real data from database
        const [smeCount, investorCount, dealCount] = await Promise.all([
            prisma.sME.count(),
            prisma.investor.count(),
            prisma.deal.count({ where: { status: 'PUBLISHED' } })
        ]);

        const deals = await prisma.deal.findMany({
            where: { status: 'PUBLISHED' },
            select: { amount: true }
        });

        const totalFunding = deals.reduce((sum, d) => sum + d.amount, 0);

        res.json({
            overview: {
                totalSMEs: smeCount,
                totalInvestors: investorCount,
                activeDeals: dealCount,
                totalFunding
            },
            recentActivity: [
                { type: 'deal', message: 'Platform ready for investments', time: 'Just now' },
                { type: 'system', message: 'Database migration completed', time: '1 hour ago' }
            ],
            trends: {
                fundingGrowth: 0,
                newSMEs: smeCount,
                newInvestors: investorCount,
                dealsClosed: 0
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Get user-specific dashboard data
router.get('/my', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;

        // Return role-specific dashboard data
        let dashboardData: any = {
            role,
            summary: {}
        };

        if (role === 'INVESTOR') {
            dashboardData.summary = {
                portfolioValue: 0,
                activeInvestments: 0,
                pendingDeals: 0,
                returns: 0
            };
        } else if (role === 'SME') {
            dashboardData.summary = {
                fundingRaised: 0,
                fundingGoal: 0,
                investorConnections: 0,
                dealStatus: 'Not Started'
            };
        } else if (role === 'ADMIN' || role === 'ADVISOR') {
            dashboardData.summary = {
                managedSMEs: 0,
                managedDeals: 0,
                pendingApprovals: 0,
                platformHealth: 'Good'
            };
        }

        res.json(dashboardData);
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});

export default router;
