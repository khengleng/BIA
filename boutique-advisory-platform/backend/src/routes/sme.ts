import { Router, Request, Response } from 'express';
import { prisma } from '../database';
import { validateBody, updateSMESchema, idParamSchema, validateParams } from '../middleware/validation';
import { authorize, AuthenticatedRequest } from '../middleware/authorize';

const router = Router();

// Get all SMEs
router.get('/', authorize('sme.list'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const tenantId = req.user?.tenantId;

    let query: any = {
      where: {
        tenantId: tenantId
      },
      include: {
        user: true,
        deals: true
      }
    };

    // RBAC: SME can only see their own profile
    if (userRole === 'SME') {
      query.where.userId = userId;
    } else if (userRole === 'INVESTOR') {
      query.where.status = { in: ['CERTIFIED', 'SUBMITTED', 'UNDER_REVIEW'] };
    }

    const smes = await prisma.sME.findMany(query);
    return res.json(smes);
  } catch (error) {
    console.error('Get SMEs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get SME by ID
router.get('/:id', authorize('sme.read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

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

    // Explicit ownership check since authorize() level check for ':owner' might need pre-fetching
    if (userRole === 'SME' && sme.userId !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only view your own SME profile' });
    }

    return res.json(sme);
  } catch (error) {
    console.error('Get SME error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update SME - with input validation
router.put('/:id', authorize('sme.update'), validateBody(updateSMESchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const updateData = req.body;

    // Check if SME exists and ownership
    const existingSme = await prisma.sME.findUnique({ where: { id } });
    if (!existingSme) {
      return res.status(404).json({ error: 'SME not found' });
    }

    if (userRole === 'SME' && existingSme.userId !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only update your own SME profile' });
    }

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

// Delete SME
router.delete('/:id', authorize('sme.delete'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingSme = await prisma.sME.findUnique({ where: { id } });
    if (!existingSme) {
      return res.status(404).json({ error: 'SME not found' });
    }

    await prisma.sME.update({
      where: { id },
      data: { status: 'DELETED' as any }
    });

    return res.status(200).json({ message: 'SME soft deleted successfully' });
  } catch (error: any) {
    console.error('Delete SME error:', error);
    return res.status(500).json({ error: 'Failed to delete SME' });
  }
});

export default router;
