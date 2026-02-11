import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwt-auth';
import { prisma } from '../database';

const router = Router();

/**
 * Get role-based dashboard statistics
 * GET /api/dashboard/stats
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const tenantId = req.user?.tenantId || 'default';

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let stats: any = {};

        switch (role) {
            case 'SME': {
                const sme = await prisma.sME.findUnique({ where: { userId } });
                if (sme) {
                    const [dealsCount, activeBookings, documentCount] = await Promise.all([
                        prisma.deal.count({ where: { smeId: sme.id } }),
                        prisma.booking.count({ where: { userId, status: 'CONFIRMED' } }),
                        prisma.document.count({ where: { smeId: sme.id } })
                    ]);

                    const deals = await prisma.deal.findMany({ where: { smeId: sme.id } });
                    const totalFunding = deals.reduce((acc, deal) => acc + deal.amount, 0);

                    stats = {
                        totalDeals: dealsCount,
                        activeBookings,
                        documents: documentCount,
                        fundingGoal: totalFunding,
                        profileCompleteness: 75, // Placeholder for logic
                        matchCount: await prisma.match.count({ where: { smeId: sme.id } })
                    };
                }
                break;
            }

            case 'INVESTOR': {
                const investor = await prisma.investor.findUnique({ where: { userId } });
                if (investor) {
                    const [matchCount, investmentCount, activeOffers] = await Promise.all([
                        prisma.match.count({ where: { investorId: investor.id } }),
                        prisma.dealInvestor.count({ where: { investorId: investor.id, status: 'COMPLETED' } }),
                        prisma.dealInvestor.count({ where: { investorId: investor.id, status: 'PENDING' } })
                    ]);

                    stats = {
                        totalMatches: matchCount,
                        activeInvestments: investmentCount,
                        pendingOffers: activeOffers,
                        portfolioValue: 0, // Would need more complex calculation
                        avgMatchScore: 85
                    };
                }
                break;
            }

            case 'ADVISOR': {
                const advisor = await prisma.advisor.findUnique({ where: { userId } });
                if (advisor) {
                    const [totalBookings, activeClients, pendingCerts] = await Promise.all([
                        prisma.booking.count({ where: { advisorId: advisor.id } }),
                        prisma.booking.groupBy({
                            by: ['userId'],
                            where: { advisorId: advisor.id }
                        }).then(groups => groups.length),
                        prisma.certification.count({ where: { advisorId: advisor.id, status: 'PENDING' } })
                    ]);

                    const completedPaidBookings = await prisma.booking.findMany({
                        where: { advisorId: advisor.id, status: 'COMPLETED', amount: { not: null } }
                    });
                    const totalEarnings = completedPaidBookings.reduce((acc, b) => acc + (b.amount || 0), 0);

                    stats = {
                        bookings: totalBookings,
                        clients: activeClients,
                        pendingCertifications: pendingCerts,
                        earnings: totalEarnings,
                        rating: 4.9
                    };
                }
                break;
            }

            case 'ADMIN':
            case 'SUPER_ADMIN': {
                const [users, smes, investors, deals, revenue, deletedUsers] = await Promise.all([
                    prisma.user.count({ where: { tenantId } }),
                    prisma.sME.count({ where: { tenantId } }),
                    prisma.investor.count({ where: { tenantId } }),
                    prisma.deal.count({ where: { tenantId } }),
                    prisma.booking.aggregate({
                        where: { status: 'CONFIRMED' },
                        _sum: { amount: true }
                    }),
                    prisma.user.count({ where: { status: 'DELETED' as any, tenantId } })
                ]);

                stats = {
                    totalUsers: users,
                    totalSMEs: smes,
                    totalInvestors: investors,
                    activeDeals: deals,
                    platformRevenue: revenue._sum.amount || 0,
                    deletedUsers: deletedUsers
                };
                break;
            }
        }

        return res.json({ role, stats });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

/**
 * Get platform analytics data
 * GET /api/dashboard/analytics
 */
router.get('/analytics', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const tenantId = req.user?.tenantId || 'default';

        // 1. Fetch KPIs
        const [
            totalDeals,
            activeDeals,
            totalInvestmentAgg,
            activeSMEs,
            activeInvestors,
            pendingMatches
        ] = await Promise.all([
            prisma.deal.count({ where: { tenantId } }),
            prisma.deal.count({
                where: {
                    tenantId,
                    status: { in: ['PUBLISHED', 'NEGOTIATION', 'FUNDED'] }
                }
            }),
            prisma.deal.aggregate({
                where: { tenantId },
                _sum: { amount: true }
            }),
            prisma.sME.count({ where: { tenantId, status: 'CERTIFIED' } }),
            prisma.investor.count({ where: { tenantId, kycStatus: 'VERIFIED' } }),
            prisma.match.count({ where: { tenantId, status: 'PENDING' } })
        ]);

        // Fix Investor count: Investor model doesn't have status, but User does.
        // For now, simple count is fine.

        const totalInvestment = totalInvestmentAgg._sum.amount || 0;
        const avgDealSize = totalDeals > 0 ? totalInvestment / totalDeals : 0;

        // Mock success rate for now or calculate based on CLOSED deals
        const closedDeals = await prisma.deal.count({
            where: { tenantId, status: 'CLOSED' }
        });
        const successRate = totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 0;

        const kpis = {
            totalDeals,
            activeDeals,
            totalInvestment,
            avgDealSize,
            successRate,
            activeSMEs,
            activeInvestors,
            pendingMatches
        };

        // 2. Fetch Monthly Deals (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const deals = await prisma.deal.findMany({
            where: {
                tenantId,
                createdAt: { gte: sixMonthsAgo }
            },
            select: {
                createdAt: true,
                amount: true
            },
            orderBy: { createdAt: 'asc' }
        });

        const monthlyDealsMap = new Map<string, { deals: number, value: number }>();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        deals.forEach(deal => {
            const date = new Date(deal.createdAt);
            const monthKey = monthNames[date.getMonth()];

            const current = monthlyDealsMap.get(monthKey) || { deals: 0, value: 0 };
            monthlyDealsMap.set(monthKey, {
                deals: current.deals + 1,
                value: current.value + deal.amount
            });
        });

        const monthlyDeals = Array.from(monthlyDealsMap.entries()).map(([month, data]) => ({
            month,
            deals: data.deals,
            value: data.value
        }));

        // 3. Sector Distribution
        const sectors = await prisma.sME.groupBy({
            by: ['sector'],
            where: { tenantId },
            _count: { id: true }
        });

        const sectorDistribution: { [key: string]: number } = {};
        sectors.forEach(s => {
            sectorDistribution[s.sector] = s._count.id;
        });

        // 4. Stage Distribution
        const stages = await prisma.deal.groupBy({
            by: ['status'],
            where: { tenantId },
            _count: { id: true }
        });

        const stageDistribution: { [key: string]: number } = {};
        stages.forEach(s => {
            stageDistribution[s.status] = s._count.id;
        });

        // 5. Recent Activity (Mocked from Deals for now)
        const recentDeals = await prisma.deal.findMany({
            where: { tenantId },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { sme: { select: { name: true } } }
        });

        const recentActivity = recentDeals.map(deal => ({
            type: 'DEAL_CREATED',
            description: `New deal posted by ${deal.sme.name}: ${deal.title}`,
            timestamp: deal.createdAt.toISOString()
        }));

        res.json({
            kpis,
            monthlyDeals,
            sectorDistribution,
            stageDistribution,
            recentActivity
        });

    } catch (error) {
        console.error('Analytics dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
});

export default router;
