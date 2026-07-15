import { Router, Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/authorize';
import { prisma } from '../database';

const router = Router();

// Get-or-create a stable, shareable referral code for a user.
async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, firstName: true }
  });
  if (user?.referralCode) return user.referralCode;

  const base = ((user?.firstName || 'BIA').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()) || 'BIA';
  for (let i = 0; i < 5; i++) {
    const code = `${base}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    try {
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      return code;
    } catch {
      // unique collision — try again with fresh randomness
    }
  }
  const fallback = crypto.randomBytes(5).toString('hex').toUpperCase();
  await prisma.user.update({ where: { id: userId }, data: { referralCode: fallback } });
  return fallback;
}

// Record a referral when a new user signs up with someone's code. Safe to call
// from the registration flow — never throws into the caller.
export async function recordReferralSignup(params: {
  code: string; refereeEmail: string; refereeUserId: string; tenantId: string;
}): Promise<void> {
  try {
    const code = params.code.trim().toUpperCase();
    if (!code) return;
    const referrer = await prisma.user.findUnique({ where: { referralCode: code }, select: { id: true } });
    if (!referrer || referrer.id === params.refereeUserId) return;
    await prisma.referral.create({
      data: {
        tenantId: params.tenantId,
        code,
        referrerId: referrer.id,
        refereeEmail: params.refereeEmail,
        refereeUserId: params.refereeUserId,
        status: 'SIGNED_UP'
      }
    });
  } catch (err) {
    console.error('recordReferralSignup failed (non-fatal):', err);
  }
}

// My referral code, shareable invite link, and the people I've referred.
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const code = await ensureReferralCode(userId);

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    const signedUp = referrals.length;
    const converted = referrals.filter(r => r.status === 'CONVERTED').length;

    const frontendUrl = (process.env.FRONTEND_URL || 'https://bia.cambobia.com').replace(/\/$/, '');
    const inviteLink = `${frontendUrl}/auth/register?ref=${code}`;

    return res.json({
      code,
      inviteLink,
      stats: { signedUp, converted, pending: signedUp - converted },
      referrals: referrals.map(r => ({
        refereeEmail: r.refereeEmail,
        status: r.status,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    return res.status(500).json({ error: 'Failed to load referrals' });
  }
});

export default router;
