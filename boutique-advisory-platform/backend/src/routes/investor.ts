import { Router, Request, Response } from 'express';
import { prisma } from '../database';
import { validateBody, updateInvestorSchema } from '../middleware/validation';
import { authorize, AuthenticatedRequest } from '../middleware/authorize';
import { kyc } from '../utils/stripe';
import { sumsub } from '../utils/sumsub';

import { encrypt, decrypt } from '../utils/encryption';

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

    // Sanitize sensitive preferences from list view
    const sanitizedInvestors = investors.map(inv => {
      const prefs: any = inv.preferences || {};
      // Remove sensitive PII from list view
      const { idNumber, ...safePrefs } = prefs;
      return { ...inv, preferences: safePrefs };
    });

    return res.json(sanitizedInvestors);
  } catch (error) {
    console.error('Get investors error:', error);
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

    // Decrypt sensitive data
    const prefs: any = investor.preferences || {};
    if (prefs.idNumber) {
      prefs.idNumber = decrypt(prefs.idNumber);
    }

    return res.json({ investor: { ...investor, preferences: prefs }, user: investor.user });
  } catch (error) {
    console.error('Get investor profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get investor portfolio analytics
router.get('/portfolio/stats', authorize('investor.read', { getOwnerId: (req) => req.user?.id }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Get investor profile with investments
    const investor = await prisma.investor.findUnique({
      where: { userId },
      include: {
        dealInvestments: {
          include: {
            deal: {
              include: {
                sme: true
              }
            }
          }
        }
      }
    });

    if (!investor) {
      return res.json({
        summary: {
          totalAum: 0,
          activePositions: 0,
          realizedRoi: 0,
          startDate: new Date()
        },
        sectors: [],
        items: []
      });
    }

    // Calculate Portfolio Metrics
    const investments = investor.dealInvestments;
    // Calculate total value based on invested amount
    const totalValue = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const activePositions = investments.filter(inv => ['APPROVED', 'COMPLETED', 'PENDING'].includes(inv.status)).length;

    // Calculate Sector Allocation
    const sectorMap = new Map<string, number>();

    investments.forEach(inv => {
      // Use dealing's SME sector or default
      const sector = inv.deal?.sme?.sector || 'General';
      const current = sectorMap.get(sector) || 0;
      sectorMap.set(sector, current + (inv.amount || 0));
    });

    const sectors = Array.from(sectorMap.entries()).map(([sector, amount]) => {
      // Avoid division by zero
      const percentage = totalValue > 0 ? (amount / totalValue) * 100 : 0;

      return {
        sector,
        allocation: parseFloat(percentage.toFixed(1)),
        value: amount,
        color: getColorForSector(sector)
      };
    }).sort((a, b) => b.value - a.value); // Sort by largest allocation

    // Format individual portfolio items for the list
    const portfolioItems = investments.map(inv => {
      const percentage = totalValue > 0 ? (inv.amount / totalValue) * 100 : 0;

      return {
        id: inv.dealId,
        name: inv.deal?.sme?.name || 'Unknown Company',
        sector: inv.deal?.sme?.sector || 'General',
        allocation: parseFloat(percentage.toFixed(1)),
        value: inv.amount,
        returns: calculateMockReturns(inv.amount, inv.status),
        color: getColorForSector(inv.deal?.sme?.sector || 'General')
      };
    });

    return res.json({
      summary: {
        totalAum: totalValue,
        activePositions,
        realizedRoi: 12.5, // Mocked for now
        startDate: investor.createdAt
      },
      sectors: sectors,
      items: portfolioItems
    });

  } catch (error) {
    console.error('Get portfolio stats error:', error);
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
    const isOwner = investor.userId === userId;
    if (userRole === 'INVESTOR' && !isOwner) {
      return res.status(403).json({ error: 'Access denied: You can only view your own investor profile' });
    }

    // Decrypt sensitive data only for owner or admin
    const prefs: any = investor.preferences || {};
    if (prefs.idNumber) {
      // Only decrypt if authorized to see detailed PII
      if (isOwner || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        prefs.idNumber = decrypt(prefs.idNumber);
      } else {
        // Mask it for others
        prefs.idNumber = '********';
      }
    }

    return res.json({ ...investor, preferences: prefs });
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

    // Encrypt sensitive fields if updated
    if (updateData.preferences) {
      if (updateData.preferences.idNumber) {
        updateData.preferences.idNumber = encrypt(updateData.preferences.idNumber);
      }
    }

    const investor = await prisma.investor.update({
      where: { id },
      data: updateData,
      include: {
        user: true
      }
    });

    // Don't return encrypted PII directly, decrypt it back for response
    const prefs: any = investor.preferences || {};
    if (prefs.idNumber) {
      prefs.idNumber = decrypt(prefs.idNumber);
    }

    return res.json({ ...investor, preferences: prefs });
  } catch (error) {
    console.error('Update investor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify Investor KYC (Mock)
router.post('/:id/kyc', authorize('investor.verify'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
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
          idNumber: encrypt(idNumber),
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



function getColorForSector(sector: string): string {
  const colors: any = {
    'Technology': 'bg-blue-500',
    'Fintech': 'bg-indigo-500',
    'Agriculture': 'bg-green-500',
    'Energy': 'bg-yellow-500',
    'Healthcare': 'bg-red-500',
    'Logistics': 'bg-purple-500',
    'Real Estate': 'bg-teal-500',
    'Education': 'bg-pink-500',
    'Manufacturing': 'bg-orange-500'
  };
  return colors[sector] || 'bg-gray-500';
}

function calculateMockReturns(amount: number, status: string): number {
  if (status === 'PENDING') return 0;
  // Generate a deterministic random-looking return based on amount
  const seed = (amount % 17) - 5;
  return parseFloat(seed.toFixed(1));
}

export default router;

