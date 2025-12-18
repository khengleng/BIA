import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

const router = Router();

// Get all investors
router.get('/', async (req: Request, res: Response) => {
  try {
    const investors = await prisma.investor.findMany({
      include: {
        user: true,
        dealInvestments: true
      }
    });
    return res.json(investors);
  } catch (error) {
    console.error('Get investors error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get investor by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const investor = await prisma.investor.findUnique({
      where: { id },
      include: {
        user: true,
        dealInvestments: true
      }
    });
    
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    
    return res.json(investor);
  } catch (error) {
    console.error('Get investor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update investor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const investor = await prisma.investor.update({
      where: { id },
      data: updateData,
      include: {
        user: true
      }
    });
    
    return res.json(investor);
  } catch (error) {
    console.error('Update investor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
