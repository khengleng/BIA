/**
 * Syndicate Routes - Investor Pooling (like AngelList)
 * 
 * Uses Prisma ORM for database persistence
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { prisma, prismaReplica } from '../database';
import { shouldUseDatabase } from '../migration-manager';
import { SyndicateStatus } from '@prisma/client';

const router = Router();

// Helper to calculate raised amount from members
async function calculateRaisedAmount(syndicateId: string): Promise<number> {
    const result = await prismaReplica.syndicateMember.aggregate({
        where: {
            syndicateId,
            status: 'APPROVED'
        },
        _sum: { amount: true }
    });
    return result._sum.amount || 0;
}

// Get all syndicates
router.get('/', authorize('syndicate.list'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            // Fallback to in-memory for backwards compatibility
            res.json([]);
            return;
        }

        const { status, leadInvestorId } = req.query;

        const syndicates = await prismaReplica.syndicate.findMany({
            where: {
                ...(status ? { status: status as SyndicateStatus } : {}),
                ...(leadInvestorId ? { leadInvestorId: leadInvestorId as string } : {})
            },
            include: {
                leadInvestor: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                },
                deal: {
                    select: {
                        id: true,
                        title: true,
                        amount: true
                    }
                },
                members: {
                    where: { status: 'APPROVED' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform for frontend
        const result = syndicates.map(s => ({
            ...s,
            raisedAmount: s.members.reduce((sum, m) => sum + m.amount, 0),
            memberCount: s.members.length,
            progress: Math.round((s.members.reduce((sum, m) => sum + m.amount, 0) / s.targetAmount) * 100)
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching syndicates:', error);
        res.status(500).json({ error: 'Failed to fetch syndicates' });
    }
});

// Get syndicate by ID
router.get('/:id', authorize('syndicate.read'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.status(404).json({ error: 'Syndicate not found' });
            return;
        }

        const syndicate = await prismaReplica.syndicate.findUnique({
            where: { id: req.params.id },
            include: {
                leadInvestor: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                },
                deal: {
                    select: {
                        id: true,
                        title: true,
                        amount: true,
                        sme: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                members: {
                    include: {
                        investor: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    }
                }
            }
        });

        if (!syndicate) {
            res.status(404).json({ error: 'Syndicate not found' });
            return;
        }

        const raisedAmount = syndicate.members
            .filter(m => m.status === 'APPROVED')
            .reduce((sum, m) => sum + m.amount, 0);

        res.json({
            ...syndicate,
            raisedAmount,
            memberCount: syndicate.members.length,
            progress: Math.round((raisedAmount / syndicate.targetAmount) * 100)
        });
    } catch (error) {
        console.error('Error fetching syndicate:', error);
        res.status(500).json({ error: 'Failed to fetch syndicate' });
    }
});

// Create syndicate (Lead investor only)
router.post('/', authorize('syndicate.create'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.status(503).json({ error: 'Database not available' });
            return;
        }

        const {
            name,
            description,
            targetAmount,
            minInvestment,
            maxInvestment,
            managementFee,
            carryFee,
            dealId,
            closingDate
        } = req.body;

        // Get investor ID for the current user
        let investor = await prisma.investor.findFirst({
            where: { userId: req.user?.id }
        });

        // Auto-onboard Admin as Investor if missing, to allow them to act as Lead Investor
        if (!investor && (req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN')) {
            const userDetail = await prisma.user.findUnique({ where: { id: req.user?.id } });
            if (userDetail) {
                investor = await prisma.investor.create({
                    data: {
                        userId: userDetail.id,
                        tenantId: userDetail.tenantId,
                        name: `${userDetail.firstName} ${userDetail.lastName}`,
                        type: 'INSTITUTIONAL',
                        kycStatus: 'VERIFIED'
                    }
                });
            }
        }

        if (!investor) {
            res.status(403).json({ error: 'Only investors can create syndicates' });
            return;
        }

        const syndicate = await prisma.syndicate.create({
            data: {
                tenantId: 'default',
                name,
                description,
                leadInvestorId: investor.id,
                targetAmount,
                minInvestment: minInvestment || 1000,
                maxInvestment,
                managementFee: managementFee || 2.0,
                carryFee: carryFee || 20.0,
                dealId,
                closingDate: closingDate ? new Date(closingDate) : null,
                status: 'FORMING'
            },
            include: {
                leadInvestor: {
                    select: { id: true, name: true, type: true }
                },
                deal: {
                    select: { id: true, title: true, amount: true }
                }
            }
        });

        res.status(201).json({
            ...syndicate,
            raisedAmount: 0,
            memberCount: 0,
            progress: 0
        });
    } catch (error) {
        console.error('Error creating syndicate:', error);
        res.status(500).json({ error: 'Failed to create syndicate' });
    }
});

// Join syndicate
router.post('/:id/join', authorize('syndicate.join'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.status(503).json({ error: 'Database not available' });
            return;
        }

        const { amount } = req.body;

        // Get investor ID for the current user
        let investor = await prisma.investor.findFirst({
            where: { userId: req.user?.id }
        });

        // Auto-onboard Admin as Investor if missing, to allow them to act as Lead Investor
        if (!investor && (req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN')) {
            const userDetail = await prisma.user.findUnique({ where: { id: req.user?.id } });
            if (userDetail) {
                investor = await prisma.investor.create({
                    data: {
                        userId: userDetail.id,
                        tenantId: userDetail.tenantId,
                        name: `${userDetail.firstName} ${userDetail.lastName}`,
                        type: 'INSTITUTIONAL',
                        kycStatus: 'VERIFIED'
                    }
                });
            }
        }

        if (!investor) {
            res.status(403).json({ error: 'Only investors can create syndicates' });
            return;
        }

        const syndicate = await prisma.syndicate.findUnique({
            where: { id: req.params.id }
        });

        if (!syndicate) {
            res.status(404).json({ error: 'Syndicate not found' });
            return;
        }

        if (syndicate.status !== 'OPEN' && syndicate.status !== 'FORMING') {
            res.status(400).json({ error: 'Syndicate is not accepting new members' });
            return;
        }

        if (amount < syndicate.minInvestment) {
            res.status(400).json({ error: `Minimum investment is $${syndicate.minInvestment}` });
            return;
        }

        if (syndicate.maxInvestment && amount > syndicate.maxInvestment) {
            res.status(400).json({ error: `Maximum investment is $${syndicate.maxInvestment}` });
            return;
        }

        // Check if already a member
        const existingMember = await prisma.syndicateMember.findUnique({
            where: {
                syndicateId_investorId: {
                    syndicateId: req.params.id,
                    investorId: investor.id
                }
            }
        });

        if (existingMember) {
            res.status(400).json({ error: 'Already a member of this syndicate' });
            return;
        }

        const member = await prisma.syndicateMember.create({
            data: {
                syndicateId: req.params.id,
                investorId: investor.id,
                amount,
                status: 'PENDING'
            },
            include: {
                investor: {
                    select: { id: true, name: true, type: true }
                }
            }
        });

        res.status(201).json({
            message: 'Join request submitted',
            member
        });
    } catch (error) {
        console.error('Error joining syndicate:', error);
        res.status(500).json({ error: 'Failed to join syndicate' });
    }
});

// Approve member (Lead investor only)
router.post('/:id/members/:memberId/approve', authorize('syndicate.manage'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.status(503).json({ error: 'Database not available' });
            return;
        }

        const syndicate = await prisma.syndicate.findUnique({
            where: { id: req.params.id },
            include: { leadInvestor: true }
        });

        if (!syndicate) {
            res.status(404).json({ error: 'Syndicate not found' });
            return;
        }

        // Check if current user is lead investor or admin
        const investor = await prisma.investor.findFirst({
            where: { userId: req.user?.id }
        });

        const isLeadInvestor = investor && investor.id === syndicate.leadInvestorId;
        const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

        if (!isLeadInvestor && !isAdmin) {
            res.status(403).json({ error: 'Only lead investor can approve members' });
            return;
        }

        const member = await prisma.syndicateMember.update({
            where: { id: req.params.memberId },
            data: { status: 'APPROVED' },
            include: {
                investor: {
                    select: { id: true, name: true }
                }
            }
        });

        // Check if syndicate is now fully funded
        // We calculate sum manually here using the primary connection to be safe against replication lag
        const result = await prisma.syndicateMember.aggregate({
            where: {
                syndicateId: req.params.id,
                status: 'APPROVED'
            },
            _sum: { amount: true }
        });
        const raisedAmount = result._sum.amount || 0;

        if (raisedAmount >= syndicate.targetAmount) {
            await prisma.syndicate.update({
                where: { id: req.params.id },
                data: { status: 'FUNDED' }
            });
        }

        res.json({ message: 'Member approved', member });
    } catch (error) {
        console.error('Error approving member:', error);
        res.status(500).json({ error: 'Failed to approve member' });
    }
});

// Get syndicate stats
router.get('/stats/overview', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!shouldUseDatabase()) {
            res.json({
                totalSyndicates: 0,
                openSyndicates: 0,
                fundedSyndicates: 0,
                totalRaised: 0,
                totalMembers: 0
            });
            return;
        }

        const [totalSyndicates, openSyndicates, fundedSyndicates, totalMembers] = await Promise.all([
            prismaReplica.syndicate.count(),
            prismaReplica.syndicate.count({ where: { status: 'OPEN' } }),
            prismaReplica.syndicate.count({ where: { status: 'FUNDED' } }),
            prismaReplica.syndicateMember.count({ where: { status: 'APPROVED' } })
        ]);

        const totalRaisedResult = await prismaReplica.syndicateMember.aggregate({
            where: { status: 'APPROVED' },
            _sum: { amount: true }
        });

        res.json({
            totalSyndicates,
            openSyndicates,
            fundedSyndicates,
            totalRaised: totalRaisedResult._sum.amount || 0,
            totalMembers
        });
    } catch (error) {
        console.error('Error fetching syndicate stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
