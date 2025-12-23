import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

const router = Router();

// Get all deals
router.get('/', async (req: Request, res: Response) => {
  try {
    const deals = await prisma.deal.findMany({
      include: {
        sme: true,
        investors: {
          include: {
            investor: true
          }
        }
      }
    });
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

// Create new deal
router.post('/', async (req: Request, res: Response) => {
  try {
    const { smeId, title, description, amount, equity, successFee } = req.body;

    const deal = await prisma.deal.create({
      data: {
        smeId,
        title,
        description,
        amount: parseFloat(amount),
        equity: equity ? parseFloat(equity) : null,
        successFee: successFee ? parseFloat(successFee) : null,
        status: 'DRAFT',
        tenantId: 'default'
      },
      include: {
        sme: {
          include: {
            user: true
          }
        }
      }
    });

    res.status(201).json(deal);
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update deal
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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
