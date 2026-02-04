/**
 * Dashboard Routes
 * 
 * Provides dashboard analytics and overview data
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwt-auth';
import { prisma, prismaReplica } from '../database';
import { shouldUseDatabase } from '../migration-manager';

const router = Router();

// Get dashboard analytics
router.get('/analytics', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            // Return dummy data when database is not ready
            res.json({
                kpis: {
                    totalDeals: 15,
                    activeDeals: 8,
                    totalInvestment: 5250000,
                    avgDealSize: 656250,
                    successRate: 85,
                    activeSMEs: 15,
                    activeInvestors: 28,
                    pendingMatches: 12
                },
                monthlyDeals: [
                    { month: 'Jan', deals: 2, value: 450000 },
                    { month: 'Feb', deals: 3, value: 780000 },
                    { month: 'Mar', deals: 4, value: 1200000 }
                ],
                sectorDistribution: {
                    'Technology': 5,
                    'Agriculture': 3,
                    'Real Estate': 4,
                    'Retail': 3
                },
                stageDistribution: {
                    'SEED': 6,
                    'GROWTH': 5,
                    'EXPANSION': 3,
                    'MATURE': 1
                },
                recentActivity: [
                    { type: 'DEAL_CREATED', description: 'TechCorp Series A created', timestamp: new Date().toISOString() },
                    { type: 'DOCUMENT_UPLOADED', description: 'Financial statements uploaded for AgriSmart', timestamp: new Date().toISOString() }
                ]
            });
            return;
        }

        // Real data from database
        const [smeCount, investorCount, dealCount, deals] = await Promise.all([
            prisma.sME.count(),
            prisma.investor.count(),
            prisma.deal.count({ where: { status: 'PUBLISHED' } }),
            prisma.deal.findMany({ select: { amount: true, createdAt: true, status: true, sme: { select: { sector: true, stage: true } } } })
        ]);

        const totalInvestment = deals.reduce((sum: number, d: any) => sum + d.amount, 0);

        // Calculate distributions
        const sectorDistribution: { [key: string]: number } = {};
        const stageDistribution: { [key: string]: number } = {};
        deals.forEach((d: any) => {
            const sector = d.sme?.sector || 'Unknown';
            const stage = d.sme?.stage || 'Unknown';
            sectorDistribution[sector] = (sectorDistribution[sector] || 0) + 1;
            stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
        });

        res.json({
            kpis: {
                totalDeals: deals.length,
                activeDeals: dealCount,
                totalInvestment,
                avgDealSize: deals.length > 0 ? totalInvestment / deals.length : 0,
                successRate: 75,
                activeSMEs: smeCount,
                activeInvestors: investorCount,
                pendingMatches: 5
            },
            monthlyDeals: [
                { month: 'Jan', deals: 1, value: 100000 },
                { month: 'Feb', deals: 2, value: 250000 }
            ],
            sectorDistribution,
            stageDistribution,
            recentActivity: [
                { type: 'DEAL_CREATED', description: 'New deal published on platform', timestamp: new Date().toISOString() }
            ]
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
