
import express, { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { createPaymentIntent } from '../utils/stripe';
import { createAbaTransaction, verifyAbaCallback } from '../utils/aba';
import { prisma } from '../database';

const router = Router();

// ==================== STRIPE ====================

router.post('/create-payment-intent', authorize('payment.create'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { amount, bookingId, serviceId } = req.body;

        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        // Check if Stripe is configured
        const isStripeConfigured = process.env.STRIPE_SECRET_KEY &&
            process.env.STRIPE_SECRET_KEY !== 'sk_test_...' &&
            process.env.STRIPE_SECRET_KEY !== 'sk_test_mock';

        if (!isStripeConfigured) {
            // Mock payment for testing
            console.log('⚠️  Using MOCK payment (Stripe not configured)');
            console.log('💰 Mock payment:', { amount, bookingId, serviceId });

            return res.json({
                clientSecret: 'mock_client_secret_' + Date.now(),
                paymentIntentId: 'mock_pi_' + Date.now(),
                mock: true,
                message: 'Using mock payment. Configure STRIPE_SECRET_KEY for real payments.'
            });
        }

        // Real Stripe payment
        const paymentIntent = await createPaymentIntent(amount);

        return res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error: any) {
        console.error('Payment error:', error);

        // If Stripe fails due to config/auth, fallback to mock payment
        if (error.message?.includes('not configured') || error.message?.includes('authentication') || error.type === 'StripeAuthenticationError') {
            console.log('⚠️  Stripe error, falling back to MOCK payment');
            return res.json({
                clientSecret: 'mock_client_secret_' + Date.now(),
                paymentIntentId: 'mock_pi_' + Date.now(),
                mock: true,
                message: 'Using mock payment due to Stripe configuration error.'
            });
        }

        return res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

router.post('/webhook', async (req: express.Request, res: Response) => {
    // In a real app, verify Stripe signature here
    const event = req.body;

    console.log('💰 Received Stripe webhook:', event.type);

    // Handle specific events
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log('✅ Payment succeeded:', paymentIntent.id);
        // Update booking status in DB
    }

    return res.json({ received: true });
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
            abaUrl: process.env.ABA_PAYWAY_API_URL || 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase',
            abaRequest
        });

    } catch (error) {
        console.error('ABA Create Transaction Error:', error);
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

export default router;
