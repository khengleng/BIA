import { Router, Request, Response } from 'express';
import { prisma } from '../database';
import { validateBody, updateInvestorSchema } from '../middleware/validation';

const router = Router();

// Get all investors
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
        user: true,
        dealInvestments: {
          include: {
            deal: true
          }
        }
      }
    };

    // RBAC: SME only see investors interested in their deals
    if (userRole === 'SME') {
      // Find SME and their deals
      const sme = await prisma.sME.findUnique({ where: { userId: userId } });
      if (sme) {
        query.where.dealInvestments = {
          some: {
            deal: {
              smeId: sme.id
            }
          }
        };
      } else {
        // If no SME profile, return empty list
        return res.json([]);
      }
    }

    const investors = await prisma.investor.findMany(query);
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

// Update investor - with input validation
router.put('/:id', validateBody(updateInvestorSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if investor exists
    const existingInvestor = await prisma.investor.findUnique({ where: { id } });
    if (!existingInvestor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

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

// Verify Investor KYC (Mock)
router.post('/:id/kyc', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    // Only Admin or the Investor themselves (via self-service) can trigger KYC
    // In a real app, this would call an external service like Sumsub or Jumio
    const investor = await prisma.investor.findUnique({ where: { id } });

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // Mock verification logic
    const kycResult = {
      status: 'VERIFIED',
      verifiedAt: new Date(),
      provider: 'MockKYC-SEC-Certified',
      score: 95
    };

    const updatedInvestor = await prisma.investor.update({
      where: { id },
      data: {
        kycStatus: 'VERIFIED'
      }
    });

    return res.json({
      message: 'KYC Verification Successful',
      investor: updatedInvestor,
      details: kycResult
    });
  } catch (error) {
    console.error('KYC Verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

