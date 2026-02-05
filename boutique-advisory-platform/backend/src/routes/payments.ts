import express, { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/jwt-auth';
import { createPaymentIntent } from '../utils/stripe';

const router = Router();

router.post('/create-payment-intent', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { amount, bookingId, serviceId } = req.body;

        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        const paymentIntent = await createPaymentIntent(amount);

        // Here we would typically record the pending payment in the DB

        return res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Payment error:', error);
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
