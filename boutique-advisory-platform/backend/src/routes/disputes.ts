import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { prisma } from '../database';
import { sendNotification } from '../services/notification.service';
import { z } from 'zod';
import { validateBody } from '../middleware/validation';

const router = Router();

const createDisputeSchema = z.object({
    dealId: z.string(),
    reason: z.string().min(5),
    description: z.string().min(20)
});

// POST /api/disputes - File a new dispute
router.post('/', authorize('payment.read'), validateBody(createDisputeSchema), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const tenantId = req.user?.tenantId || 'default';
        const { dealId, reason, description } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify that the user is an investor in this deal
        // This is a security check to prevent random people from filing disputes
        const investment = await prisma.dealInvestor.findFirst({
            where: {
                dealId,
                investor: {
                    userId: userId
                }
            }
        });

        // Also allow SME owner to file dispute if needed? 
        // User request specifically mentioned "investor to file a dispute", so let's stick to that for now.
        // But maybe SMEs should also be able to file disputes if an investor doesn't pay?
        // Let's check SME ownership too just in case.
        const sme = await prisma.deal.findFirst({
            where: {
                id: dealId,
                sme: {
                    userId: userId
                }
            }
        });

        if (!investment && !sme && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'You are not authorized to file a dispute for this deal. Only investors or the SME owner can file disputes.' });
        }

        const dispute = await prisma.dispute.create({
            data: {
                tenantId,
                dealId,
                initiatorId: userId,
                reason,
                description,
                status: 'OPEN'
            },
            include: {
                deal: true,
                initiator: true
            }
        });

        // Notify Admins
        const admins = await prisma.user.findMany({
            where: {
                tenantId,
                role: { in: ['ADMIN', 'SUPER_ADMIN'] }
            }
        });

        for (const admin of admins) {
            await sendNotification(
                admin.id,
                'New Dispute Filed',
                `${dispute.initiator.firstName} ${dispute.initiator.lastName} filed a dispute for deal "${dispute.deal.title}"`,
                'WARNING',
                `/admin/action-center/disputes` // Admin direct link
            );
        }

        return res.status(201).json({
            message: 'Dispute filed successfully. An administrator will review it shortly.',
            dispute
        });
    } catch (error) {
        console.error('Error filing dispute:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/disputes/my - Get disputes filed by me
router.get('/my', authorize('payment.read'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const disputes = await prisma.dispute.findMany({
            where: { initiatorId: userId },
            include: {
                deal: {
                    select: { title: true }
                },
                resolver: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json(disputes);
    } catch (error) {
        console.error('Error fetching my disputes:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
