import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { prisma } from '../database';
import { ai } from '../utils/ai';

const router = Router();

// Generate AI summary for a deal
router.post('/analyze/:dealId', authorize('deal.read'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { dealId } = req.params;

        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: { sme: true }
        });

        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        const [summary, riskAnalysis] = await Promise.all([
            ai.generateDealSummary({ deal, sme: deal.sme }),
            ai.analyzeDealRisks({ deal, sme: deal.sme })
        ]);

        return res.json({ summary, riskAnalysis });
    } catch (error) {
        console.error('AI Analysis Route Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Chat with Dataroom AI
router.post('/chat/:dealId', authorize('deal.read'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const { query } = req.body;

        const documents = await prisma.document.findMany({
            where: { dealId }
        });

        const answer = await ai.chatWithDataroom(query, documents);

        return res.json({ answer });
    } catch (error) {
        console.error('AI Chat Route Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
