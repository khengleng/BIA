import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwt-auth';
import { prisma } from '../database';

const router = Router();

// Get matches
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;

        // Fetch SMEs and Investors for matching
        let smesQuery: any = { take: 10 };
        let investorsQuery: any = { take: 10 };

        if (role === 'SME') {
            smesQuery = { where: { userId: userId }, include: { deals: true } };
        } else if (role === 'INVESTOR') {
            investorsQuery = { where: { userId: userId } };
        }

        const [smes, investors] = await Promise.all([
            prisma.sME.findMany(smesQuery),
            prisma.investor.findMany(investorsQuery)
        ]);

        // If SME/INVESTOR has no profile yet, return empty
        if ((role === 'SME' || role === 'INVESTOR') && (smes.length === 0 && investors.length === 0)) {
            return res.json({ matches: [], stats: { totalPossibleMatches: 0, highScoreMatches: 0, mutualInterests: 0 } });
        }

        // Generate mock matches based on filtered entities
        // For ADVISOR, we show all SME-Investor combinations
        // For SME, we show them matched with all potential investors
        // For INVESTOR, we show them matched with all potential SMEs

        let matchSmes = smes;
        let matchInvestors = investors;

        if (role === 'SME') {
            // SME sees all investors matched to them
            matchInvestors = await prisma.investor.findMany({ take: 10 });
        } else if (role === 'INVESTOR') {
            // Investor sees all SMEs matched to them
            matchSmes = await prisma.sME.findMany({ take: 10 });
        } else if (role === 'ADVISOR' || role === 'ADMIN') {
            // Advisor sees everything
            matchSmes = await prisma.sME.findMany({ take: 5 });
            matchInvestors = await prisma.investor.findMany({ take: 5 });
        }

        const mockMatches = [];
        for (const sme of matchSmes) {
            for (const investor of matchInvestors) {
                // Calculate real-ish compatibility
                let baseScore = 60;
                const factors: any = {
                    sector: { score: 0, match: false, details: 'Sector mismatch' },
                    stage: { score: 0, match: false, details: 'Stage mismatch' },
                    certification: { score: sme.status === 'CERTIFIED' ? 100 : 0, match: sme.status === 'CERTIFIED', details: sme.status === 'CERTIFIED' ? 'Advisor Certified' : 'Pending Review' }
                };

                // Sector match
                // Note: assuming investor.preferences might contain preferred sectors
                const preferredSectors = (investor.preferences as any)?.preferredSectors || [];
                if (preferredSectors.includes(sme.sector)) {
                    baseScore += 15;
                    factors.sector = { score: 100, match: true, details: 'Perfect sector alignment' };
                }

                // Stage match
                if (sme.stage === 'GROWTH' || sme.stage === 'EXPANSION') {
                    baseScore += 10;
                    factors.stage = { score: 90, match: true, details: 'High-growth stage' };
                }

                // Random jitter
                const matchScore = Math.min(Math.max(baseScore + Math.floor(Math.random() * 10), 0), 99);

                mockMatches.push({
                    investor: {
                        id: investor.id,
                        name: investor.name,
                        type: investor.type
                    },
                    sme: {
                        id: sme.id,
                        name: sme.name,
                        sector: sme.sector,
                        stage: sme.stage,
                        status: sme.status,
                        score: sme.score
                    },
                    matchScore,
                    factors,
                    interestStatus: {
                        investorExpressedInterest: Math.random() > 0.8,
                        smeExpressedInterest: Math.random() > 0.8,
                        mutualInterest: false
                    }
                });
            }
        }

        // Filter mutual interest
        mockMatches.forEach(m => {
            if (m.interestStatus.investorExpressedInterest && m.interestStatus.smeExpressedInterest) {
                m.interestStatus.mutualInterest = true;
            }
        });

        const stats = {
            totalPossibleMatches: mockMatches.length,
            highScoreMatches: mockMatches.filter(m => m.matchScore >= 80).length,
            mediumScoreMatches: mockMatches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length,
            lowScoreMatches: mockMatches.filter(m => m.matchScore < 60).length,
            mutualInterests: mockMatches.filter(m => m.interestStatus.mutualInterest).length,
            pendingInterests: mockMatches.filter(m => m.interestStatus.investorExpressedInterest || m.interestStatus.smeExpressedInterest).length
        };

        return res.json({ matches: mockMatches, stats });
    } catch (error) {
        console.error('Error fetching matches:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a manual match
router.post('/match', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { smeId, investorId } = req.body;
        const role = req.user?.role;
        const tenantId = req.user?.tenantId;

        if (role !== 'ADVISOR' && role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only Advisors can create manual matches' });
        }

        // In a real system, we would create a Match record.
        // For now, we simulate success and return the match object.
        const [sme, investor] = await Promise.all([
            prisma.sME.findUnique({ where: { id: smeId } }),
            prisma.investor.findUnique({ where: { id: investorId } })
        ]);

        if (!sme || !investor) {
            return res.status(404).json({ error: 'SME or Investor not found' });
        }

        return res.json({
            message: 'Manual match created successfully',
            match: {
                smeId,
                investorId,
                status: 'ADVISOR_MATCHED',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error creating match:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify an automated match
router.post('/verify', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { matchId } = req.body;
        const role = req.user?.role;

        if (role !== 'ADVISOR' && role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only Advisors can verify matches' });
        }

        return res.json({
            message: 'Match verified successfully',
            matchId,
            verifiedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error verifying match:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
