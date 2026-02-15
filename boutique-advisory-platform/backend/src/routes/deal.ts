import { Router, Request, Response } from 'express';
import { prisma } from '../database';
import { validateBody, createDealSchema, updateDealSchema } from '../middleware/validation';
import { authorize, AuthenticatedRequest } from '../middleware/authorize';
import { sendNotification } from '../services/notification.service';

const router = Router();

// Get all deals
router.get('/', authorize('deal.list'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const tenantId = req.user?.tenantId;

    let query: any = {
      where: {
        tenantId: tenantId
      },
      include: {
        sme: true,
        investors: {
          include: {
            investor: true
          }
        }
      }
    };

    if (userRole === 'SME') {
      const sme = await prisma.sME.findUnique({ where: { userId: userId } });
      if (sme) {
        query.where.smeId = sme.id;
      } else {
        return res.json([]);
      }
    } else if (userRole === 'INVESTOR') {
      // Check if this investor also owns an SME
      const mySme = await prisma.sME.findUnique({ where: { userId: userId } });

      if (mySme) {
        // Investor sees PUBLISHED deals + their own DRAFT/etc deals
        query.where = {
          ...query.where,
          OR: [
            { status: 'PUBLISHED' },
            { smeId: mySme.id }
          ]
        };
      } else {
        // Standard investor only sees PUBLISHED
        query.where.status = 'PUBLISHED';
      }
    }

    const deals = await prisma.deal.findMany(query);
    return res.json(deals);
  } catch (error) {
    console.error('Get deals error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deal by ID
router.get('/:id', authorize('deal.read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        sme: {
          include: { user: true }
        },
        investors: {
          include: {
            investor: true
          }
        },
        documents: true
      }
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Ownership check for SME role
    if (userRole === 'SME' && deal.sme.userId !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only view your own deals' });
    }

    return res.json(deal);
  } catch (error) {
    console.error('Get deal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new deal - with input validation
router.post('/', authorize('deal.create'), validateBody(createDealSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { smeId, title, description, amount, equity, successFee, terms, isDocumentLocked } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Verify SME exists
    const sme = await prisma.sME.findUnique({ where: { id: smeId } });
    if (!sme) {
      return res.status(404).json({ error: 'SME not found' });
    }

    // Ownership check for SME role
    if (userRole === 'SME' && sme.userId !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only create deals for your own SME profile' });
    }

    const deal = await prisma.deal.create({
      data: {
        smeId,
        title,
        description,
        amount,
        equity: equity ?? null,
        successFee: successFee ?? null,
        terms,
        isDocumentLocked: isDocumentLocked || false,
        status: 'DRAFT',
        tenantId: sme.tenantId
      },
      include: {
        sme: {
          include: {
            user: true
          }
        }
      }
    });

    return res.status(201).json(deal);
  } catch (error) {
    console.error('Create deal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update deal - with input validation
router.put('/:id', authorize('deal.update'), validateBody(updateDealSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const updateData = req.body;

    // Check if deal exists
    const existingDeal = await prisma.deal.findUnique({
      where: { id },
      include: { sme: true }
    });
    if (!existingDeal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Ownership check for SME role
    if (userRole === 'SME' && existingDeal.sme.userId !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only update your own deals' });
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: {
        sme: true
      }
    });

    // --- NOTIFICATIONS ---
    if (updateData.status && updateData.status !== existingDeal.status) {
      const status = updateData.status;
      const smeUserId = deal.sme.userId;

      // 1. Notify SME Owner
      if (status === 'PUBLISHED') {
        await sendNotification(
          smeUserId,
          'Deal Published',
          `Your deal "${deal.title}" is now live and visible to investors!`,
          'DEAL_UPDATE',
          `/deals/${deal.id}`
        );

        // 2. Notify ALL Investors (Broadcast)
        // In a real app, filter by sector/preferences
        const investors = await prisma.user.findMany({
          where: { role: 'INVESTOR', status: 'ACTIVE' },
          select: { id: true }
        });

        for (const investor of investors) {
          await sendNotification(
            investor.id,
            'New Deal Opportunity',
            `New deal in ${deal.sme.sector}: ${deal.title}`,
            'DEAL_UPDATE',
            `/deals/${deal.id}`
          );
        }

      } else if (status === 'FUNDED') {
        await sendNotification(
          smeUserId,
          'Deal Funded!',
          `Congratulations! Your deal "${deal.title}" has been successfully funded.`,
          'DEAL_UPDATE',
          `/deals/${deal.id}`
        );
      } else if (status === 'CLOSED') {
        await sendNotification(
          smeUserId,
          'Deal Closed',
          `Your deal "${deal.title}" is now closed.`,
          'DEAL_UPDATE',
          `/deals/${deal.id}`
        );
      }
    }
    // ---------------------

    return res.json(deal);
  } catch (error) {
    console.error('Update deal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

