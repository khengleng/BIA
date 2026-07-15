import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { prisma } from '../database';

const router = Router();

// Cap table for a deal: derives ownership from the round size (deal.amount),
// the equity sold (deal.equity %), and each committed investor's amount.
// Founders are assumed to hold the residual equity. This is the software half
// of "escrow + cap-table" — no bank/escrow dependency.
router.get('/:dealId', authorize('deal.read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { dealId } = req.params;
    const tenantId = req.user?.tenantId || 'default';

    const deal = await prisma.deal.findFirst({
      where: { id: dealId, tenantId },
      include: {
        sme: { select: { name: true } },
        investors: {
          where: { status: { in: ['APPROVED', 'COMPLETED'] } },
          include: { investor: { select: { name: true, type: true } } }
        }
      }
    });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const roundAmount = deal.amount || 0;
    const equityPct = typeof deal.equity === 'number' ? deal.equity : null;
    const committed = deal.investors.reduce((sum, i) => sum + (i.amount || 0), 0);

    // Post-money valuation is only meaningful when equity % is known and > 0.
    const postMoneyValuation = equityPct && equityPct > 0 ? roundAmount / (equityPct / 100) : null;
    const founderPct = equityPct != null ? Math.max(0, 100 - equityPct) : null;

    const shareholders = deal.investors.map((i) => {
      const amount = i.amount || 0;
      // Share of the round this investor holds, scaled by the equity sold.
      const roundShare = roundAmount > 0 ? amount / roundAmount : 0;
      const ownershipPct = equityPct != null ? parseFloat((roundShare * equityPct).toFixed(2)) : null;
      return {
        name: i.investor?.name || 'Investor',
        type: String(i.investor?.type || ''),
        amount,
        ownershipPct
      };
    }).sort((a, b) => b.amount - a.amount);

    return res.json({
      deal: {
        id: deal.id,
        title: deal.title,
        smeName: deal.sme?.name || deal.title,
        roundAmount,
        equityPct,
        committed,
        fundedPct: roundAmount > 0 ? parseFloat(((committed / roundAmount) * 100).toFixed(1)) : 0,
        postMoneyValuation
      },
      founders: founderPct != null ? { ownershipPct: parseFloat(founderPct.toFixed(2)) } : null,
      shareholders,
      // True when we lack the equity % needed to compute ownership percentages.
      amountsOnly: equityPct == null
    });
  } catch (error) {
    console.error('Cap table error:', error);
    return res.status(500).json({ error: 'Failed to build cap table' });
  }
});

export default router;
