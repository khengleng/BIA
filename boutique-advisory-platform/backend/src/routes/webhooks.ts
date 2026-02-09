import { Router, Request, Response } from 'express';
import { prisma } from '../database';
import * as crypto from 'crypto';
import { KYCStatus } from '@prisma/client';

const router = Router();

// Sumsub Webhook Handler (Public)
router.post('/sumsub', async (req: Request, res: Response) => {
    try {
        const signature = req.headers['x-payload-digest'];
        const algo = req.headers['x-payload-digest-alg']; // usually 'HMAC_SHA256_HEX'
        const body = req.body;
        const secret = process.env.SUMSUB_SECRET_KEY;

        console.log('🔍 Sumsub Webhook received');

        if (!secret) {
            console.error('❌ Sumsub secret key missing in backend env');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // 1. Verify Signature
        if (!signature || typeof signature !== 'string') {
            console.warn('⚠️ Missing or invalid Sumsub signature header');
            return res.status(401).json({ error: 'Unauthorized: Missing signature' });
        }

        const calculatedSignature = crypto
            .createHmac('sha256', secret)
            .update(req.rawBody || JSON.stringify(body))
            .digest('hex');

        if (!req.rawBody) {
            console.warn('⚠️ Sumsub webhook: rawBody not found, falling back to JSON.stringify (unsafe)');
        }

        // Note: For robust implementation in Express, we should ideally use the raw request body. 
        // If this fails, we may need to adjust app.ts to capture rawBody.

        // Let's assume for this "improvement" task we just implement the logic, but if we can't get raw body easily here without changing app.ts, 
        // we might have issues. However, `JSON.stringify` is a common approximation if the robust raw body isn't available.
        // Let's stick to the structure but acknowledge the raw body constraint.

        // Actually, to be safe without changing app.ts (which I can't seeing right now), let's implement it but log if mismatch.
        // But preventing the "Unauthorized" return if we aren't 100% sure about raw body might be safer for a 'fix', 
        // yet technically we SHOULD return 401. I'll implement the check.

        // Wait, I should import crypto if it's not imported. it is not imported in webhooks.ts

        // ... proceeding with logic ...

        // Security: Use timingSafeEqual to prevent timing attacks
        const digest = Buffer.from(signature, 'utf8');
        const checksum = Buffer.from(calculatedSignature, 'utf8');

        if (digest.length !== checksum.length || !crypto.timingSafeEqual(digest, checksum)) {
            console.warn('⚠️ Invalid Sumsub signature. Calculated:', calculatedSignature, 'Received:', signature);
            // UNCOMMENT TO ENFORCE: 
            return res.status(401).json({ error: 'Unauthorized: Invalid signature' });
        }

        const { externalUserId, type, reviewStatus, reviewResult } = body;

        if (type === 'applicantStatusChanged') {
            let kycStatus: KYCStatus = KYCStatus.PENDING;

            if (reviewStatus === 'completed') {
                if (reviewResult?.reviewAnswer === 'GREEN') {
                    kycStatus = KYCStatus.VERIFIED;
                } else if (reviewResult?.reviewAnswer === 'RED') {
                    kycStatus = KYCStatus.REJECTED;
                }
            } else if (reviewStatus === 'pending') {
                kycStatus = KYCStatus.UNDER_REVIEW;
            }

            console.log(`Updating KYC status for user ${externalUserId} to ${kycStatus}`);

            // externalUserId is our userId
            await prisma.investor.update({
                where: { userId: externalUserId },
                data: { kycStatus }
            });
        }

        return res.json({ ok: true });
    } catch (error) {
        console.error('Sumsub Webhook Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
