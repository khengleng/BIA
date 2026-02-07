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
                const [users, smes, investors, deals, revenue] = await Promise.all([
                    prisma.user.count({ where: { tenantId } }),
                    prisma.sME.count({ where: { tenantId } }),
                    prisma.investor.count({ where: { tenantId } }),
                    prisma.deal.count({ where: { tenantId } }),
                    prisma.booking.aggregate({
                        where: { status: 'CONFIRMED' },
                        _sum: { amount: true }
                    })
                ]);

                stats = {
                    totalUsers: users,
                    totalSMEs: smes,
                    totalInvestors: investors,
                    activeDeals: deals,
                    platformRevenue: revenue._sum.amount || 0
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

export default router;
