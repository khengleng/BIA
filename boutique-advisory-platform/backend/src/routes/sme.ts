import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

const router = Router();

// Get all SMEs
router.get('/', async (req: Request, res: Response) => {
  try {
    const smes = await prisma.sME.findMany({
      include: {
        user: true,
        deals: true
      }
    });
    return res.json(smes);
  } catch (error) {
    console.error('Get SMEs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get SME by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sme = await prisma.sME.findUnique({
      where: { id },
      include: {
        user: true,
        deals: true,
        documents: true
      }
    });
    
    if (!sme) {
      return res.status(404).json({ error: 'SME not found' });
    }
    
    return res.json(sme);
  } catch (error) {
    console.error('Get SME error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update SME
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const sme = await prisma.sME.update({
      where: { id },
      data: updateData,
      include: {
        user: true
      }
    });
    
    return res.json(sme);
  } catch (error) {
    console.error('Update SME error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
