import { Router, Response } from 'express';
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

// Get investor portfolio analytics (REAL DATA)
router.get('/portfolio/stats', authorize('investor.read', { getOwnerId: (req) => req.user?.id }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Get investor profile
    const investor = await prisma.investor.findUnique({
      where: { userId }
    });

    if (!investor) {
      return res.status(404).json({ error: 'Investor profile not found' });
    }

    // 1. Get all completed/approved investments
    // We filter for investments that are effectively part of the portfolio
    // For MVP, APPROVED counts as "Active Position", COMPLETED counts as "Funded"
    const investments = await prisma.dealInvestor.findMany({
      where: {
        investorId: investor.id,
        status: { in: ['COMPLETED', 'APPROVED'] }
      },
      include: {
        deal: {
          include: {
            sme: true
          }
        }
      }
    });

    if (investments.length === 0) {
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

    // 2. Calculate Portfolio Metrics
    const totalAum = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const activePositions = investments.length;
    // Find the earliest investment date
    const startDate = investments.reduce((earliest, inv) => {
      return inv.createdAt < earliest ? inv.createdAt : earliest;
    }, new Date());

    // 3. Calculate Sector Allocation
    const sectorMap = new Map<string, number>();

    investments.forEach(inv => {
      const sector = inv.deal?.sme?.sector || 'General';
      const current = sectorMap.get(sector) || 0;
      sectorMap.set(sector, current + (inv.amount || 0));
    });

    const sectors = Array.from(sectorMap.entries()).map(([sector, amount]) => {
      const percentage = totalAum > 0 ? (amount / totalAum) * 100 : 0;

      return {
        sector,
        allocation: parseFloat(percentage.toFixed(1)),
        value: amount,
        color: getColorForSector(sector)
      };
    }).sort((a, b) => b.value - a.value);

    // 4. Format individual portfolio items
    const portfolioItems = investments.map(inv => {
      const percentage = totalAum > 0 ? (inv.amount / totalAum) * 100 : 0;

      return {
        id: inv.dealId,
        investmentId: inv.id, // Primary Key of DealInvestor
        name: inv.deal?.sme?.name || 'Unknown Company',
        sector: inv.deal?.sme?.sector || 'General',
        allocation: parseFloat(percentage.toFixed(1)),
        value: inv.amount,
        // Placeholder: Real ROI requires secondary market data or valuation updates
        returns: 0,
        color: getColorForSector(inv.deal?.sme?.sector || 'General')
      };
    });

    // 5. Calculate Realized ROI from Secondary Trades
    // Fetch all completed sales where this investor was the seller
    const completedSales = await prisma.secondaryTrade.findMany({
      where: {
        sellerId: investor.id,
        status: 'COMPLETED'
      }
    });

    let realizedRoi = 0;
    if (completedSales.length > 0) {
      const totalRevenue = completedSales.reduce((sum, trade) => sum + trade.totalAmount, 0);
      const totalCostBasis = completedSales.reduce((sum, trade) => sum + trade.shares, 0); // Assuming 1 share = $1 original value
      const totalFees = completedSales.reduce((sum, trade) => sum + trade.fee, 0);

      const netProfit = totalRevenue - totalCostBasis - totalFees;

      if (totalCostBasis > 0) {
        realizedRoi = parseFloat(((netProfit / totalCostBasis) * 100).toFixed(2));
      }
    }

    return res.json({
      summary: {
        totalAum,
        activePositions,
        realizedRoi,
        startDate
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

/*
[DEPRECATED] Verify Investor KYC (Mock)
This endpoint is disabled in production to enforce strict KYC via Sumsub/Stripe.
To re-enable for testing, uncomment below or set ENABLE_MOCK_KYC=true env var.

router.post('/:id/kyc', authorize('investor.verify'), async (req: AuthenticatedRequest, res: Response) => {
  // Mock logic removed for production safety
});
*/

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
          idNumber: encrypt(idNumber), // Always encrypt PII at rest
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

export default router;
