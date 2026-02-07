import { Router, Request, Response } from 'express';
import { prisma } from '../database';

const router = Router();

// Sumsub Webhook Handler (Public)
router.post('/sumsub', async (req: Request, res: Response) => {
    try {
        const signature = req.headers['x-payload-digest'];
        const body = req.body;

        console.log('🔍 Sumsub Webhook received:', JSON.stringify(body));

        if (!signature) {
            console.warn('⚠️ Missing Sumsub signature header');
            // In production, you would verify hmac with SUMSUB_SECRET_KEY
        }

        const { externalUserId, type, reviewStatus, reviewResult } = body;

        if (type === 'applicantStatusChanged') {
            let kycStatus = 'PENDING';

            if (reviewStatus === 'completed') {
                if (reviewResult?.reviewAnswer === 'GREEN') {
                    kycStatus = 'VERIFIED';
                } else if (reviewResult?.reviewAnswer === 'RED') {
                    kycStatus = 'REJECTED';
                }
            } else if (reviewStatus === 'pending') {
                kycStatus = 'UNDER_REVIEW';
            }

            console.log(`Updating KYC status for user ${externalUserId} to ${kycStatus}`);

            // externalUserId is our userId
            await prisma.investor.update({
                where: { userId: externalUserId },
                data: { kycStatus: kycStatus as any }
            });
        }

        return res.json({ ok: true });
    } catch (error) {
        console.error('Sumsub Webhook Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
