import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwt-auth';
import { prisma } from '../database';

const router = Router();

// Get matches
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;

        // Fetch SMEs and Investors to create mock matches
        const [smes, investors] = await Promise.all([
            prisma.sME.findMany({ take: 5 }),
            prisma.investor.findMany({ take: 5 })
        ]);

        const mockMatches = [];
        for (const sme of smes) {
            for (const investor of investors) {
                const matchScore = Math.floor(Math.random() * 40) + 60;
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
                        stage: sme.stage
                    },
                    matchScore,
                    factors: {
                        sector: { score: 90, match: true, details: 'Highly aligned with investor focus' },
                        stage: { score: 85, match: true, details: 'Target stage for investor portfolio' },
                        amount: { score: 70, match: true, details: 'Within investment range' },
                        geography: { score: 100, match: true, details: 'Local market proximity' },
                        certification: { score: 80, match: true, details: 'Passed initial advisory review' }
                    },
                    interestStatus: {
                        investorExpressedInterest: Math.random() > 0.7,
                        smeExpressedInterest: Math.random() > 0.7,
                        mutualInterest: false // Will be set to true if both are true above
                    }
                });
            }
        }

        // Update mutual interest
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

        res.json({ matches: mockMatches, stats });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
