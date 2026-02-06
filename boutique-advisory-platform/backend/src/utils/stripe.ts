import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2023-10-16' as any,
});

export async function createPaymentIntent(amount: number, currency: string = 'usd') {
    try {
        // Check if Stripe is properly configured
        if (!process.env.STRIPE_SECRET_KEY ||
            process.env.STRIPE_SECRET_KEY === 'sk_test_...' ||
            process.env.STRIPE_SECRET_KEY === 'sk_test_mock') {
            throw new Error('Stripe is not configured. Please add a valid STRIPE_SECRET_KEY to your .env file. Get your key from https://dashboard.stripe.com/test/apikeys');
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        return paymentIntent;
    } catch (error: any) {
        console.error('Stripe error:', error);
        // Provide helpful error message
        if (error.message && error.message.includes('not configured')) {
            throw error; // Re-throw our custom error
        }
        throw new Error('Payment processing failed. Please contact support.');
    }
}

export async function createCheckoutSession(lineItems: any[], successUrl: string, cancelUrl: string) {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
        });
        return session;
    } catch (error) {
        console.error('Stripe error:', error);
        throw error;
    }
}
