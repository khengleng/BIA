
import express, { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { createPaymentIntent } from '../utils/mock-payments';
import { createAbaTransaction, verifyAbaCallback, generateAbaQr } from '../utils/aba'; // Update import
import { prisma } from '../database';

const router = Router();

// ==================== MOCK PAYMENTS / LEGACY ====================

router.post('/create-payment-intent', authorize('payment.create'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { amount } = req.body;
        console.log('ℹ️  Legacy Create Payment Intent (Mocked):', amount);

        return res.json({
            clientSecret: 'mock_client_secret_' + Date.now(),
            paymentIntentId: 'mock_pi_' + Date.now(),
            mock: true,
            message: 'Stripe has been removed. Using internal mock payment flow.'
        });
    } catch (error: any) {
        console.error('Payment error:', error);
        return res.status(500).json({ error: 'Failed to create payment intent' });
    }
});



// ==================== ABA PAYWAY ====================

// 1. Create Transaction (Initiate Payment)
router.post('/aba/create-transaction', authorize('payment.create'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { amount, bookingId, dealInvestorId, items, returnUrl } = req.body;
        const user = req.user!;

        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        // Generate Short Transaction ID for ABA (Max 20 chars, e.g. 19 chars)
        const shortTranId = Date.now().toString() + Math.floor(100000 + Math.random() * 900000).toString();

        // Create Payment record
        const payment = await (prisma as any).payment.create({
            data: {
                tenantId: user.tenantId,
                userId: user.id,
                amount: parseFloat(amount),
                currency: 'USD',
                method: 'ABA_PAYWAY',
                provider: 'ABA',
                providerTxId: shortTranId, // Store ABA ID
                status: 'PENDING',
                bookingId: bookingId || null,
                dealInvestorId: dealInvestorId || null,
                description: `ABA Payment by ${user.email}`,
            }
        });

        // Generate ABA Request Data
        const abaRequest = createAbaTransaction(
            shortTranId,
            amount,
            items || [{ name: 'Advisory Service', quantity: 1, price: amount }],
            {
                firstName: user.email.split('@')[0], // Fallback if no specific name
                lastName: '',
                email: user.email,
                phone: '012000000' // TODO: Get from user profile if available
            },
            'abapay_khqr', // Default to KHQR
            returnUrl || 'http://localhost:3000/payments/success'
        );

        return res.json({
            paymentId: payment.id,
            abaUrl: process.env.ABA_PAYWAY_API_URL,
            abaRequest
        });

    } catch (error: any) {
        console.error('ABA Create Transaction Error:', error);
        if (error?.message?.includes('ABA PayWay is not configured')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. ABA Callback/Webhook (Moved to webhooks.ts)
// The callback logic resides in src/routes/webhooks.ts to allow public access.

// 3. Check Status (Authenticated)
router.get('/aba/status/:id', authorize('payment.read'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user!;

        const payment = await (prisma as any).payment.findUnique({
            where: { id }
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Ownership check
        if (payment.userId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        return res.json({ status: payment.status });
    } catch (error) {
        console.error('ABA Status Check Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Generate QR (Direct API)
router.post('/aba/generate-qr', authorize('payment.create'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { amount, bookingId, dealInvestorId, items } = req.body;
        const user = req.user!;

        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        // Generate Short Transaction ID
        const shortTranId = Date.now().toString() + Math.floor(100000 + Math.random() * 900000).toString();

        // Create Payment record
        const payment = await (prisma as any).payment.create({
            data: {
                tenantId: user.tenantId,
                userId: user.id,
                amount: parseFloat(amount),
                currency: 'USD',
                method: 'KHQR',
                provider: 'ABA',
                providerTxId: shortTranId,
                status: 'PENDING',
                bookingId: bookingId || null,
                dealInvestorId: dealInvestorId || null,
                description: `ABA QR Payment by ${user.email}`,
            }
        });

        // Call ABA API
        const userData = user as any;
        const qrResult = await generateAbaQr(
            shortTranId,
            parseFloat(amount),
            {
                firstName: userData.firstName || userData.email.split('@')[0],
                lastName: userData.lastName || 'User',
                email: userData.email,
                phone: userData.phone
            },
            items
        );

        if (qrResult && (qrResult as any).qrString) {
            return res.json({
                success: true,
                paymentId: payment.id,
                ...qrResult
            });
        } else {
            const errorInfo = qrResult as any;
            console.error('Failed to generate QR Code. ABA Info:', errorInfo);

            await (prisma as any).payment.update({
                where: { id: payment.id },
                data: {
                    status: 'FAILED',
                    description: `ABA Error: ${errorInfo?.raw?.description || 'Unknown Error'}`
                }
            });

            return res.status(400).json({
                error: 'ABA Payment Gateway Error',
                status: errorInfo?.raw?.status,
                description: errorInfo?.raw?.description || 'The payment gateway rejected the request. Check your Merchant ID and API Key.',
                message: errorInfo?.message // Internal message from axios if any
            });
        }

    } catch (error: any) {
        console.error('ABA Generate QR Route Error:', error.message);
        if (error?.message?.includes('ABA PayWay is not configured')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({
            error: 'Server Error',
            message: error.message,
            details: error.response?.data || 'No additional details'
        });
    }
});

export default router;
