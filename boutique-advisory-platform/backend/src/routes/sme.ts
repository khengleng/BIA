import { Router, Request, Response } from 'express';
import { prisma } from '../database';
import { validateBody, updateSMESchema, idParamSchema, validateParams } from '../middleware/validation';

const router = Router();

// Get all SMEs
router.get('/', async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const tenantId = req.user?.tenantId;

    let query: any = {
      where: {
        tenantId: tenantId // Enforce multi-tenant isolation
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
      // Investors can see pending SMEs too (for visibility/transparency)
      query.where.status = { in: ['CERTIFIED', 'SUBMITTED', 'UNDER_REVIEW'] };
    }
    // ADVISOR, ADMIN can see all within tenant

    const smes = await prisma.sME.findMany(query);
    return res.json(smes);
  } catch (error) {
    console.error('Get SMEs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get SME by ID
router.get('/:id', async (req: any, res: Response) => {
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

    // RBAC: SME only see their own profile
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
router.put('/:id', validateBody(updateSMESchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log(`[SME Update] Updating SME ${id} with data:`, JSON.stringify(updateData, null, 2));

    // Check if SME exists
    const existingSme = await prisma.sME.findUnique({ where: { id } });
    if (!existingSme) {
      return res.status(404).json({ error: 'SME not found' });
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

export default router;

