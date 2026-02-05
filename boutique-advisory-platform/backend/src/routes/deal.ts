import { Router, Request, Response } from 'express';
import { prisma } from '../database';
import { validateBody, createDealSchema, updateDealSchema } from '../middleware/validation';

const router = Router();

// Get all deals
router.get('/', async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const tenantId = req.user?.tenantId;

    let query: any = {
      where: {
        tenantId: tenantId // Multi-tenant isolation
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
      // Find SME and their deals
      const sme = await prisma.sME.findUnique({ where: { userId: userId } });
      if (sme) {
        query.where.smeId = sme.id;
      } else {
        return res.json([]);
      }
    } else if (userRole === 'INVESTOR') {
      // Investors see published deals
      query.where.status = 'PUBLISHED';
    }
    // ADVISOR, ADMIN see all within tenant

    const deals = await prisma.deal.findMany(query);
    return res.json(deals);
  } catch (error) {
    console.error('Get deals error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deal by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        sme: true,
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

    return res.json(deal);
  } catch (error) {
    console.error('Get deal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new deal - with input validation
router.post('/', validateBody(createDealSchema), async (req: Request, res: Response) => {
  try {
    const { smeId, title, description, amount, equity, successFee } = req.body;

    // Verify SME exists
    const sme = await prisma.sME.findUnique({ where: { id: smeId } });
    if (!sme) {
      return res.status(404).json({ error: 'SME not found' });
    }

    const deal = await prisma.deal.create({
      data: {
        smeId,
        title,
        description,
        amount,
        equity: equity ?? null,
        successFee: successFee ?? null,
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
router.put('/:id', validateBody(updateDealSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if deal exists
    const existingDeal = await prisma.deal.findUnique({ where: { id } });
    if (!existingDeal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: {
        sme: true
      }
    });

    return res.json(deal);
  } catch (error) {
    console.error('Update deal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

