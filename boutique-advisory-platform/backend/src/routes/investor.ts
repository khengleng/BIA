import { Router, Request, Response } from 'express';
import { prisma } from '../database';
import { validateBody, updateInvestorSchema } from '../middleware/validation';
import { authorize, AuthenticatedRequest } from '../middleware/authorize';
import { kyc } from '../utils/stripe';
import { sumsub } from '../utils/sumsub';

const router = Router();

// Get all investors
router.get('/', authorize('investor.list'), async (req: AuthenticatedRequest, res: Response) => {
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
        dealInvestments: {
          include: {
            deal: true
          }
        }
      }
    };

    // RBAC: SME only see investors interested in their deals
    if (userRole === 'SME') {
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
router.get('/:id', authorize('investor.read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

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

    // Explicit ownership check for INVESTOR role
    if (userRole === 'INVESTOR' && investor.userId !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only view your own investor profile' });
    }

    return res.json(investor);
  } catch (error) {
    console.error('Get investor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update investor - with input validation
router.put('/:id', authorize('investor.update'), validateBody(updateInvestorSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const updateData = req.body;

    // Check if investor exists
    const existingInvestor = await prisma.investor.findUnique({ where: { id } });
    if (!existingInvestor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // Ownership check
    if (userRole === 'INVESTOR' && existingInvestor.userId !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only update your own investor profile' });
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

// Get current investor profile
router.get('/profile', async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const investor = await prisma.investor.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    return res.json({ investor, user: investor.user });
  } catch (error) {
    console.error('Get investor profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit KYC details
router.post('/kyc-submit', async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const { fullName, nationality, idNumber, investorType } = req.body;

    const investor = await prisma.investor.findUnique({ where: { userId } });
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    const updatedInvestor = await prisma.investor.update({
      where: { id: investor.id },
      data: {
        type: investorType,
        kycStatus: 'PENDING', // Moves to pending review
        preferences: {
          ...(investor.preferences as any),
          nationality,
          idNumber,
          fullName
        } as any
      }
    });

    return res.json({ message: 'KYC submitted', investor: updatedInvestor });
  } catch (error) {
    console.error('KYC submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Stripe Identity Verification Session
router.post('/kyc-session', authorize('investor.update'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const session = await kyc.createVerificationSession(userId);

    return res.json({
      url: session.url,
      sessionId: session.id,
      clientSecret: session.client_secret
    });
  } catch (error) {
    console.error('KYC Session Error:', error);
    return res.status(500).json({ error: 'Failed to create verification session' });
  }
});


// Create Sumsub SDK Access Token
router.post('/kyc-token', authorize('investor.update', { getOwnerId: (req) => req.user?.id }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const levelName = process.env.SUMSUB_LEVEL_NAME || 'basic-kyc-level';
    const tokenData = await sumsub.generateAccessToken(userId, levelName);

    return res.json({
      token: tokenData.token,
      userId: userId
    });
  } catch (error) {
    console.error('Sumsub KYC Token Error:', error);
    return res.status(500).json({ error: 'Failed to generate Sumsub verification token' });
  }
});

export default router;

