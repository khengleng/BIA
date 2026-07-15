import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { prisma } from '../database';

const router = Router();

async function displayName(userId?: string): Promise<string> {
  if (!userId) return 'User';
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true, email: true } });
  if (!u) return 'User';
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  return name || u.email || 'User';
}

// List the Q&A thread for a deal (most recent first).
router.get('/:dealId', authorize('deal.read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { dealId } = req.params;
    const tenantId = req.user?.tenantId || 'default';
    const deal = await prisma.deal.findFirst({ where: { id: dealId, tenantId }, select: { id: true } });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const questions = await prisma.dealQuestion.findMany({
      where: { dealId },
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    const open = questions.filter(q => q.status === 'OPEN').length;
    return res.json({ dealId, total: questions.length, open, answered: questions.length - open, questions });
  } catch (error) {
    console.error('List deal Q&A error:', error);
    return res.status(500).json({ error: 'Failed to load questions' });
  }
});

// Ask a question on a deal.
router.post('/:dealId', authorize('deal.read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { dealId } = req.params;
    const tenantId = req.user?.tenantId || 'default';
    const userId = req.user?.id;
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
    if (!question) return res.status(400).json({ error: 'A question is required.' });
    if (question.length > 2000) return res.status(400).json({ error: 'Question is too long (max 2000 characters).' });

    const deal = await prisma.deal.findFirst({ where: { id: dealId, tenantId }, select: { id: true } });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const created = await prisma.dealQuestion.create({
      data: {
        tenantId,
        dealId,
        askedById: userId || 'unknown',
        askedByName: await displayName(userId),
        askedByRole: req.user?.role || 'USER',
        question,
        isPublic: req.body?.isPublic !== false,
        status: 'OPEN'
      }
    });
    return res.status(201).json(created);
  } catch (error) {
    console.error('Ask deal question error:', error);
    return res.status(500).json({ error: 'Failed to submit question' });
  }
});

// Answer a question (SME/advisor/admin — anyone with deal.update).
router.post('/:dealId/:questionId/answer', authorize('deal.update'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { dealId, questionId } = req.params;
    const tenantId = req.user?.tenantId || 'default';
    const userId = req.user?.id;
    const answer = typeof req.body?.answer === 'string' ? req.body.answer.trim() : '';
    if (!answer) return res.status(400).json({ error: 'An answer is required.' });
    if (answer.length > 4000) return res.status(400).json({ error: 'Answer is too long (max 4000 characters).' });

    const existing = await prisma.dealQuestion.findFirst({ where: { id: questionId, dealId, tenantId } });
    if (!existing) return res.status(404).json({ error: 'Question not found' });

    const updated = await prisma.dealQuestion.update({
      where: { id: questionId },
      data: {
        answer,
        answeredById: userId || 'unknown',
        answeredByName: await displayName(userId),
        status: 'ANSWERED',
        answeredAt: new Date()
      }
    });
    return res.json(updated);
  } catch (error) {
    console.error('Answer deal question error:', error);
    return res.status(500).json({ error: 'Failed to submit answer' });
  }
});

export default router;
