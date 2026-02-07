import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { prisma } from '../database';

const router = Router();

// Refined scoring helper
const calculateMatchScore = (sme: any, investor: any) => {
    let score = 0;
    const factors: any = {};

    // 1. Sector Match (30 points)
    const preferredSectors = (investor.preferences as any)?.preferredSectors || [];
    if (preferredSectors.includes(sme.sector)) {
        score += 30;
        factors.sector = { score: 30, details: `Perfect alignment in ${sme.sector}` };
    } else {
        factors.sector = { score: 0, details: 'Sector mismatch' };
    }

    // 2. Stage Match (20 points)
    const preferredStages = (investor.preferences as any)?.preferredStages || [];
    if (preferredStages.includes(sme.stage)) {
        score += 20;
        factors.stage = { score: 20, details: `Aligned with ${sme.stage} stage` };
    } else {
        factors.stage = { score: 0, details: 'Stage mismatch' };
    }

    // 3. Investment Amount Fit (20 points)
    const minTicket = (investor.preferences as any)?.minInvestment || 0;
    const maxTicket = (investor.preferences as any)?.maxInvestment || 1000000000;
    if (sme.fundingRequired >= minTicket && sme.fundingRequired <= maxTicket) {
        score += 20;
        factors.funding = { score: 20, details: 'Funding requirement fits investor ticket size' };
    } else {
        factors.funding = { score: 0, details: 'Ticket size mismatch' };
    }

    // 4. Advisor Certification (15 points)
    if (sme.certified) {
        score += 15;
        factors.certification = { score: 15, details: 'SME is Advisor Certified (Proven Diligence)' };
    } else {
        factors.certification = { score: 0, details: 'Self-reported business data' };
    }

    // 5. Traction/Platform Score (15 points)
    const tractionContribution = Math.min((sme.score || 0) / 100 * 15, 15);
    score += Math.round(tractionContribution);
    factors.traction = { score: Math.round(tractionContribution), details: `Based on platform assessment score (${sme.score})` };

    return { score: Math.round(score), factors };
};

// Get matches
router.get('/', authorize('matchmaking.read'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;

        let matches: any[] = [];

        if (role === 'SME') {
            const sme = await prisma.sME.findUnique({ where: { userId } });
            if (!sme) return res.json({ matches: [], stats: {} });

            matches = await prisma.match.findMany({
                where: { smeId: sme.id },
                include: { investor: true, interests: true },
                orderBy: { score: 'desc' }
            });
        } else if (role === 'INVESTOR') {
            const investor = await prisma.investor.findUnique({ where: { userId } });
            if (!investor) return res.json({ matches: [], stats: {} });

            matches = await prisma.match.findMany({
                where: { investorId: investor.id },
                include: { sme: true, interests: true },
                orderBy: { score: 'desc' }
            });
        } else {
            // Admin/Advisor see all
            matches = await prisma.match.findMany({
                include: { sme: true, investor: true, interests: true },
                orderBy: { score: 'desc' },
                take: 50
            });
        }

        // Stats calculation
        const stats = {
            totalPossibleMatches: matches.length,
            highScoreMatches: matches.filter(m => m.score >= 80).length,
            mediumScoreMatches: matches.filter(m => m.score >= 50 && m.score < 80).length,
            mutualInterests: matches.filter(m => {
                const investorLiked = m.interests.some((i: any) => i.interest === true && i.userId === m.investor?.userId);
                const smeLiked = m.interests.some((i: any) => i.interest === true && i.userId === m.sme?.userId);
                return (investorLiked && smeLiked) || false;
            }).length
        };

        return res.json({ matches, stats });
    } catch (error) {
        console.error('Error fetching matches:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Trigger Re-computation
router.post('/recompute', authorize('matchmaking.create_match'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const smes = await prisma.sME.findMany();
        const investors = await prisma.investor.findMany();
        const tenantId = req.user?.tenantId || 'default';

        let count = 0;
        for (const sme of smes) {
            for (const investor of investors) {
                const { score, factors } = calculateMatchScore(sme, investor);

                await prisma.match.upsert({
                    where: {
                        smeId_investorId: {
                            smeId: sme.id,
                            investorId: investor.id
                        }
                    },
                    update: { score, factors: factors as any },
                    create: {
                        tenantId,
                        smeId: sme.id,
                        investorId: investor.id,
                        score,
                        factors: factors as any
                    }
                });
                count++;
            }
        }

        return res.json({ message: `Successfully recomputed ${count} matches` });
    } catch (error) {
        console.error('Error recomputing matches:', error);
        return res.status(500).json({ error: 'Failed to recompute matches' });
    }
});

// Express Interest
router.post('/:id/interest', authorize('matchmaking.express_interest'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { interest } = req.body; // true = like, false = dislike
        const matchId = req.params.id;
        const userId = req.user!.id;

        const updatedInterest = await prisma.matchInterest.upsert({
            where: {
                matchId_userId: { matchId, userId }
            },
            update: { interest },
            create: { matchId, userId, interest }
        });

        return res.json({ message: 'Interest recorded', interest: updatedInterest });
    } catch (error) {
        console.error('Error recording interest:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
