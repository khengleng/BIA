import express, { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { createPaymentIntent } from '../utils/stripe';

const router = Router();

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

export default router;
